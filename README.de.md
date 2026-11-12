# EQ APO → GraphicEQ (Wavelet)

[English](README.md) · [Polski](README.pl.md) · **Deutsch**

[![Live-Demo](https://img.shields.io/badge/live-eqapo--to--wavelet.gapski.workers.dev-5eead4?style=flat-square)](https://eqapo-to-wavelet.gapski.workers.dev)
[![Unterstützen: buycoffee.to](https://img.shields.io/badge/%E2%98%95_Kaffee_spendieren-buycoffee.to-f6c177?style=flat-square)](https://buycoffee.to/gap)

Ein Konverter für **Equalizer-APO**- und **Peace**-Konfigurationen in eine **GraphicEQ**-Datei für
[Wavelet](https://github.com/Pittvandewitt/Wavelet). Er läuft im Browser — auch auf dem Handy —
ohne Installation und ohne die Datei auf einen Server hochzuladen. Das Projekt wird als
**Cloudflare Worker** mit statischen Assets bereitgestellt.

**Demo:** <https://eqapo-to-wavelet.gapski.workers.dev>
**Repository:** <https://github.com/gap032/eqapo-to-wavelet>

## Auf welchem Projekt es basiert

Dies ist eine Web-Version von
[**zettonaender/eqapotographiceq-gui**](https://github.com/zettonaender/eqapotographiceq-gui).
Das Original ist eine Desktop-Anwendung: Sie startet Equalizer APO und `Benchmark.exe` unter Windows,
misst den Frequenzgang und verarbeitet ihn anschließend so wie AutoEQ.

Dieses Projekt erzielt dasselbe Ergebnis ohne Windows und ohne installiertes Equalizer APO: Es liest
die Filter aus der Konfigurationsdatei, berechnet die Biquad-Antwort direkt in JavaScript und wendet
danach dieselbe Glättungs- und Ausgabe-Pipeline wie das Original an.

## Was es macht

1. Lädt `config.txt`, `peace.txt`, `ParametricEQ.txt` oder eingefügten Text.
2. Erkennt Equalizer-APO-/Peace-Filter, `Device:`-Abschnitte und die Abtastrate
   (zum Beispiel aus einer Kopfzeile `... 96000Hz`).
3. Berechnet den Frequenzgang der Filter (RBJ-Biquads).
4. Glättet ihn im AutoEQ-Stil (Savitzky-Golay, Mischung aus leichter und starker Glättung).
5. Schreibt das Ergebnis als 127-Band-`GraphicEQ: 20 -0.5; 21 -0.3; …`, normalisiert auf −0,1 dB.
6. Ermöglicht Herunterladen, Kopieren in die Zwischenablage oder Teilen über das native
   Teilen-Menü des Handys.

Das Ergebnis importierst du in Wavelet über **AutoEQ → GraphicEQ → Import**.

## Funktionen

- Datei hochladen, per Drag and Drop ablegen oder Text einfügen.
- Automatische Abtastrate-Erkennung aus der Dateikopfzeile, mit manueller Korrektur.
- Unterstützung von `Device:`-Abschnitten und Geräteauswahl.
- Auswahl der Abtastrate: 44,1 / 48 / 96 / 192 kHz.
- Diagramm zum Vergleich des Original-EQ mit der geglätteten Kurve.
- Herunterladen, Kopieren und natives Teilen der Datei auf dem Handy.
- Oberfläche auf Englisch, Polnisch und Deutsch: `?lang=en`, `?lang=pl` oder `?lang=de`. Englisch ist
  die Standardsprache; die Sprachauswahl wird gespeichert und aktualisiert die URL.
- Alle Berechnungen laufen lokal im Browser.
- Optionale `POST /api/convert`-API im Cloudflare Worker.

## Unterstützte Filter

| Typ | Aliase |
| --- | --- |
| Peaking | `PK`, `PEAK`, `PEAKING`, `BELL` |
| Low Shelf | `LS`, `LSC`, `LOWSHELF` |
| High Shelf | `HS`, `HSC`, `HIGHSHELF` |
| Low Pass | `LP`, `LPF`, `LOWPASS` |
| High Pass | `HP`, `HPF`, `HIGHPASS` |
| Notch | `NO`, `NOTCH` |
| Band Pass | `BP`, `BPF`, `BANDPASS` |
| All Pass | `AP`, `ALLPASS` |
| GraphicEQ | `GraphicEQ: 20 -3.0; 21 -2.9; …` |

Parameter: `Fc`, `Gain`, `Q`, `S` (Flankensteilheit für Shelves) und `BW Oct` (in Q umgerechnet).
Zeilen wie `Filter: …` und `Filter 1: …` werden unterstützt; `OFF`-Filter werden übersprungen.

### Was im Browser nicht umgerechnet werden kann

- `Convolution:` — benötigt eine WAV-Datei und Faltung; das Tool zeigt einen Hinweis.
- `Include:` — der Browser kann nicht auf eingebundene Dateien zugreifen.
- `Channel:`, `Copy:`, `Delay:` und andere Befehle ohne Bezug zum Amplitudengang werden ignoriert.
- `Preamp:` wird übersprungen, da das Ergebnis ohnehin auf −0,1 dB normalisiert wird.

## Wie es funktioniert

1. Konfiguration parsen und Geräteabschnitt auswählen.
2. Biquad-Übertragungsfunktion (RBJ-Formeln) auf einem Raster von 20 Hz–22 kHz mit Schrittweite 1,01
   berechnen.
3. Glättung im AutoEQ-Stil: Savitzky-Golay-Filter, Light/Heavy-Mischung und sigmoidaler Übergang im
   Hochtonbereich.
4. Abtastung auf 127 Bänder (Schrittweite 1,0563) und Normalisierung wie in `write_eqapo_graphic_eq()`
   von AutoEQ.

Dadurch stimmt die Ausgabe mit dem Originaltool überein, abgesehen von Unterschieden durch die
Messung über Equalizer APO und die Unterstützung von Convolution-Filtern.

## Lokal starten

Voraussetzungen: Node.js 20+ und npm.

```bash
npm install
npm run dev
```

Wrangler startet die Seite unter `http://localhost:8787`.

Die Sprache der Oberfläche lässt sich per URL-Parameter erzwingen:
`http://localhost:8787/?lang=en`, `?lang=pl` oder `?lang=de`. Ohne Parameter verwendet die App die
gespeicherte Auswahl, andernfalls Englisch. Die Sprachauswahl aktualisiert den Parameter in der Adresse.

Tests:

```bash
npm test
npm run check
```

## Auf Cloudflare bereitstellen

```bash
npx wrangler login
npm run deploy
```

Nach dem Deployment ist der Worker unter `https://eqapo-to-wavelet.<subdomain>.workers.dev` erreichbar.
Die Konfiguration liegt in `wrangler.jsonc`, und das Verzeichnis `public/` wird als statische Assets
des Workers veröffentlicht.

Wenn dein Cloudflare-Login Zugriff auf mehr als ein Konto hat, gib das richtige Konto an:

```bash
CLOUDFLARE_ACCOUNT_ID=<account_id> npm run deploy
```

## API

```bash
curl -X POST https://<worker>.workers.dev/api/convert \
  -H "content-type: application/json" \
  -d '{"text":"Filter: ON PK Fc 1000 Hz Gain 3 dB Q 1","sampleRate":48000}'
```

Die Antwort enthält unter anderem `graphicEq`, `bands`, `curves`, `stats`, `warnings` und
`detectedSampleRate`. Fehlt `sampleRate` in der Anfrage, verwendet der Worker den aus der
Konfigurationskopfzeile erkannten Wert, andernfalls 48 kHz. Der Endpunkt `/api/health` liefert einen
einfachen Status.

## Datenschutz

Die Konfiguration wird lokal im Browser gelesen und umgerechnet. Die Seite lädt die Datei nicht auf
einen Server und verwendet weder Analytics noch externe Skripte. Die API `/api/convert` ist optional
und läuft nur, wenn sie bewusst aufgerufen wird.

## Struktur

```
public/
  index.html          Oberfläche
  styles.css          Gestaltung
  app.js              UI, Diagramm, Downloads
  core.js             Parser + Berechnungen + Formatierung (reines JS)
  manifest.webmanifest
  favicon.svg
  _headers            Sicherheitsheader
src/
  worker.js           Cloudflare Worker + /api/convert
test/
  core.test.js        Konvertierungstests
wrangler.jsonc
```

`public/core.js` hängt weder vom DOM noch von Node ab — es lässt sich im Browser, im Worker und in
Tests verwenden.

## Unterstützung

Wenn das Projekt nützlich ist, kannst du mir einen Kaffee spendieren:

[![Kaffee spendieren auf buycoffee.to](https://img.shields.io/badge/%E2%98%95_Kaffee_spendieren-buycoffee.to-f6c177?style=for-the-badge)](https://buycoffee.to/gap)

## Danksagung

- [zettonaender/eqapotographiceq-gui](https://github.com/zettonaender/eqapotographiceq-gui) — das
  Originaltool und die Pipeline, auf der dieses Projekt basiert.
- [AutoEQ](https://github.com/jaakkopasanen/AutoEq) — Glättung und GraphicEQ-Format.
- [Wavelet](https://github.com/Pittvandewitt/Wavelet) — Empfänger der Ausgabedatei.
