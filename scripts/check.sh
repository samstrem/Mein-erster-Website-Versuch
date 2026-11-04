#!/usr/bin/env bash
# Prüft die Website auf Verstöße gegen die Regeln in CLAUDE.md (DSGVO, OWASP-Grundlagen).
#
#   bash scripts/check.sh            Arbeitsverzeichnis prüfen
#   bash scripts/check.sh --staged   wie oben, plus Prüfung der Versionsnummern (pre-commit-Hook)
#   bash scripts/check.sh --ci       wie oben, plus gesamte Git-Historie (GitHub Actions)
#
# Fehler (✗) blockieren mit Exit-Code 1, Warnungen (!) nicht.
# Fundstellen mit personenbezogenen Daten oder Secrets werden nur als Datei:Zeile ausgegeben,
# damit sie nicht in Terminal- oder CI-Logs landen.

set -u
MODE="${1:-}"
cd "$(git rev-parse --show-toplevel)" || exit 2

ERRORS=0
WARNINGS=0
fail()    { printf '  ✗ %s\n' "$1"; ERRORS=$((ERRORS + 1)); }
warn()    { printf '  ! %s\n' "$1"; WARNINGS=$((WARNINGS + 1)); }
ok()      { printf '  ✓ %s\n' "$1"; }
section() { printf '\n%s\n' "$1"; }

# report <fail|warn> <show|hide> <Regel> <Fundstellen>
# hide: nur Datei:Zeile ausgeben (für personenbezogene Daten und Secrets)
report() {
    local level="$1" show="$2" desc="$3" hits="$4"
    if [ -z "$hits" ]; then
        ok "$desc"
        return
    fi
    "$level" "$desc"
    if [ "$show" = "hide" ]; then
        printf '%s\n' "$hits" | cut -d: -f1,2 | sort -u | head -5 | sed 's/^/      /'
    else
        printf '%s\n' "$hits" | head -5 | sed 's/^/      /'
    fi
}

# scan <fail|warn> <show|hide> <Regel> <Regex> <Dateien...>
scan() {
    local level="$1" show="$2" desc="$3" re="$4"
    shift 4
    [ "$#" -eq 0 ] && return
    report "$level" "$show" "$desc" "$(grep -nEH -- "$re" "$@" 2>/dev/null </dev/null)"
}

# ---------------------------------------------------------------- Dateilisten
ALL=(); HTML=(); JS=(); CSS=(); TEXT=()
while IFS= read -r f; do
    [ -f "$f" ] && ALL+=("$f")
done < <(git ls-files -co --exclude-standard)

for f in "${ALL[@]}"; do
    [ "$f" = "scripts/check.sh" ] && continue
    case "$f" in
        google*.html)  TEXT+=("$f") ;;                  # Search-Console-Datei, keine eigene Seite
        *.html)        HTML+=("$f"); TEXT+=("$f") ;;
        *.js)          JS+=("$f");   TEXT+=("$f") ;;
        *.css)         CSS+=("$f");  TEXT+=("$f") ;;
        *.md|*.txt|*.xml|*.webmanifest|*.json|*.yml|*.yaml|*.sh|CNAME|.githooks/*|.gitignore|.gitattributes)
                       TEXT+=("$f") ;;
    esac
done

Q="[\"']?"

# ---------------------------------------------------------------- 1. CSP
section "Content-Security-Policy"
FIRST_CSP=""; FIRST_FILE=""
for f in "${HTML[@]}"; do
    tag="$(grep -oiE '<meta[^>]*http-equiv="Content-Security-Policy"[^>]*>' "$f" | head -1)"
    if [ -z "$tag" ]; then fail "$f: keine Content-Security-Policy"; continue; fi
    csp="$(printf '%s' "$tag" | sed -E 's/.*content="([^"]*)".*/\1/')"
    if [ -z "$FIRST_CSP" ]; then
        FIRST_CSP="$csp"; FIRST_FILE="$f"
    elif [ "$csp" != "$FIRST_CSP" ]; then
        fail "$f: CSP weicht von $FIRST_FILE ab (muss in allen Seiten identisch sein)"
    fi
    for d in "default-src 'self'" "object-src 'none'" "base-uri 'none'" "form-action 'none'"; do
        case "$csp" in *"$d"*) ;; *) fail "$f: CSP enthält nicht \"$d\"" ;; esac
    done
    if printf '%s' "$csp" | grep -qE "unsafe-(inline|eval)|(^|[ ;])\*([ ;]|$)|https?:|data:"; then
        fail "$f: CSP erlaubt unsafe-inline, unsafe-eval, Wildcards, http(s): oder data:"
    fi
done
[ "$ERRORS" -eq 0 ] && ok "CSP vorhanden, streng und in allen ${#HTML[@]} Seiten identisch"

# ---------------------------------------------------------------- 2. Externe Verbindungen
section "Keine Verbindungen zu Dritten (DSGVO)"
scan fail show "Keine externen Ressourcen in HTML (src, action, srcset)" "(src|action|poster|srcset|data)=${Q}(https?:)?//" "${HTML[@]}"
scan fail show "Keine externen Stylesheets oder Icons (link href)"       "<link[^>]*href=${Q}(https?:)?//"                  "${HTML[@]}"
scan fail show "Keine externen Ressourcen in CSS"                       "(url\(|@import)[^;)]*(https?:)?//"                "${CSS[@]}"
scan fail show "JavaScript sendet keine Netzwerkanfragen"                "fetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource" "${JS[@]}"
scan fail show "Keine URLs in JavaScript"                                "https?://"                                        "${JS[@]}"
scan fail show "Keine Formulare, iframes, embeds oder objects (nur nach Freigabe)" "<(form|iframe|embed|object|frame)[ >]" "${HTML[@]}"

# ---------------------------------------------------------------- 3. Inline-Code
section "Kein Inline-Code (XSS-Schutz, CSP)"
inline_scripts=""
for f in "${HTML[@]}"; do
    inline_scripts+="$(grep -noEH '<script[^>]*>' "$f" | grep -vE 'src=')"$'\n'
done
report fail show "Keine Inline-Skripte" "$(printf '%s' "$inline_scripts" | sed '/^$/d')"
scan fail show "Keine <style>-Blöcke, Inline-Styles, Event-Handler oder javascript:-URLs" "<style|[[:space:]]style=|[[:space:]]on[a-z]+=|javascript:" "${HTML[@]}"

# ---------------------------------------------------------------- 4. Gefährliche JS-Konstrukte
section "Sichere JavaScript-Muster (OWASP)"
DANGER="innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(|new Function|set(Timeout|Interval)\(${Q}[\"']"
scan fail show "Kein innerHTML, eval, document.write oder String-Timer" "$DANGER" "${JS[@]}"
scan warn show "URL-Parameter, Cookies oder Browser-Speicher: XSS und Einwilligung prüfen" "location\.(search|hash)|URLSearchParams|document\.(cookie|referrer)|localStorage|sessionStorage|indexedDB" "${JS[@]}"

# ---------------------------------------------------------------- 5. Externe Links
section "Externe Links"
blank_hits=""
for f in "${HTML[@]}"; do
    blank_hits+="$(grep -noEH "<a [^>]*target=${Q}_blank${Q}[^>]*>" "$f" | grep -v 'rel="noopener noreferrer"')"$'\n'
done
report fail show 'target="_blank" immer mit rel="noopener noreferrer"' "$(printf '%s' "$blank_hits" | sed '/^$/d')"

# ---------------------------------------------------------------- 6. Personenbezogene Daten und Secrets
section "Personenbezogene Daten und Secrets"
PH_INTL='(^|[^0-9A-Za-z.])(\+[0-9]{1,3}|00[0-9]{1,3})[ ./-]?\(?[0-9]{1,4}\)?([ ./-]?[0-9]{2,}){2,}'
PH_LOCAL='(^|[^0-9A-Za-z.])0[1-9][0-9]{1,3}[ /-][0-9]{3,}([ /-]?[0-9]{2,})*'
SECRETS="AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{32,}"
SECRET_ASSIGN="(api[_-]?key|secret|passwd|password|token)[\"']?[[:space:]]*[:=][[:space:]]*[\"'][^\"']{8,}[\"']"

scan fail hide "Keine Telefonnummern" "$PH_INTL|$PH_LOCAL" "${TEXT[@]}"
report fail hide "Keine E-Mail-Adressen (außer example.* und GitHub-noreply)" \
    "$(grep -nEHo '[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}' "${TEXT[@]}" </dev/null 2>/dev/null \
        | grep -viE '@(example\.(com|org|net|invalid)|users\.noreply\.github\.com|noreply\.github\.com)$' \
        | grep -vE '@[0-9]x\.')"
scan fail hide "Keine Zugangsdaten oder API-Schlüssel" "$SECRETS" "${TEXT[@]}"
scan fail hide "Keine Zuweisungen wie password=\"…\" oder token: \"…\"" "$SECRET_ASSIGN" "${TEXT[@]}"
report fail show "Keine Schlüssel- oder .env-Dateien im Repo" \
    "$(printf '%s\n' "${ALL[@]}" | grep -E '(^|/)(\.env(\..*)?|id_(rsa|ed25519)|.*\.(pem|key|p12|pfx))$')"

# ---------------------------------------------------------------- 7. Repo-Hygiene
section "Repo-Hygiene"
if git ls-files --error-unmatch CLAUDE.local.md >/dev/null 2>&1; then
    fail "CLAUDE.local.md ist im Repo (private Notizen dürfen nie veröffentlicht werden)"
elif git check-ignore -q CLAUDE.local.md; then
    ok "CLAUDE.local.md ist von Git ausgeschlossen"
else
    fail "CLAUDE.local.md steht nicht in .gitignore"
fi
if [ "$MODE" != "--ci" ]; then
    email="$(git config user.email)"
    case "$email" in
        *@users.noreply.github.com) ok "Commit-Autor ist eine GitHub-noreply-Adresse" ;;
        *) fail "git user.email ist keine GitHub-noreply-Adresse (Privat-E-Mail würde veröffentlicht)" ;;
    esac
fi

# ---------------------------------------------------------------- 8. Cache-Busting
section "Cache-Busting (?v=)"
for asset in 'assets/css/style\.css' 'assets/js/main\.js'; do
    versions="$(grep -ohE "${asset}\?v=[0-9]+" "${HTML[@]}" 2>/dev/null </dev/null | sort -u)"
    count="$(printf '%s\n' "$versions" | grep -c .)"
    if [ "$count" -gt 1 ]; then
        fail "${asset//\\/}: uneinheitliche Versionsnummern in den HTML-Dateien"
    else
        ok "${asset//\\/}: einheitliche Versionsnummer"
    fi
done
if [ "$MODE" = "--staged" ]; then
    staged="$(git diff --cached --name-only)"
    for pair in "assets/css/style.css:style\.css" "assets/js/main.js:main\.js"; do
        file="${pair%%:*}"; pat="${pair##*:}"
        if printf '%s\n' "$staged" | grep -qx "$file" \
            && ! git diff --cached -U0 -- '*.html' | grep -qE "^\+.*${pat}\?v="; then
            warn "$file wurde geändert, aber die ?v=-Nummer in den HTML-Dateien nicht erhöht"
        fi
    done
fi

# ---------------------------------------------------------------- 9. Pflichtseiten
section "Pflichtseiten (Hinweis, blockiert nicht)"
grep -qil 'impressum' "${HTML[@]}" 2>/dev/null </dev/null || warn "Kein Impressum auf der Seite gefunden (Rechtslage klären)"
grep -qil 'datenschutz' "${HTML[@]}" 2>/dev/null </dev/null || warn "Keine Datenschutzerklärung auf der Seite gefunden (Rechtslage klären)"

# ---------------------------------------------------------------- 10. Historie (nur CI)
if [ "$MODE" = "--ci" ]; then
    section "Git-Historie"
    report fail hide "Keine Telefonnummern oder Secrets in der Historie (Commit-Hashes)" \
        "$(git log --all --format='%h' -G "$PH_INTL|$PH_LOCAL|$SECRETS" 2>/dev/null | sed 's/$/:0/')"
fi

# ---------------------------------------------------------------- Ergebnis
printf '\n'
if [ "$ERRORS" -gt 0 ]; then
    printf 'Ergebnis: %d Fehler, %d Warnungen. Commit/Build wird blockiert.\n' "$ERRORS" "$WARNINGS"
    exit 1
fi
printf 'Ergebnis: keine Fehler, %d Warnungen.\n' "$WARNINGS"
exit 0
