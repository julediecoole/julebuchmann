# Jule Buchmann – Portfolio

Portfolio-Website von Jule Buchmann: Regie und Kamera, Schwerpunkt Dokumentarfilm, Bern.
Live: **https://julebuchmann.ch**

Eine einzige Seite (One-Pager) aus reinem HTML, CSS und JavaScript – ohne Frameworks, ohne Libraries, ohne Build-Schritt.
Keine Cookies, kein Tracking, Schriften lokal eingebettet.

## Aufbau der Seite

1. **Showreel** im Vollbild, stumm, mit Logo, das die Farben darunter umkehrt
2. **Vorstellung** – grosse Sätze, in deren Schrift das invertierte Showreel läuft
3. **Making-of** – drei Fotos, verteilte Wörter (Kamera, Regie, Doku …), Greenscreen-Easter-Egg
4. **Arbeiten** – 14 Projekte als Bildwolke, Klick öffnet den Video-Player
5. **Über mich** – Porträt, das scharf gezogen wird
6. **Kontakt** – „Was willst du erzählen?“, Mail-Link
7. **Footer** – Impressum und Datenschutz

## Dateien

| Datei / Ordner | Inhalt |
| --- | --- |
| `index.html` | Aufbau aller Abschnitte, Logo als Inline-SVG, Player als `<dialog>` |
| `style.css` | Gestaltung und Responsive Layout; Schriften Unbounded und Archivo als Base64 eingebettet |
| `script.js` | Projektliste `PROJECTS`, Scroll-Animationen (ein `requestAnimationFrame`-Loop), Bildwolke, Player, Easter Egg |
| `img/` | Vorschau- und Standbilder (`*-thumb.webp`, `*-still.webp`), Making-of, Porträt, Greenscreen-Varianten, `schrift-loop.webp` (animierte Textur für die Video-Schrift) |
| `.htaccess` | Server-Einstellungen: Dateitypen (wichtig für WebP auf dem iPhone), Komprimierung, Caching |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | Icons |
| `.github/workflows/deploy.yml` | Optionaler Upload zu Infomaniak per Knopfdruck (siehe unten) |

`video/` ist **nicht im Repo** (zu gross).

## Wo was liegt

| Was | Wo |
| --- | --- |
| Website (HTML, CSS, JS, Bilder, `.htaccess`) | Infomaniak Starter-Hosting, Upload per Web FTP |
| Videos (Showreel + Projektvideos) | Cloudflare R2, Bucket `portfoliojulebuchmann`, öffentliche r2.dev-Adresse |
| Domain und DNS | Infomaniak (A-Record julebuchmann.ch und www → Hosting) |
| SSL | Let's Encrypt über Infomaniak |
| Code-Versionen | dieses Repo |

Die Video-Adresse steht an einer einzigen Stelle oben in `script.js`:

```js
const VIDEO_BASE = "https://pub-ef171a0094e444728aa668ad2a0d800e.r2.dev/";
```

Zum lokalen Testen mit eigenen Videos im Ordner `video/` auf `"video/"` setzen. Für eine eigene Adresse (z. B. `videos.julebuchmann.ch`) nur diese Zeile ändern.
Das Showreel ist in `index.html` direkt verlinkt: `showreel-stumm.mp4` (1080p) und `showreel-mobil.mp4` (720p, für Bildschirme bis 900 px).

## Neues Projekt hinzufügen

1. Bilder als WebP in `img/` speichern: `projekt-thumb.webp` (ca. 1280 px breit) und `projekt-still.webp` (ca. 1920 px).
2. Video fürs Web exportieren (H.264, 1080p, VBR 1 Durchgang, Ziel 4–6 Mbit/s) und in den Cloudflare-Bucket hochladen, z. B. `projekt.mp4`.
3. In `script.js` in `PROJECTS` einen bestehenden Eintrag kopieren und anpassen:

   ```js
   { title: "Titel", type: "Dokumentarfilm", role: "Regie, Kamera", img: "img/projekt-still.webp",
     thumb: "img/projekt-thumb.webp", video: "video/projekt.mp4", real: true,
     tile: { wide: true, size: 0.6 },
     desc: "Ein bis zwei Sätze zum Projekt." },
   ```

   `tile`: `{ wide: true }` = Querformat, `{ tall: true, size: 1 }` = grosses Hochformat, `size` 0–1, `align: "left"`/`"right"`, `pair: "<Titel>"` = auf gleicher Höhe wie ein anderes Projekt.
   Der Pfad `video/…` wird automatisch auf die Cloudflare-Adresse umgeschrieben.
4. `script.js` und die neuen Bilder per Web FTP hochladen.

## Lokal ansehen

`index.html` direkt im Browser öffnen reicht (Schriften sind eingebettet, Videos kommen von Cloudflare).
Für saubere Tests besser einen kleinen Server starten:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Veröffentlichen

**Von Hand (aktuell):** im Infomaniak-Manager → Web FTP → geänderte Dateien in den Hauptordner ziehen und ersetzen.
Nach dem Hochladen auf Laptop und iPhone prüfen, bei Bedarf im privaten Fenster (Browser-Cache).

**Per GitHub Action (optional):** Actions → „Deploy zu Infomaniak“ → „Run workflow“.
Braucht die Repository-Secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_DIR`. Der Ordner `video/` wird dabei nie hochgeladen oder gelöscht.

## Branches

| Branch | Stand |
| --- | --- |
| `main` | aktuelle Website |
| `version-1` | Stand vom 21.10.2026 vor den Gestaltungs-Experimenten |
| `experiment-chrome` | verworfene Experimente (Liquid Chrome, Wolkenhimmel, Neon) |

## Browser-Hinweise

- **Safari / iPhone:** Mischmodi über Videos funktionieren nicht; die Video-Schrift ist deshalb ein animiertes WebP mit `background-clip: text`.
- **Hover** der Projektbilder wird per JavaScript berechnet (Safari-Flackern mit `:hover` auf bewegten Ebenen).
- **WebP** braucht den Dateityp `image/webp` vom Server, sonst zeigt das iPhone die Bilder nicht an → `.htaccess`.
- `prefers-reduced-motion` schaltet die Animationen ab.

## Schriften

[Unbounded](https://github.com/googlefonts/unbounded) und [Archivo](https://github.com/Omnibus-Type/Archivo), beide unter der SIL Open Font License, als WOFF2 in `style.css` eingebettet.

## Entstehung

Gestaltung, Inhalte und Entscheidungen: Jule Buchmann. Code in Zusammenarbeit mit Claude (Anthropic) entstanden.
Ausführliche Arbeitsdokumentation: separates Dokument.

© 2026 Jule Buchmann
