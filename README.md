# EQ APO → GraphicEQ (Wavelet)

**English** · [Polski](README.pl.md) · [Deutsch](README.de.md)

[![Live demo](https://img.shields.io/badge/live-eqapo--to--wavelet.gapski.workers.dev-5eead4?style=flat-square)](https://eqapo-to-wavelet.gapski.workers.dev)
[![Support: buycoffee.to](https://img.shields.io/badge/%E2%98%95_Buy_me_a_coffee-buycoffee.to-f6c177?style=flat-square)](https://buycoffee.to/gap)

A converter for **Equalizer APO** and **Peace** configurations into a **GraphicEQ** file for
[Wavelet](https://github.com/Pittvandewitt/Wavelet). It runs in the browser — including on a phone —
with no installation and without uploading the file to a server. The project is deployed as a
**Cloudflare Worker** with static assets.

**Demo:** <https://eqapo-to-wavelet.gapski.workers.dev>
**Repository:** <https://github.com/gap032/eqapo-to-wavelet>

## Based on which project

This is a web version of
[**zettonaender/eqapotographiceq-gui**](https://github.com/zettonaender/eqapotographiceq-gui).
The original is a desktop application: it launches Equalizer APO and `Benchmark.exe` on Windows,
measures the frequency response, and then processes it the way AutoEQ does.

This project reproduces the same result without Windows and without installing Equalizer APO: it
parses the filters from the configuration file, calculates the biquad response directly in
JavaScript, and then applies the same smoothing and output pipeline as the original.

## What it does

1. Loads `config.txt`, `peace.txt`, `ParametricEQ.txt`, or pasted text.
2. Recognises Equalizer APO / Peace filters, `Device:` sections, and the sample rate
   (for example from a `... 96000Hz` header).
3. Calculates the frequency response of the filters (RBJ biquads).
4. Smooths it in the AutoEQ style (Savitzky–Golay, a blend of light and heavy smoothing).
5. Writes the result as a 127-band `GraphicEQ: 20 -0.5; 21 -0.3; …`, normalized to −0.1 dB.
6. Lets you download the file, copy it to the clipboard, or share it through the phone's native
   share sheet.

Import the result in Wavelet through **AutoEQ → GraphicEQ → Import**.

## Features

- Upload a file, drag and drop it, or paste text.
- Automatic sample-rate detection from the file header, with a manual override.
- Support for `Device:` sections and device selection.
- Sample rate selection: 44.1 / 48 / 96 / 192 kHz.
- A chart comparing the original EQ with the smoothed curve.
- Download, copy, and native file sharing on a phone.
- UI in English, Polish and German: `?lang=en`, `?lang=pl`, or `?lang=de`. English is the default;
  the language picker stores your choice and updates the URL.
- All calculations run locally in the browser.
- Optional `POST /api/convert` API in the Cloudflare Worker.

## Supported filters

| Type | Aliases |
| --- | --- |
| Peaking | `PK`, `PEAK`, `PEAKING`, `BELL` |
| Low shelf | `LS`, `LSC`, `LOWSHELF` |
| High shelf | `HS`, `HSC`, `HIGHSHELF` |
| Low pass | `LP`, `LPF`, `LOWPASS` |
| High pass | `HP`, `HPF`, `HIGHPASS` |
| Notch | `NO`, `NOTCH` |
| Band pass | `BP`, `BPF`, `BANDPASS` |
| All pass | `AP`, `ALLPASS` |
| GraphicEQ | `GraphicEQ: 20 -3.0; 21 -2.9; …` |

Parameters: `Fc`, `Gain`, `Q`, `S` (slope for shelves), and `BW Oct` (converted to Q).
Lines such as `Filter: …` and `Filter 1: …` are supported; `OFF` filters are skipped.

### What cannot be converted in the browser

- `Convolution:` — requires a WAV file and convolution; the tool shows a warning.
- `Include:` — the browser cannot access the included file.
- `Channel:`, `Copy:`, `Delay:`, and other commands unrelated to the magnitude response are ignored.
- `Preamp:` is skipped because the result is normalized to −0.1 dB anyway.

## How it works

1. Parse the configuration and select the device section.
2. Compute the biquad transfer function (RBJ formulas) on a 20 Hz–22 kHz grid with a step of 1.01.
3. Smooth in the AutoEQ style: Savitzky–Golay filters, a light/heavy blend, and a sigmoidal
   transition in the treble range.
4. Sample to 127 bands (step 1.0563) and normalize the same way as `write_eqapo_graphic_eq()` in
   AutoEQ.

This keeps the output consistent with the original tool, apart from differences caused by
measurement through Equalizer APO and support for convolution filters.

## Running locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Wrangler starts the site at `http://localhost:8787`.

You can force the interface language with a URL parameter: `http://localhost:8787/?lang=en`,
`?lang=pl`, or `?lang=de`. Without a parameter the app uses a stored choice, and English otherwise.
The language picker updates the parameter in the address.

Tests:

```bash
npm test
npm run check
```

## Deploying to Cloudflare

```bash
npx wrangler login
npm run deploy
```

After deployment the Worker is available at `https://eqapo-to-wavelet.<subdomain>.workers.dev`.
Configuration lives in `wrangler.jsonc`, and the `public/` directory is published as the Worker's
static assets.

If your Cloudflare login has access to more than one account, specify the right one:

```bash
CLOUDFLARE_ACCOUNT_ID=<account_id> npm run deploy
```

## API

```bash
curl -X POST https://<worker>.workers.dev/api/convert \
  -H "content-type: application/json" \
  -d '{"text":"Filter: ON PK Fc 1000 Hz Gain 3 dB Q 1","sampleRate":48000}'
```

The response includes `graphicEq`, `bands`, `curves`, `stats`, `warnings`, and `detectedSampleRate`.
If the request has no `sampleRate`, the Worker uses the value detected from the configuration header,
falling back to 48 kHz. The `/api/health` endpoint returns a simple status.

## Privacy

The configuration is read and converted locally in the browser. The site does not upload the file to
a server and uses no analytics or third-party scripts. The `/api/convert` API is optional and only
runs when someone calls it deliberately.

## Project structure

```
public/
  index.html          interface
  styles.css          styling
  app.js              UI, chart, downloads
  core.js             parser + calculations + formatting (plain JS)
  manifest.webmanifest
  favicon.svg
  _headers            security headers
src/
  worker.js           Cloudflare Worker + /api/convert
test/
  core.test.js        conversion tests
wrangler.jsonc
```

`public/core.js` depends on neither the DOM nor Node — it can be used in the browser, the Worker,
and tests.

## Support

If the project is useful to you, you can buy me a coffee:

[![Buy me a coffee on buycoffee.to](https://img.shields.io/badge/%E2%98%95_Buy_me_a_coffee-buycoffee.to-f6c177?style=for-the-badge)](https://buycoffee.to/gap)

## Credits

- [zettonaender/eqapotographiceq-gui](https://github.com/zettonaender/eqapotographiceq-gui) — the
  original tool and the pipeline this project is based on.
- [AutoEQ](https://github.com/jaakkopasanen/AutoEq) — smoothing and the GraphicEQ format.
- [Wavelet](https://github.com/Pittvandewitt/Wavelet) — the consumer of the output file.
