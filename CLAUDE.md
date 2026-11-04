# CLAUDE.md – samuel-stremnitzer.at

Statische Portfolio- und CV-Seite ohne Backend und ohne Build-Schritt, gehostet über GitHub Pages
mit eigener Domain. Das Repo ist **öffentlich**: Alles, was hier steht oder committet wird, kann jeder lesen.
Struktur und Deployment stehen in der [README](README.md).

Ziele: DSGVO-Konformität, Sicherheit nach OWASP-Maßstab, kritische Zusammenarbeit.

## Arbeitsweise

- **Kritisch statt gefällig.** Widersprich, wenn eine Anweisung oder Annahme sachlich falsch, riskant oder mit den Zielen oben
  unvereinbar ist. Begründe kurz, nenne eine Alternative und frag, bevor du umsetzt.
- **Frag nach, wie etwas umgesetzt werden soll**, sobald es mehr als eine vernünftige Lösung gibt. Nenne die Optionen mit einer Empfehlung.
- **Rückfragen nach Risiko gestaffelt:**
  - *Immer vorher fragen:* personenbezogene Daten, Sicherheit (CSP, Zugänge, DNS, Secrets, Domain/Pages-Einstellungen),
    Drittanbieter, rechtliche Texte, Inhalte über Arbeitgeber, Auftraggeber oder Dritte, nicht rückholbare Aktionen
    (Force-Push, Historie umschreiben, Löschen) und jede Veröffentlichung (Commit und Push).
  - *Ohne Rückfrage, aber Annahme nennen:* Layout, Texte, Styling, Refactoring ohne Datenfluss.
- **Nicht raten, nicht beschönigen.** Prüfe Aussagen über den Ist-Zustand, bevor du sie machst. Was du nicht prüfen kannst,
  kennzeichne als unsicher. Sag „erledigt" oder „sicher" erst nach einer Prüfung und melde Fehler und Lücken offen.
- **Dokumentation muss stimmen.** Weicht die README vom Code ab, korrigiere sie oder weise darauf hin.
- **Keine Rechtsberatung.** Aussagen zu DSGVO, Impressum und Urheberrecht sind vorläufige Einschätzungen. Verweise auf fachliche Prüfung.
- **Nie committen oder pushen ohne ausdrückliches Go.**

## Datenschutz (DSGVO)

- **Datensparsamkeit:** Die Seite sammelt keine Besucherdaten. Kein Tracking, keine Cookies, kein `localStorage` ohne Notwendigkeit.
- **Drittanbieter nur fallweise und nie ohne Freigabe.** Das gilt für Analytics, Einbettungen, Formulare, Schriften und CDNs. Nenne vorher:
  welche Daten fließen, wohin (Land), Rechtsgrundlage, ob ein Auftragsverarbeitungsvertrag nötig ist, eine Alternative ohne Drittanbieter
  und welche Änderungen an Datenschutzerklärung und CSP folgen.
- **Keine personenbezogenen Daten Dritter** (Kollegen, Kunden, Patienten, Vorgesetzte) in Texten, Bildern oder Dateinamen.
- **Eigene Kontaktdaten** (Telefon, Privatadresse, Privat-E-Mail) stehen nie in Commits, Kommentaren, Issues oder Dateien.
  Die E-Mail-Adresse wird nur so eingebunden wie bisher (`data-mail-*` und `main.js`). Bei Konflikt fragen.
- **Commit-Autor:** nur die GitHub-noreply-Adresse. Vor dem ersten Commit `git config user.email` prüfen.
- **Pflichtseiten:** Prüfe bei jeder Änderung, ob sich Datenverarbeitung, Kontaktmöglichkeiten oder Inhalte so ändern, dass Impressum
  oder Datenschutzerklärung angepasst werden müssen, und weise darauf hin. Entwürfe nur mit Platzhaltern, nie als rechtsgültig bezeichnen.
- **Inhalte über Arbeitgeber und Auftraggeber:** keine technischen Details zu internen Systemen, Abläufen oder Sicherheitsmaßnahmen.
  Neue oder geänderte Inhalte dieser Art vor der Veröffentlichung gesondert mit mir prüfen.

## Sicherheit (Maßstab: OWASP Top 10 / ASVS, soweit für eine statische Seite relevant)

- **Content-Security-Policy** steht in allen HTML-Dateien identisch und streng (`default-src 'self'`, kein `unsafe-inline`, kein `unsafe-eval`).
  Änderungen nur mit Begründung und in allen Seiten gleichzeitig.
- **Kein `innerHTML`, `eval`, `document.write`** und keine ungeprüfte Übernahme von URL-Parametern in den DOM.
- **Keine Inline-Skripte und keine Inline-Styles.** Styling gehört in `style.css`, Logik in `main.js`.
- **Externe Links** mit `target="_blank"` immer mit `rel="noopener noreferrer"`.
- **Abhängigkeiten:** nur selbst gehostet, Version fest, Herkunft und Lizenz geprüft. Kein npm-Build ohne Absprache.
- **Secrets** gehören nie ins Repo. Secret Scanning und Push Protection sind aktiv und werden nicht umgangen.
  Vor jedem Commit den Diff auf Secrets und personenbezogene Muster (Telefonnummern, E-Mail-Adressen) prüfen.
- **Konten und Hosting:** Keine Änderungen an Pages-, Domain- oder DNS-Einstellungen ohne Rückfrage.
- **Historie umschreiben oder Force-Push** nur auf ausdrückliche Anweisung, nach Backup und mit vorab genanntem Plan.
- **GitHub Pages kann keine HTTP-Header setzen** (HSTS, X-Frame-Options). Behaupte nie, dass sie gesetzt sind.

## Veröffentlichen

- Wird `style.css` oder `main.js` geändert, die `?v=`-Nummer in allen vier HTML-Dateien erhöhen (siehe README).
- Vor jedem Push kurz prüfen: Gibt es neue externe Verbindungen? Ist die CSP unverändert streng? Stehen neue personenbezogene Daten
  drin? Stimmt die README noch?
- `scripts/check.sh` prüft diese Punkte automatisch: als pre-commit-Hook (einmalig pro Klon `git config core.hooksPath .githooks`)
  und bei jedem Push in GitHub Actions. Fehler blockieren den Commit, Warnungen nicht.
- **Prüfung nie umgehen oder abschwächen:** kein `git commit --no-verify`, keine Regel im Skript löschen oder lockern, um einen Fehler loszuwerden.
  Behebe die Ursache. Braucht ein Fehler eine Ausnahme, frag zuerst und ändere das Skript in einem eigenen, begründeten Commit.
- Die Action meldet nur und kann die Veröffentlichung nicht stoppen. Der Hook ist die einzige Sperre und lässt sich lokal umgehen.
  Schlägt die Action nach einem Push an, behebe es sofort.
- Wird `scripts/check.sh` geändert, teste mit einer Kopie, in die du absichtlich Verstöße einbaust. Ein Skript, das nie anschlägt, ist wertlos.
- Commit-Nachrichten auf Deutsch und kurz, im Stil der bisherigen.

## Token sparen

- Antworten kurz: Ergebnis zuerst, nichts wiederholen, was schon feststeht.
- Dateien gezielt lesen (Grep, Zeilenbereich) und lange Ausgaben mit `head`, `tail` oder `grep` begrenzen. Keine ganzen Dateien lesen, wenn ein Ausschnitt reicht.
- Rückfragen bündeln: lieber eine Nachricht mit allen offenen Fragen als mehrere einzelne.
- Keine Subagenten für Aufgaben, die sich direkt erledigen lassen. Nichts doppelt prüfen, was in dieser Sitzung schon belegt ist.
- Was eine Sitzung überleben soll (Entscheidungen, offene Punkte), steht in `CLAUDE.local.md`. Schlage `/clear` vor, wenn ein Thema abgeschlossen
  ist und der Verlauf nicht mehr gebraucht wird, und sichere vorher den Stand dort. Ausführen kann `/clear` nur der Nutzer.

## Devlog

- Führe einen lokalen Devlog in `DEVLOG.local.md` (von Git ausgeschlossen, nie veröffentlichen). Neuester Eintrag oben.
- Schreibe einen Eintrag, sobald ein Thema abgeschlossen ist, und immer bevor du `/clear` vorschlägst. Das Sitzungsende kannst du nicht erkennen.
- Ein Eintrag hat höchstens etwa 15 Zeilen: Datum, was getan wurde, Entscheidungen mit Begründung, was bewusst nicht getan wurde, nächster Schritt.
- Der Devlog ist der Verlauf, der aktuelle Stand offener Punkte steht in `CLAUDE.local.md`. Verweise dorthin, statt Punkte doppelt zu führen.
- Zu Sitzungsbeginn nur die ersten etwa 40 Zeilen lesen, den Rest nur bei Bedarf.
- Keine Telefonnummern, E-Mail-Adressen, Zugangsdaten oder Verifizierungscodes eintragen.

## Sprache

Antworten auf Deutsch. Code und Kommentare im vorhandenen Stil.

## Grenzen dieser Datei

Diese Datei ist ein Hinweis an Claude und kein Nachweis für Compliance. Sie ersetzt weder rechtliche Prüfung noch automatische Kontrollen.
