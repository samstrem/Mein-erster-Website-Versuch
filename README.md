# samuel-stremnitzer.at

Persönliche Website von Samuel Stremnitzer – Digital Business Student & Process Analyst.

**Live:** https://samuel-stremnitzer.at (gehostet über GitHub Pages)

## Struktur

```
├── index.html            Startseite
├── projekte.html         Ausgewählte Projekte & Zertifizierung
├── cv.html               Lebenslauf
├── contact.html          Kontaktformular (Formspree)
│
├── assets/
│   ├── css/style.css     Komplettes Styling
│   ├── js/main.js        Animationen, aktive Navigation, Formularversand
│   ├── img/              Logo und Fotos
│   └── icons/            Favicons & App-Icons
│
├── favicon.ico           Muss im Root liegen (Browser fragen /favicon.ico direkt ab)
├── site.webmanifest      App-Icons für Android
├── CNAME                 Eigene Domain für GitHub Pages
├── robots.txt / sitemap.xml
└── google…html           Google-Search-Console-Verifizierung (nicht löschen)
```

## Änderungen veröffentlichen

1. Lokal bearbeiten und im Browser prüfen (`index.html` öffnen).
2. Wenn `style.css` oder `main.js` geändert wurden: die Versionsnummer in allen
   vier HTML-Dateien erhöhen (`style.css?v=3` → `?v=4`), damit Browser nicht die
   alte, zwischengespeicherte Version verwenden.
3. Committen und pushen – GitHub Pages ist nach 1–2 Minuten aktualisiert.

> Nur lokal arbeiten, nicht zusätzlich direkt auf GitHub editieren – sonst entstehen Merge-Konflikte.

## Sicherheit

- Jede Seite hat eine **Content-Security-Policy** (`<meta http-equiv="Content-Security-Policy">`): Es dürfen nur Dateien
  von der eigenen Domain geladen werden, Daten gehen nur an `formspree.io`. Wer eine externe Ressource einbindet
  (Schrift, Skript, Widget …), muss die Policy in allen vier HTML-Dateien erweitern – sonst blockiert der Browser sie.
- **Schriften sind selbst gehostet** (`assets/fonts/`), es gibt keine Verbindung zu Google.
- Keine Inline-Skripte und keine Inline-Styles (`style="…"`) – Styling gehört in `style.css`.
- Das Kontaktformular hat ein unsichtbares Spam-Feld (`_gotcha`).
- GitHub Pages kann keine eigenen HTTP-Header setzen (HSTS, X-Frame-Options) – das ist eine Einschränkung des Hosters.
