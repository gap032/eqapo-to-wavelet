# EQ APO → GraphicEQ (Wavelet)

[English](README.md) · **Polski** · [Deutsch](README.de.md)

[![Live demo](https://img.shields.io/badge/live-eqapo--to--wavelet.gapski.workers.dev-5eead4?style=flat-square)](https://eqapo-to-wavelet.gapski.workers.dev)
[![Wsparcie: buycoffee.to](https://img.shields.io/badge/%E2%98%95_Postaw_kaw%C4%99-buycoffee.to-f6c177?style=flat-square)](https://buycoffee.to/gap)

Konwerter konfiguracji **Equalizer APO** i **Peace** na plik **GraphicEQ** dla
[Wavelet](https://github.com/Pittvandewitt/Wavelet). Działa w przeglądarce — również na telefonie —
bez instalacji i bez wysyłania pliku na serwer. Projekt jest wdrażany jako **Cloudflare Worker**
ze statycznymi zasobami.

**Demo:** <https://eqapo-to-wavelet.gapski.workers.dev>
**Repozytorium:** <https://github.com/gap032/eqapo-to-wavelet>

## Na podstawie jakiego projektu powstał

To webowa wersja projektu
[**zettonaender/eqapotographiceq-gui**](https://github.com/zettonaender/eqapotographiceq-gui).
Oryginał jest aplikacją desktopową: uruchamia Equalizer APO i `Benchmark.exe` w Windows, mierzy
odpowiedź częstotliwościową, a następnie przetwarza ją tak jak AutoEQ.

Ten projekt odtwarza ten sam efekt bez Windows i bez instalowania Equalizer APO: parsuje filtry
z pliku konfiguracyjnego i oblicza odpowiedź biquadów bezpośrednio w JavaScript, a potem stosuje
ten sam pipeline wygładzania i zapisu co oryginał.

## Co robi

1. Wczytuje `config.txt`, `peace.txt`, `ParametricEQ.txt` lub wklejony tekst.
2. Rozpoznaje filtry Equalizer APO / Peace, sekcje `Device:` i częstotliwość próbkowania
   (np. z nagłówka `... 96000Hz`).
3. Liczy charakterystykę częstotliwościową filtrów (RBJ biquad).
4. Wygładza ją w stylu AutoEQ (Savitzky-Golay, połączenie lekkiego i mocnego wygładzania).
5. Zapisuje wynik jako 127-pasmowy `GraphicEQ: 20 -0.5; 21 -0.3; …`, znormalizowany do −0,1 dB.
6. Pozwala pobrać plik, skopiować go do schowka lub udostępnić przez systemowy panel telefonu.

Wynik importuje się w Wavelet przez **AutoEQ → GraphicEQ → Import**.

## Funkcje

- Wgranie pliku, przeciągnięcie i upuszczenie albo wklejenie tekstu.
- Automatyczne wykrywanie częstotliwości próbkowania z nagłówka pliku, z możliwością ręcznej zmiany.
- Obsługa sekcji `Device:` i wybór urządzenia.
- Wybór częstotliwości próbkowania: 44,1 / 48 / 96 / 192 kHz.
- Wykres porównujący oryginalne EQ z krzywą po wygładzeniu.
- Pobieranie, kopiowanie i natywne udostępnianie pliku na telefonie.
- Interfejs po angielsku, polsku i niemiecku: `?lang=en`, `?lang=pl` lub `?lang=de`. Domyślnie
  włączony jest angielski; wybór języka jest zapamiętywany i aktualizuje adres URL.
- Wszystkie obliczenia wykonują się lokalnie w przeglądarce.
- Opcjonalne API `POST /api/convert` w Cloudflare Workerze.

## Obsługiwane filtry

| Typ | Aliasy |
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

Parametry: `Fc`, `Gain`, `Q`, `S` (slope dla półek) oraz `BW Oct` (przeliczane na Q).
Obsługiwane są linie `Filter: …` i `Filter 1: …`; filtry `OFF` są pomijane.

### Czego nie da się przeliczyć w przeglądarce

- `Convolution:` — wymaga pliku WAV i splotu; narzędzie pokaże ostrzeżenie.
- `Include:` — przeglądarka nie ma dostępu do dołączonych plików.
- `Channel:`, `Copy:`, `Delay:` i inne komendy niezwiązane z charakterystyką amplitudową są ignorowane.
- `Preamp:` jest pomijany, ponieważ wynik i tak jest normalizowany do −0,1 dB.

## Jak to działa

1. Parsowanie konfiguracji i wybór sekcji urządzenia.
2. Wyliczenie transmitancji biquadów (wzory RBJ) na siatce 20 Hz–22 kHz, krok 1,01.
3. Wygładzenie w stylu AutoEQ: filtry Savitzky'ego-Golaya, połączenie „light/heavy” i sigmoidalne
   przejście w pasmo wysokotonowe.
4. Próbkowanie do 127 pasm (krok 1,0563) i normalizacja jak w `write_eqapo_graphic_eq()` z AutoEQ.

Dzięki temu wynik jest zgodny z oryginalnym narzędziem poza różnicami wynikającymi z pomiaru przez
Equalizer APO i obsługi filtrów konwolucyjnych.

## Uruchomienie lokalne

Wymagania: Node.js 20+ i npm.

```bash
npm install
npm run dev
```

Wrangler uruchomi stronę pod adresem `http://localhost:8787`.

Język interfejsu można wymusić parametrem adresu: `http://localhost:8787/?lang=en`,
`?lang=pl` lub `?lang=de`. Bez parametru aplikacja używa zapisanego wyboru, a w ostateczności
angielskiego; przełącznik języka aktualizuje parametr w adresie.

Testy:

```bash
npm test
npm run check
```

## Wdrożenie na Cloudflare

```bash
npx wrangler login
npm run deploy
```

Po wdrożeniu Worker będzie dostępny pod adresem `https://eqapo-to-wavelet.<subdomain>.workers.dev`.
Konfiguracja znajduje się w `wrangler.jsonc`, a katalog `public/` jest publikowany jako statyczne
zasoby Workera.

Jeśli konto Cloudflare ma dostęp do więcej niż jednego konta, wskaż właściwe konto:

```bash
CLOUDFLARE_ACCOUNT_ID=<account_id> npm run deploy
```

## API

```bash
curl -X POST https://<worker>.workers.dev/api/convert \
  -H "content-type: application/json" \
  -d '{"text":"Filter: ON PK Fc 1000 Hz Gain 3 dB Q 1","sampleRate":48000}'
```

Odpowiedź zawiera m.in. `graphicEq`, `bands`, `curves`, `stats`, `warnings` i `detectedSampleRate`.
Jeśli w żądaniu nie ma `sampleRate`, Worker użyje wartości wykrytej z nagłówka konfiguracji,
a w ostateczności 48 kHz. Endpoint `/api/health` zwraca prosty status.

## Prywatność

Konfiguracja jest czytana i przeliczana lokalnie w przeglądarce. Strona nie wysyła pliku na serwer,
nie używa analityki ani zewnętrznych skryptów. API `/api/convert` jest opcjonalne i działa tylko
wtedy, gdy ktoś wywoła je świadomie.

## Struktura

```
public/
  index.html          interfejs
  styles.css          wygląd
  app.js              UI, wykres, pobieranie
  core.js             parser + obliczenia + formatowanie (czysty JS)
  manifest.webmanifest
  favicon.svg
  _headers            nagłówki bezpieczeństwa
src/
  worker.js           Cloudflare Worker + /api/convert
test/
  core.test.js        testy konwersji
wrangler.jsonc
```

`public/core.js` nie zależy od DOM ani od Node — można go używać w przeglądarce, Workerze i testach.

## Wsparcie

Jeśli projekt jest przydatny, możesz postawić mi kawę:

[![Postaw mi kawę na buycoffee.to](https://img.shields.io/badge/%E2%98%95_Postaw_mi_kaw%C4%99-buycoffee.to-f6c177?style=for-the-badge)](https://buycoffee.to/gap)

## Podziękowania

- [zettonaender/eqapotographiceq-gui](https://github.com/zettonaender/eqapotographiceq-gui) — oryginalne
  narzędzie i pipeline, na którym oparty jest ten projekt.
- [AutoEQ](https://github.com/jaakkopasanen/AutoEq) — wygładzanie i format GraphicEQ.
- [Wavelet](https://github.com/Pittvandewitt/Wavelet) — odbiorca pliku.
