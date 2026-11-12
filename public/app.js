import { convertConfig, detectSampleRate } from './core.js';

/* -------------------------------------------------------------------------- */
/* i18n                                                                       */
/* -------------------------------------------------------------------------- */

const STRINGS = {
  pl: {
    docTitle: 'EQ APO → GraphicEQ · konwerter dla Wavelet',
    source: 'Źródło',
    eyebrow: 'Equalizer APO / Peace → Wavelet',
    heroTitleA: 'Przenieś swoje EQ',
    heroTitleB: 'na telefon.',
    heroLede:
      'Wgraj <code>config.txt</code> lub <code>peace.txt</code>. Otrzymasz plik <code>GraphicEQ</code> gotowy do importu w Wavelet. Wszystkie obliczenia wykonują się w Twojej przeglądarce.',
    pointPrivate: 'Plik zostaje na urządzeniu',
    pointBands: '127 pasm, format Wavelet',
    pointFormats: 'APO, Peace i AutoEQ',
    dropTitle: 'Wybierz plik konfiguracji',
    dropHint: 'Dotknij, aby wybrać, lub przeciągnij plik tutaj',
    chooseFile: 'Wybierz plik',
    pasteText: 'Wklej tekst',
    dropFormats: 'config.txt · peace.txt · ParametricEQ.txt',
    tryExample: 'Wypróbuj przykład',
    inputStep: 'Wejście',
    editorTitle: 'Konfiguracja',
    deviceLabel: 'Urządzenie',
    deviceHint: 'Wybierz sekcję urządzenia z pliku konfiguracji.',
    sampleRateLabel: 'Częstotliwość próbkowania',
    sampleRateHint: 'Taka, jaka była ustawiona w Equalizer APO dla tego urządzenia.',
    showSource: 'Pokaż / edytuj konfigurację',
    clear: 'Wyczyść',
    resultStep: 'Wynik',
    resultTitle: 'Graphic EQ dla Wavelet',
    ready: 'Gotowe',
    legendApo: 'Oryginalne EQ',
    legendWavelet: 'Wavelet po wygładzeniu',
    download: 'Pobierz GraphicEQ.txt',
    copy: 'Kopiuj',
    share: 'Udostępnij',
    preview: 'Podgląd pliku',
    resultNote: 'Plik jest znormalizowany do −0,1 dB, więc dodatkowy Preamp nie jest potrzebny.',
    statBands: 'Pasma',
    statFilters: 'Filtry',
    statRange: 'Zakres',
    statCut: 'Maks. cięcie',
    howEyebrow: 'Trzy kroki',
    howTitle: 'Jak to działa?',
    step1Title: 'Znajdź plik EQ',
    step1Text:
      'Equalizer APO: <code>C:\\Program Files\\EqualizerAPO\\config\\config.txt</code>. Peace: <code>peace.txt</code> w tym samym folderze.',
    step2Title: 'Wgraj i sprawdź',
    step2Text:
      'Wybierz urządzenie i częstotliwość próbkowania. Wykres pokaże różnicę między oryginalnym EQ a tym, co trafi do Wavelet.',
    step3Title: 'Zaimportuj w Wavelet',
    step3Text:
      'W Wavelet otwórz <strong>AutoEQ</strong> → <strong>GraphicEQ</strong> → <strong>Import</strong> i wybierz pobrany plik. Gotowe.',
    privacyTitle: 'Twoje dane zostają na telefonie',
    privacyText:
      'Plik jest czytany i przeliczany lokalnie w przeglądarce. Nie wysyłamy go na żaden serwer.',
    footerBuiltOn:
      'Na podstawie projektu <a href="https://github.com/zettonaender/eqapotographiceq-gui" target="_blank" rel="noreferrer noopener">eqapotographiceq-gui</a>.',
    footerMeta: 'Cloudflare Worker · bez zależności · open source',
    languageLabel: 'Język',
    githubRepo: 'Repozytorium na GitHubie',
    supportTitle: 'Wesprzyj projekt na buycoffee.to',
    support: 'Wsparcie',
    supportCoffee: 'Postaw kawę',
    footerGithub: 'Kod źródłowy',
    pastedText: 'Wklejony tekst',
    exampleName: 'Przykładowa konfiguracja',
    charCount: 'znaków',
    bandUnit: 'pasm',
    preampIgnored: 'pominięty',
    offChip: 'OFF',
    warningsTitle: 'Uwagi',
    errorTitle: 'Nie udało się przetworzyć konfiguracji',
    errGeneric: 'Spróbuj sprawdzić zawartość pliku i spróbować ponownie.',
    errEmptyInput: 'Wgraj plik lub wklej konfigurację.',
    errNoFilters:
      'Nie znaleziono aktywnych filtrów EQ. Sprawdź, czy plik zawiera linie typu „Filter: ON PK …”.',
    errNoActiveFilters: 'Wszystkie filtry w konfiguracji są wyłączone (OFF).',
    errInvalidRate: 'Nieprawidłowa częstotliwość próbkowania.',
    errRead: 'Nie udało się odczytać pliku. Spróbuj zapisać go jako UTF-8.',
    warnConvolution: 'Pominięto filtr konwolucyjny (Convolution) — wymaga pliku WAV.',
    warnInclude: 'Pominięto Include — dołączony plik nie jest dostępny w przeglądarce.',
    warnUnsupportedFilter: 'Nieznany typ filtra: {type}.',
    warnMissingParam: 'Brak parametru {parameter} w filtrze — pominięto.',
    warnInvalidValue: 'Nieprawidłowa wartość parametru {parameter}.',
    warnIgnoredCommand: 'Pominięto nieobsługiwaną komendę: {command}.',
    warnIgnoredLine: 'Pominięto nieznaną linię: {text}',
    warnMissingQ: 'Brak Q w filtrze {typeLabel} — użyto {q}.',
    warnGraphicEq: 'Nie udało się odczytać punktów GraphicEQ.',
    warnAboveNyquist:
      'Fc {fc} Hz jest powyżej częstotliwości Nyquista ({nyquist} Hz) — filtr może być zniekształcony.',
    warnGeneric: 'Pominięto nieobsługiwany wpis.',
    toastCopied: 'Skopiowano do schowka',
    toastCopyFailed: 'Nie udało się skopiować',
    toastDownload: 'Plik został pobrany',
    toastFileTooBig: 'Plik jest za duży (limit 2 MB).',
    toastReadError: 'Nie udało się odczytać pliku.',
    toastShareFailed: 'Nie udało się udostępnić pliku.',
    shareTitle: 'GraphicEQ dla Wavelet',
    shareText: 'Mój GraphicEQ wygenerowany z konfiguracji Equalizer APO.',
    chartAria: 'Wykres częstotliwości: porównanie oryginalnego EQ i krzywej Wavelet.',
  },
  en: {
    docTitle: 'EQ APO → GraphicEQ · converter for Wavelet',
    source: 'Source',
    eyebrow: 'Equalizer APO / Peace → Wavelet',
    heroTitleA: 'Move your EQ',
    heroTitleB: 'to your phone.',
    heroLede:
      'Upload <code>config.txt</code> or <code>peace.txt</code>. Get a <code>GraphicEQ</code> file ready to import in Wavelet. All processing happens in your browser.',
    pointPrivate: 'Your file stays on the device',
    pointBands: '127 bands, Wavelet format',
    pointFormats: 'APO, Peace and AutoEQ',
    dropTitle: 'Choose a configuration file',
    dropHint: 'Tap to browse, or drop a file here',
    chooseFile: 'Choose file',
    pasteText: 'Paste text',
    dropFormats: 'config.txt · peace.txt · ParametricEQ.txt',
    tryExample: 'Try an example',
    inputStep: 'Input',
    editorTitle: 'Configuration',
    deviceLabel: 'Device',
    deviceHint: 'Select a device section from the configuration file.',
    sampleRateLabel: 'Sample rate',
    sampleRateHint: 'The rate Equalizer APO used for this device.',
    showSource: 'Show / edit configuration',
    clear: 'Clear',
    resultStep: 'Result',
    resultTitle: 'Graphic EQ for Wavelet',
    ready: 'Ready',
    legendApo: 'Original EQ',
    legendWavelet: 'Wavelet after smoothing',
    download: 'Download GraphicEQ.txt',
    copy: 'Copy',
    share: 'Share',
    preview: 'File preview',
    resultNote: 'The file is normalized to −0.1 dB, so no extra Preamp is needed.',
    statBands: 'Bands',
    statFilters: 'Filters',
    statRange: 'Range',
    statCut: 'Max cut',
    howEyebrow: 'Three steps',
    howTitle: 'How it works',
    step1Title: 'Find your EQ file',
    step1Text:
      'Equalizer APO: <code>C:\\Program Files\\EqualizerAPO\\config\\config.txt</code>. Peace: <code>peace.txt</code> in the same folder.',
    step2Title: 'Upload and inspect',
    step2Text:
      'Pick the device and sample rate. The chart shows the difference between the original EQ and what Wavelet will apply.',
    step3Title: 'Import into Wavelet',
    step3Text:
      'In Wavelet open <strong>AutoEQ</strong> → <strong>GraphicEQ</strong> → <strong>Import</strong> and choose the downloaded file.',
    privacyTitle: 'Your data stays on your phone',
    privacyText:
      'The file is read and converted locally in your browser. Nothing is uploaded to a server.',
    footerBuiltOn:
      'Based on the <a href="https://github.com/zettonaender/eqapotographiceq-gui" target="_blank" rel="noreferrer noopener">eqapotographiceq-gui</a> project.',
    footerMeta: 'Cloudflare Worker · no dependencies · open source',
    languageLabel: 'Language',
    githubRepo: 'GitHub repository',
    supportTitle: 'Support the project on buycoffee.to',
    support: 'Support',
    supportCoffee: 'Buy me a coffee',
    footerGithub: 'Source code',
    pastedText: 'Pasted text',
    exampleName: 'Example configuration',
    charCount: 'characters',
    bandUnit: 'bands',
    preampIgnored: 'ignored',
    offChip: 'OFF',
    warningsTitle: 'Notes',
    errorTitle: 'Could not process the configuration',
    errGeneric: 'Check the file contents and try again.',
    errEmptyInput: 'Upload a file or paste a configuration.',
    errNoFilters:
      'No active EQ filters found. Make sure the file contains lines like “Filter: ON PK …”.',
    errNoActiveFilters: 'All filters in the configuration are disabled (OFF).',
    errInvalidRate: 'Invalid sample rate.',
    errRead: 'Could not read the file. Try saving it as UTF-8.',
    warnConvolution: 'Skipped a Convolution filter — it needs a WAV file.',
    warnInclude: 'Skipped Include — the included file is not available in the browser.',
    warnUnsupportedFilter: 'Unknown filter type: {type}.',
    warnMissingParam: 'Missing {parameter} parameter — filter skipped.',
    warnInvalidValue: 'Invalid value for {parameter}.',
    warnIgnoredCommand: 'Skipped unsupported command: {command}.',
    warnIgnoredLine: 'Skipped unknown line: {text}',
    warnMissingQ: 'No Q in {typeLabel} filter — using {q}.',
    warnGraphicEq: 'Could not read the GraphicEQ points.',
    warnAboveNyquist:
      'Fc {fc} Hz is above Nyquist ({nyquist} Hz) — the filter may be distorted.',
    warnGeneric: 'Skipped an unsupported entry.',
    toastCopied: 'Copied to clipboard',
    toastCopyFailed: 'Could not copy',
    toastDownload: 'File downloaded',
    toastFileTooBig: 'The file is too large (2 MB limit).',
    toastReadError: 'Could not read the file.',
    toastShareFailed: 'Could not share the file.',
    shareTitle: 'GraphicEQ for Wavelet',
    shareText: 'My GraphicEQ generated from an Equalizer APO configuration.',
    chartAria: 'Frequency chart comparing the original EQ with the Wavelet curve.',
  },
  de: {
    docTitle: 'EQ APO → GraphicEQ · Konverter für Wavelet',
    source: 'Quelle',
    eyebrow: 'Equalizer APO / Peace → Wavelet',
    heroTitleA: 'Bring dein EQ',
    heroTitleB: 'aufs Handy.',
    heroLede:
      'Lade <code>config.txt</code> oder <code>peace.txt</code> hoch. Du erhältst eine <code>GraphicEQ</code>-Datei, bereit für den Import in Wavelet. Die gesamte Berechnung läuft in deinem Browser.',
    pointPrivate: 'Deine Datei bleibt auf dem Gerät',
    pointBands: '127 Bänder, Wavelet-Format',
    pointFormats: 'APO, Peace und AutoEQ',
    dropTitle: 'Konfigurationsdatei wählen',
    dropHint: 'Tippen zum Auswählen oder Datei hierher ziehen',
    chooseFile: 'Datei wählen',
    pasteText: 'Text einfügen',
    dropFormats: 'config.txt · peace.txt · ParametricEQ.txt',
    tryExample: 'Beispiel ausprobieren',
    inputStep: 'Eingabe',
    editorTitle: 'Konfiguration',
    deviceLabel: 'Gerät',
    deviceHint: 'Wähle den Geräteabschnitt aus der Konfigurationsdatei.',
    sampleRateLabel: 'Abtastrate',
    sampleRateHint: 'Die Rate, die Equalizer APO für dieses Gerät verwendet hat.',
    showSource: 'Konfiguration anzeigen / bearbeiten',
    clear: 'Leeren',
    resultStep: 'Ergebnis',
    resultTitle: 'Graphic EQ für Wavelet',
    ready: 'Fertig',
    legendApo: 'Original-EQ',
    legendWavelet: 'Wavelet nach Glättung',
    download: 'GraphicEQ.txt herunterladen',
    copy: 'Kopieren',
    share: 'Teilen',
    preview: 'Dateivorschau',
    resultNote: 'Die Datei ist auf −0,1 dB normalisiert, ein zusätzlicher Preamp ist nicht nötig.',
    statBands: 'Bänder',
    statFilters: 'Filter',
    statRange: 'Bereich',
    statCut: 'Max. Absenkung',
    howEyebrow: 'Drei Schritte',
    howTitle: 'Wie es funktioniert',
    step1Title: 'EQ-Datei finden',
    step1Text:
      'Equalizer APO: <code>C:\\Program Files\\EqualizerAPO\\config\\config.txt</code>. Peace: <code>peace.txt</code> im selben Ordner.',
    step2Title: 'Hochladen und prüfen',
    step2Text:
      'Wähle Gerät und Abtastrate. Das Diagramm zeigt den Unterschied zwischen dem Original-EQ und dem, was Wavelet anwendet.',
    step3Title: 'In Wavelet importieren',
    step3Text:
      'Öffne in Wavelet <strong>AutoEQ</strong> → <strong>GraphicEQ</strong> → <strong>Import</strong> und wähle die heruntergeladene Datei.',
    privacyTitle: 'Deine Daten bleiben auf dem Handy',
    privacyText:
      'Die Datei wird lokal in deinem Browser gelesen und umgerechnet. Es wird nichts an einen Server gesendet.',
    footerBuiltOn:
      'Basierend auf dem Projekt <a href="https://github.com/zettonaender/eqapotographiceq-gui" target="_blank" rel="noreferrer noopener">eqapotographiceq-gui</a>.',
    footerMeta: 'Cloudflare Worker · keine Abhängigkeiten · Open Source',
    languageLabel: 'Sprache',
    githubRepo: 'GitHub-Repository',
    supportTitle: 'Unterstütze das Projekt auf buycoffee.to',
    support: 'Unterstützen',
    supportCoffee: 'Kaffee spendieren',
    footerGithub: 'Quellcode',
    pastedText: 'Eingefügter Text',
    exampleName: 'Beispielkonfiguration',
    charCount: 'Zeichen',
    bandUnit: 'Bänder',
    preampIgnored: 'ignoriert',
    offChip: 'AUS',
    warningsTitle: 'Hinweise',
    errorTitle: 'Konfiguration konnte nicht verarbeitet werden',
    errGeneric: 'Prüfe den Dateiinhalt und versuche es erneut.',
    errEmptyInput: 'Lade eine Datei hoch oder füge eine Konfiguration ein.',
    errNoFilters:
      'Keine aktiven EQ-Filter gefunden. Prüfe, ob die Datei Zeilen wie „Filter: ON PK …“ enthält.',
    errNoActiveFilters: 'Alle Filter in der Konfiguration sind deaktiviert (OFF).',
    errInvalidRate: 'Ungültige Abtastrate.',
    errRead: 'Datei konnte nicht gelesen werden. Versuche, sie als UTF-8 zu speichern.',
    warnConvolution: 'Convolution-Filter übersprungen — er benötigt eine WAV-Datei.',
    warnInclude: 'Include übersprungen — die eingebundene Datei ist im Browser nicht verfügbar.',
    warnUnsupportedFilter: 'Unbekannter Filtertyp: {type}.',
    warnMissingParam: 'Parameter {parameter} fehlt — Filter übersprungen.',
    warnInvalidValue: 'Ungültiger Wert für {parameter}.',
    warnIgnoredCommand: 'Nicht unterstützter Befehl übersprungen: {command}.',
    warnIgnoredLine: 'Unbekannte Zeile übersprungen: {text}',
    warnMissingQ: 'Kein Q im Filter {typeLabel} — verwende {q}.',
    warnGraphicEq: 'GraphicEQ-Punkte konnten nicht gelesen werden.',
    warnAboveNyquist:
      'Fc {fc} Hz liegt über der Nyquist-Frequenz ({nyquist} Hz) — der Filter kann verzerrt sein.',
    warnGeneric: 'Nicht unterstützter Eintrag übersprungen.',
    toastCopied: 'In die Zwischenablage kopiert',
    toastCopyFailed: 'Kopieren fehlgeschlagen',
    toastDownload: 'Datei heruntergeladen',
    toastFileTooBig: 'Die Datei ist zu groß (Limit 2 MB).',
    toastReadError: 'Datei konnte nicht gelesen werden.',
    toastShareFailed: 'Datei konnte nicht geteilt werden.',
    shareTitle: 'GraphicEQ für Wavelet',
    shareText: 'Mein GraphicEQ aus einer Equalizer-APO-Konfiguration.',
    chartAria: 'Frequenzdiagramm: Vergleich des Original-EQ mit der Wavelet-Kurve.',
  },
};

const FILTER_LABELS = {
  peaking: 'Peak',
  lowshelf: 'Low shelf',
  highshelf: 'High shelf',
  lowpass: 'Low pass',
  highpass: 'High pass',
  notch: 'Notch',
  bandpass: 'Band pass',
  allpass: 'All pass',
  graphiceq: 'GraphicEQ',
};

const SAMPLE_RATE_DEFAULT = 48000;

const EXAMPLE_CONFIG = `# Equalizer APO / AutoEQ example
Preamp: -7.0 dB
Filter 1: ON LS Fc 105 Hz Gain 5.5 dB Q 0.70
Filter 2: ON PK Fc 220 Hz Gain -2.5 dB Q 1.20
Filter 3: ON PK Fc 610 Hz Gain 1.8 dB Q 1.60
Filter 4: ON PK Fc 1400 Hz Gain -3.2 dB Q 1.90
Filter 5: ON PK Fc 2900 Hz Gain 4.4 dB Q 2.40
Filter 6: ON PK Fc 5200 Hz Gain -2.8 dB Q 2.60
Filter 7: ON PK Fc 7800 Hz Gain 1.5 dB Q 3.00
Filter 8: ON HS Fc 10000 Hz Gain -3.0 dB Q 0.70
`;

/* -------------------------------------------------------------------------- */
/* Elements & state                                                           */
/* -------------------------------------------------------------------------- */

const $ = (id) => document.getElementById(id);

const els = {
  workspace: $('workspace'),
  dropCard: $('dropCard'),
  dropTarget: $('dropTarget'),
  fileInput: $('fileInput'),
  chooseBtn: $('chooseBtn'),
  pasteBtn: $('pasteBtn'),
  exampleBtn: $('exampleBtn'),
  editorCard: $('editorCard'),
  fileName: $('fileName'),
  resetBtn: $('resetBtn'),
  deviceField: $('deviceField'),
  deviceSelect: $('deviceSelect'),
  sampleRateGroup: $('sampleRateGroup'),
  sourceDetails: $('sourceDetails'),
  configInput: $('configInput'),
  charCount: $('charCount'),
  chips: $('chips'),
  errorBox: $('errorBox'),
  warnings: $('warnings'),
  resultCard: $('resultCard'),
  chart: $('chart'),
  chartShell: $('chartShell'),
  chartTooltip: $('chartTooltip'),
  statGrid: $('statGrid'),
  downloadBtn: $('downloadBtn'),
  copyBtn: $('copyBtn'),
  shareBtn: $('shareBtn'),
  bandBadge: $('bandBadge'),
  outputPreview: $('outputPreview'),
  langPicker: $('langPicker'),
  langButton: $('langButton'),
  langMenu: $('langMenu'),
  langCode: $('langCode'),
  toast: $('toast'),
};

const state = {
  lang: detectLanguage(),
  fileName: null,
  source: null,
  device: null,
  sampleRate: SAMPLE_RATE_DEFAULT,
  detectedRate: null,
  result: null,
};

let convertTimer = 0;
let toastTimer = 0;
let chartResizeFrame = 0;
let chartWidth = 0;
let tooltipTimer = 0;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function t(key) {
  return STRINGS[state.lang]?.[key] ?? STRINGS.en[key] ?? key;
}

function template(key, values) {
  return t(key).replace(/\{(\w+)\}/g, (_, name) => (values[name] ?? ''));
}

function languageFromUrl() {
  try {
    const value = (new URL(window.location.href).searchParams.get('lang') || '').toLowerCase();
    if (value.startsWith('pl')) return 'pl';
    if (value.startsWith('de')) return 'de';
    if (value.startsWith('en')) return 'en';
  } catch {
    /* malformed URL */
  }
  return null;
}

function detectLanguage() {
  const fromUrl = languageFromUrl();
  if (fromUrl) return fromUrl;

  try {
    const stored = localStorage.getItem('eqapo-lang');
    if (stored === 'pl' || stored === 'de' || stored === 'en') return stored;
  } catch {
    /* localStorage can be unavailable in private mode */
  }
  return 'en';
}

function syncLanguageUrl() {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get('lang') === state.lang) return;
    url.searchParams.set('lang', state.lang);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}

function formatDb(value) {
  if (!Number.isFinite(value)) return '0.0';
  const rounded = Math.round(value * 10) / 10;
  return (rounded === 0 ? 0 : rounded).toFixed(1).replace('-', '−');
}

function formatQ(value) {
  if (!Number.isFinite(value)) return '1';
  return Number(value.toFixed(2)).toString();
}

function formatFrequency(value) {
  if (value >= 1000) {
    const kilo = value / 1000;
    return `${kilo >= 10 ? kilo.toFixed(0) : kilo.toFixed(1).replace('.0', '')} kHz`;
  }
  return `${Math.round(value)} Hz`;
}

function truncate(value, max = 64) {
  const text = String(value ?? '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add('is-visible');
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove('is-visible');
  }, 2800);
}

function updateCharCount() {
  const value = els.configInput.value;
  const chars = value.length;
  const locale = state.lang === 'pl' ? 'pl-PL' : state.lang === 'de' ? 'de-DE' : 'en-US';
  els.charCount.textContent = `${chars.toLocaleString(locale)} ${t('charCount')}`;
}

/* -------------------------------------------------------------------------- */
/* Language                                                                   */
/* -------------------------------------------------------------------------- */

function applyLanguage() {
  document.documentElement.lang = state.lang;
  document.title = t('docTitle');

  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.dataset.i18n;
    const value = STRINGS[state.lang]?.[key];
    if (value !== undefined) element.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((element) => {
    const key = element.dataset.i18nHtml;
    const value = STRINGS[state.lang]?.[key];
    if (value !== undefined) element.innerHTML = value;
  });

  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const key = element.dataset.i18nTitle;
    const value = STRINGS[state.lang]?.[key];
    if (value !== undefined) {
      element.title = value;
      element.setAttribute('aria-label', value);
    }
  });

  els.langButton.dataset.lang = state.lang;
  els.langCode.textContent = state.lang.toUpperCase();
  els.langButton.setAttribute('aria-label', t('languageLabel'));
  els.langButton.title = t('languageLabel');
  els.langMenu.setAttribute('aria-label', t('languageLabel'));
  els.langMenu.querySelectorAll('.lang-option').forEach((option) => {
    option.setAttribute('aria-selected', String(option.dataset.lang === state.lang));
  });

  try {
    localStorage.setItem('eqapo-lang', state.lang);
  } catch {
    /* ignore */
  }

  syncLanguageUrl();
  updateCharCount();
  if (state.source) renderFileMeta();
  if (state.result) renderConversion(state.result);
}

function closeLanguageMenu(returnFocus = false) {
  if (els.langMenu.hidden) return;
  els.langMenu.hidden = true;
  els.langButton.setAttribute('aria-expanded', 'false');
  if (returnFocus) els.langButton.focus();
}

function openLanguageMenu(focusTarget = 'selected') {
  els.langMenu.hidden = false;
  els.langButton.setAttribute('aria-expanded', 'true');
  if (!focusTarget) return;

  const options = [...els.langMenu.querySelectorAll('.lang-option')];
  const target =
    focusTarget === 'last'
      ? options[options.length - 1]
      : options.find((option) => option.dataset.lang === state.lang) || options[0];
  target?.focus();
}

/* -------------------------------------------------------------------------- */
/* File input                                                                 */
/* -------------------------------------------------------------------------- */

async function readFileText(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let encoding = 'utf-8';
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) encoding = 'utf-16le';
    else if (bytes[0] === 0xfe && bytes[1] === 0xff) encoding = 'utf-16be';
  }
  return new TextDecoder(encoding).decode(buffer).replace(/^\uFEFF/, '');
}

async function handleFile(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast(t('toastFileTooBig'));
    return;
  }

  try {
    const text = await readFileText(file);
    loadText(text, file.name, 'file');
  } catch {
    showToast(t('toastReadError'));
  }
}

function applySampleRate(rate) {
  state.sampleRate = rate;
  els.sampleRateGroup.querySelectorAll('button[data-rate]').forEach((button) => {
    button.setAttribute('aria-pressed', Number(button.dataset.rate) === rate ? 'true' : 'false');
  });
}

function renderFileMeta() {
  if (!state.source) {
    els.fileName.textContent = '';
    return;
  }
  els.fileName.textContent =
    state.source === 'file' ? state.fileName : state.source === 'example' ? t('exampleName') : t('pastedText');
}

function loadText(text, name, source) {
  state.fileName = source === 'file' ? name : source === 'example' ? 'eqapo-example.txt' : null;
  state.source = source;
  state.device = null;

  els.configInput.value = text;
  renderFileMeta();
  updateCharCount();

  els.dropCard.classList.add('is-hidden');
  els.editorCard.classList.remove('is-hidden');
  els.sourceDetails.open = source === 'paste';

  convertNow();

  window.requestAnimationFrame(() => {
    els.editorCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  if (source === 'paste') {
    els.sourceDetails.open = true;
    els.configInput.focus();
  }
}

function resetApp() {
  state.fileName = null;
  state.source = null;
  state.device = null;
  state.sampleRate = SAMPLE_RATE_DEFAULT;
  state.detectedRate = null;
  state.result = null;

  els.fileInput.value = '';
  els.configInput.value = '';
  els.configInput.blur();
  els.sourceDetails.open = false;
  renderFileMeta();
  updateCharCount();

  els.editorCard.classList.add('is-hidden');
  els.resultCard.classList.add('is-hidden');
  els.workspace.classList.remove('has-result');
  els.dropCard.classList.remove('is-hidden');
  els.shareBtn.classList.add('is-hidden');
  applySampleRate(SAMPLE_RATE_DEFAULT);
  els.chips.replaceChildren();
  els.warnings.replaceChildren();
  els.warnings.classList.add('is-hidden');
  clearError();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* -------------------------------------------------------------------------- */
/* Conversion & rendering                                                     */
/* -------------------------------------------------------------------------- */

function convertNow() {
  const text = els.configInput.value;

  if (!text.trim()) {
    state.detectedRate = null;
    state.result = null;
    hideResult();
    renderChips(null);
    renderWarnings([]);
    if (!els.editorCard.classList.contains('is-hidden')) {
      showError({ code: 'empty-input' });
    }
    return;
  }

  const detectedRate = detectSampleRate(text);
  if (detectedRate && detectedRate !== state.detectedRate) {
    state.detectedRate = detectedRate;
    applySampleRate(detectedRate);
  }

  const result = convertConfig(text, {
    sampleRate: state.sampleRate,
    device: state.device,
  });

  if (result.device) state.device = result.device;
  else state.device = null;

  renderConversion(result);
}

function renderConversion(result) {
  state.result = result;

  if (result.devices?.length) {
    renderDevices(result.devices, result.device);
  } else {
    els.deviceField.classList.add('is-hidden');
  }

  renderChips(result);
  renderWarnings(result.warnings || []);

  if (!result.ok) {
    hideResult();
    showError(result.error || { code: 'generic' });
    return;
  }

  clearError();
  renderResult(result);
}

function renderDevices(devices, selected) {
  if (devices.length <= 1) {
    els.deviceField.classList.add('is-hidden');
    return;
  }

  const signature = devices.join('\u0000');
  if (els.deviceSelect.dataset.signature !== signature) {
    els.deviceSelect.replaceChildren();
    devices.forEach((device) => {
      const option = document.createElement('option');
      option.value = device;
      option.textContent = device;
      els.deviceSelect.append(option);
    });
    els.deviceSelect.dataset.signature = signature;
  }

  if (devices.includes(selected)) els.deviceSelect.value = selected;
  els.deviceField.classList.remove('is-hidden');
}

function createChip(text, extraClass = '') {
  const chip = document.createElement('span');
  chip.className = `chip ${extraClass}`.trim();
  chip.textContent = text;
  return chip;
}

function renderChips(result) {
  els.chips.replaceChildren();
  if (!result) return;

  if (result.filters) {
    for (const [type, count] of Object.entries(result.filters)) {
      els.chips.append(createChip(`${FILTER_LABELS[type] ?? type} ×${count}`, `type-${type}`));
    }
  }

  if (result.disabledCount > 0) {
    els.chips.append(createChip(`${result.disabledCount} × ${t('offChip')}`, 'off'));
  }

  if (result.preamp !== null && result.preamp !== undefined) {
    els.chips.append(
      createChip(`Preamp ${formatDb(result.preamp)} dB · ${t('preampIgnored')}`, 'preamp'),
    );
  }

  const rate = result.sampleRate ?? state.sampleRate;
  els.chips.append(createChip(`${rate / 1000} kHz`, 'muted'));
}

function warningMessage(warning) {
  switch (warning.code) {
    case 'convolution':
      return t('warnConvolution');
    case 'include':
      return t('warnInclude');
    case 'unsupported-filter-type':
      return template('warnUnsupportedFilter', { type: warning.type });
    case 'missing-parameter':
      return template('warnMissingParam', { parameter: warning.parameter });
    case 'invalid-value':
      return template('warnInvalidValue', { parameter: warning.parameter });
    case 'ignored-command':
      return template('warnIgnoredCommand', { command: warning.command });
    case 'ignored-line':
      return template('warnIgnoredLine', { text: truncate(warning.text) });
    case 'missing-q':
      return template('warnMissingQ', {
        typeLabel: warning.typeLabel || warning.type || '?',
        q: formatQ(warning.q),
      });
    case 'graphic-eq-empty':
      return t('warnGraphicEq');
    case 'above-nyquist':
      return template('warnAboveNyquist', {
        fc: Math.round(warning.fc),
        nyquist: Math.round(warning.sampleRate / 2),
      });
    default:
      return t('warnGeneric');
  }
}

function renderWarnings(warnings) {
  els.warnings.replaceChildren();

  if (!warnings.length) {
    els.warnings.classList.add('is-hidden');
    return;
  }

  const title = document.createElement('p');
  title.className = 'warnings-title';
  title.textContent = `${t('warningsTitle')} (${warnings.length})`;
  els.warnings.append(title);

  const list = document.createElement('ul');
  list.className = 'warning-list';

  warnings.forEach((warning) => {
    const item = document.createElement('li');
    if (warning.line) {
      const line = document.createElement('span');
      line.className = 'warning-line';
      line.textContent = `L${warning.line}`;
      item.append(line);
    }
    const message = document.createElement('span');
    message.textContent = warningMessage(warning);
    item.append(message);
    list.append(item);
  });

  els.warnings.append(list);
  els.warnings.classList.remove('is-hidden');
}

function errorMessage(code) {
  switch (code) {
    case 'empty-input':
      return t('errEmptyInput');
    case 'no-filters':
      return t('errNoFilters');
    case 'no-active-filters':
      return t('errNoActiveFilters');
    case 'invalid-sample-rate':
      return t('errInvalidRate');
    default:
      return t('errGeneric');
  }
}

function showError(error) {
  els.errorBox.replaceChildren();
  const title = document.createElement('h4');
  title.textContent = t('errorTitle');
  const message = document.createElement('p');
  message.textContent = errorMessage(error?.code);
  els.errorBox.append(title, message);
  els.errorBox.classList.remove('is-hidden');
}

function clearError() {
  els.errorBox.replaceChildren();
  els.errorBox.classList.add('is-hidden');
}

function hideResult() {
  els.resultCard.classList.add('is-hidden');
  els.workspace.classList.remove('has-result');
  els.shareBtn.classList.add('is-hidden');
}

function renderResult(result) {
  els.resultCard.classList.remove('is-hidden');
  els.workspace.classList.add('has-result');
  els.bandBadge.textContent = `${result.bands.length} ${t('bandUnit')}`;
  els.outputPreview.textContent = result.graphicEq;

  renderStats(result);
  updateShareButton(result);
  drawChart(result);
}

function renderStats(result) {
  els.statGrid.replaceChildren();

  const stats = [
    { label: t('statBands'), value: String(result.stats.bands), className: 'accent' },
    { label: t('statFilters'), value: String(result.stats.filterCount) },
    {
      label: t('statRange'),
      value: `${formatDb(result.stats.max - result.stats.min)} dB`,
    },
    {
      label: t('statCut'),
      value: `${formatDb(result.stats.min)} dB`,
      className: result.stats.min < -6 ? 'warn' : '',
    },
  ];

  stats.forEach((stat) => {
    const item = document.createElement('div');
    item.className = 'stat';

    const label = document.createElement('span');
    label.className = 'stat-label';
    label.textContent = stat.label;

    const value = document.createElement('span');
    value.className = `stat-value ${stat.className || ''}`.trim();
    value.textContent = stat.value;

    item.append(label, value);
    els.statGrid.append(item);
  });
}

/* -------------------------------------------------------------------------- */
/* Chart                                                                      */
/* -------------------------------------------------------------------------- */

function niceStep(value) {
  const power = 10 ** Math.floor(Math.log10(Math.max(value, 0.0001)));
  const normalized = value / power;
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return multiplier * power;
}

function chartTickLabel(value) {
  if (value >= 1000) {
    const kilo = value / 1000;
    return `${kilo >= 10 ? kilo.toFixed(0) : kilo.toFixed(0)}k`;
  }
  return String(Math.round(value));
}

function drawChart(result) {
  const width = Math.max(280, Math.floor(els.chartShell.clientWidth || 640));
  const compact = window.matchMedia('(max-width: 560px)').matches;
  const height = compact ? 218 : 250;
  const margin = { top: 15, right: 10, bottom: 26, left: 34 };
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;
  chartWidth = width;

  const original = result.curves.original;
  const wavelet = result.curves.wavelet;
  const values = [...original.map((point) => point.gain), ...wavelet.map((point) => point.gain)];
  const minValue = Math.min(0, ...values);
  const span = Math.max(4, 0 - minValue);
  const step = niceStep(span / 4);
  let yMin = Math.min(-2, Math.floor((minValue - 0.5) / step) * step);
  if (yMin > -2) yMin = -2;
  const yMax = 0;

  const logMin = Math.log10(20);
  const logMax = Math.log10(20000);
  const xOf = (frequency) =>
    plotLeft + ((Math.log10(frequency) - logMin) / (logMax - logMin)) * (plotRight - plotLeft);
  const yOf = (gain) => plotTop + ((yMax - gain) / (yMax - yMin)) * (plotBottom - plotTop);

  const pathFor = (points, key) => {
    let path = '';
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      path += `${index ? 'L' : 'M'}${xOf(point.frequency).toFixed(1)} ${yOf(point[key]).toFixed(1)} `;
    }
    return path.trim();
  };

  const areaPath = () => {
    let path = `M${xOf(wavelet[0].frequency).toFixed(1)} ${yOf(0).toFixed(1)} `;
    for (const point of wavelet) {
      path += `L${xOf(point.frequency).toFixed(1)} ${yOf(point.gain).toFixed(1)} `;
    }
    path += `L${xOf(wavelet[wavelet.length - 1].frequency).toFixed(1)} ${yOf(0).toFixed(1)} Z`;
    return path;
  };

  const xTicks = width < 430 ? [20, 100, 1000, 10000, 20000] : [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  const yTickCount = Math.round((0 - yMin) / step);
  const yTicks = [];
  for (let index = 0; index <= yTickCount; index += 1) {
    yTicks.push(yMin + index * step);
  }

  const xGrid = xTicks
    .map((frequency) => {
      const x = xOf(frequency).toFixed(1);
      return `<line x1="${x}" y1="${plotTop}" x2="${x}" y2="${plotBottom}" stroke="rgba(148,163,184,0.075)" />`;
    })
    .join('');

  const xLabels = [];
  xTicks.forEach((frequency, index) => {
    const x = xOf(frequency);
    const isLast = index === xTicks.length - 1;
    const isFirst = index === 0;
    if (!isLast && x - (xLabels.length ? xLabels[xLabels.length - 1].x : -Infinity) < 30) return;
    if (isLast && xLabels.length > 1 && x - xLabels[xLabels.length - 1].x < 30) {
      xLabels.pop();
    }
    xLabels.push({ x, isFirst, isLast, frequency });
  });

  const xLabelMarkup = xLabels
    .map(({ x, isFirst, isLast, frequency }) => {
      const anchor = isFirst ? 'start' : isLast ? 'end' : 'middle';
      return `<text x="${x.toFixed(1)}" y="${plotBottom + 17}" text-anchor="${anchor}" fill="#617188" font-size="10.5" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">${chartTickLabel(frequency)}</text>`;
    })
    .join('');

  const yGrid = yTicks
    .map((gain) => {
      const y = yOf(gain).toFixed(1);
      const isZero = Math.abs(gain) < 0.0001;
      return `<line x1="${plotLeft}" y1="${y}" x2="${plotRight}" y2="${y}" stroke="${isZero ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.075)'}" ${isZero ? 'stroke-dasharray="3 4"' : ''} />`;
    })
    .join('');

  const yLabels = yTicks
    .map((gain) => {
      const y = yOf(gain);
      const label = Math.abs(gain) < 0.0001 ? '0' : (Number.isInteger(gain) ? String(gain) : gain.toFixed(1));
      return `<text x="${plotLeft - 8}" y="${(y + 3.5).toFixed(1)}" text-anchor="end" fill="#617188" font-size="10" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">${label}</text>`;
    })
    .join('');

  els.chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
  els.chart.setAttribute('width', String(width));
  els.chart.setAttribute('height', String(height));
  els.chart.setAttribute('aria-label', t('chartAria'));

  els.chart.innerHTML = `
    <defs>
      <linearGradient id="waveletStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#5eead4" />
        <stop offset="55%" stop-color="#7dd3fc" />
        <stop offset="100%" stop-color="#818cf8" />
      </linearGradient>
      <linearGradient id="waveletFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5eead4" stop-opacity="0.24" />
        <stop offset="100%" stop-color="#5eead4" stop-opacity="0" />
      </linearGradient>
      <clipPath id="plotClip">
        <rect x="${plotLeft}" y="${plotTop}" width="${plotRight - plotLeft}" height="${plotBottom - plotTop}" />
      </clipPath>
    </defs>
    <g clip-path="url(#plotClip)">
      <path d="${areaPath()}" fill="url(#waveletFill)" />
    </g>
    <g class="chart-grid">${xGrid}${yGrid}</g>
    <g>${xLabelMarkup}${yLabels}</g>
    <g clip-path="url(#plotClip)">
      <path d="${pathFor(original, 'gain')}" fill="none" stroke="rgba(148,163,184,0.55)" stroke-width="1.2" stroke-dasharray="4 4" />
      <path d="${pathFor(wavelet, 'gain')}" fill="none" stroke="url(#waveletStroke)" stroke-width="5" opacity="0.13" />
      <path d="${pathFor(wavelet, 'gain')}" fill="none" stroke="url(#waveletStroke)" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" />
    </g>
    <g id="crosshair" class="is-hidden">
      <line id="crosshairLine" x1="0" x2="0" y1="${plotTop}" y2="${plotBottom}" stroke="rgba(226,232,240,0.3)" stroke-dasharray="3 4" />
      <circle id="crosshairOriginal" r="3" fill="#94a3b8" stroke="#0b1119" stroke-width="1.5" />
      <circle id="crosshairWavelet" r="3.5" fill="#5eead4" stroke="#0b1119" stroke-width="1.5" />
    </g>
  `;

  attachChartInteractions(result, {
    width,
    height,
    plotLeft,
    plotRight,
    plotTop,
    plotBottom,
    logMin,
    logMax,
    yMin,
    yMax,
  });
}

function interpolateCurve(curve, frequency) {
  const logFrequency = Math.log10(frequency);
  const first = curve[0];
  const last = curve[curve.length - 1];
  if (frequency <= first.frequency) return first.gain;
  if (frequency >= last.frequency) return last.gain;

  let low = 0;
  let high = curve.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (curve[middle].frequency <= frequency) low = middle;
    else high = middle;
  }

  const left = curve[low];
  const right = curve[high];
  const ratio =
    (logFrequency - Math.log10(left.frequency)) /
    (Math.log10(right.frequency) - Math.log10(left.frequency));
  return left.gain + (right.gain - left.gain) * ratio;
}

function attachChartInteractions(result, geometry) {
  const svg = els.chart;
  const tooltip = els.chartTooltip;
  const line = svg.querySelector('#crosshairLine');
  const dotOriginal = svg.querySelector('#crosshairOriginal');
  const dotWavelet = svg.querySelector('#crosshairWavelet');
  const crosshair = svg.querySelector('#crosshair');

  const hide = () => {
    crosshair.classList.add('is-hidden');
    tooltip.classList.add('is-hidden');
  };

  const move = (event) => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const scale = geometry.width / rect.width;
    const x = (event.clientX - rect.left) * scale;

    if (x < geometry.plotLeft - 4 || x > geometry.plotRight + 4) {
      hide();
      return;
    }

    const clampedX = Math.min(Math.max(x, geometry.plotLeft), geometry.plotRight);
    const ratio = (clampedX - geometry.plotLeft) / (geometry.plotRight - geometry.plotLeft);
    const logFrequency = geometry.logMin + ratio * (geometry.logMax - geometry.logMin);
    const frequency = 10 ** logFrequency;
    const wavelet = interpolateCurve(result.curves.wavelet, frequency);
    const original = interpolateCurve(result.curves.original, frequency);

    const yToPixels = (gain) =>
      geometry.plotTop +
      ((geometry.yMax - gain) / (geometry.yMax - geometry.yMin)) *
        (geometry.plotBottom - geometry.plotTop);

    line.setAttribute('x1', clampedX);
    line.setAttribute('x2', clampedX);
    line.setAttribute('y1', geometry.plotTop);
    line.setAttribute('y2', geometry.plotBottom);
    dotOriginal.setAttribute('cx', clampedX);
    dotOriginal.setAttribute('cy', yToPixels(original));
    dotWavelet.setAttribute('cx', clampedX);
    dotWavelet.setAttribute('cy', yToPixels(wavelet));
    crosshair.classList.remove('is-hidden');

    tooltip.innerHTML = `
      <strong>${formatFrequency(frequency)}</strong>
      <span class="tip-wavelet">${t('legendWavelet').split(' ')[0]} ${formatDb(wavelet)} dB</span>
      <span class="tip-original">${t('legendApo')} ${formatDb(original)} dB</span>
    `;
    tooltip.classList.remove('is-hidden');

    const shellRect = els.chartShell.getBoundingClientRect();
    const tooltipX = Math.min(
      Math.max(event.clientX - shellRect.left, 58),
      shellRect.width - 58,
    );
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${Math.max(yToPixels(wavelet), 48)}px`;
  };

  svg.onpointermove = move;
  svg.onpointerdown = move;
  svg.onpointerleave = hide;
  svg.onpointercancel = hide;
  svg.onpointerup = (event) => {
    if (event.pointerType !== 'mouse') {
      window.clearTimeout(tooltipTimer);
      tooltipTimer = window.setTimeout(hide, 1800);
    }
  };
}

function setupChartResize() {
  const redraw = () => {
    if (!state.result?.ok) return;
    const width = els.chartShell.clientWidth;
    if (Math.abs(width - chartWidth) <= 2) return;
    window.cancelAnimationFrame(chartResizeFrame);
    chartResizeFrame = window.requestAnimationFrame(() => drawChart(state.result));
  };

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(redraw);
    observer.observe(els.chartShell);
  } else {
    window.addEventListener('resize', redraw, { passive: true });
  }
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

function fileNameForDownload() {
  if (!state.fileName) return 'GraphicEQ.txt';
  const base = state.fileName.replace(/\.[^.]+$/, '') || 'GraphicEQ';
  if (/graphic\s*eq/i.test(base)) return `${base}.txt`;
  return `${base} GraphicEQ.txt`;
}

function makeShareFile(result) {
  return new File([result.graphicEq], fileNameForDownload(), { type: 'text/plain' });
}

function updateShareButton(result) {
  let canShare = false;
  if (typeof File === 'function' && navigator.share) {
    try {
      canShare = typeof navigator.canShare !== 'function' || navigator.canShare({ files: [makeShareFile(result)] });
    } catch {
      canShare = false;
    }
  }
  els.shareBtn.classList.toggle('is-hidden', !canShare);
}

function downloadResult() {
  if (!state.result?.ok) return;
  const blob = new Blob([state.result.graphicEq], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileNameForDownload();
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  showToast(t('toastDownload'));
}

async function copyResult() {
  if (!state.result?.ok) return;
  const text = state.result.graphicEq;

  try {
    await navigator.clipboard.writeText(text);
    showToast(t('toastCopied'));
    return;
  } catch {
    /* fall back below */
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  area.remove();
  showToast(copied ? t('toastCopied') : t('toastCopyFailed'));
}

async function shareResult() {
  if (!state.result?.ok) return;
  try {
    await navigator.share({
      files: [makeShareFile(state.result)],
      title: t('shareTitle'),
      text: t('shareText'),
    });
  } catch (error) {
    if (error?.name !== 'AbortError') showToast(t('toastShareFailed'));
  }
}

/* -------------------------------------------------------------------------- */
/* Event wiring                                                               */
/* -------------------------------------------------------------------------- */

els.chooseBtn.addEventListener('click', () => els.fileInput.click());
els.dropTarget.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    els.fileInput.click();
  }
});

els.fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) handleFile(file);
  event.target.value = '';
});

['dragenter', 'dragover'].forEach((eventName) => {
  els.dropCard.addEventListener(eventName, (event) => {
    event.preventDefault();
    els.dropCard.classList.add('is-dragging');
  });
});

els.dropCard.addEventListener('dragleave', (event) => {
  if (!els.dropCard.contains(event.relatedTarget)) {
    els.dropCard.classList.remove('is-dragging');
  }
});

els.dropCard.addEventListener('drop', (event) => {
  event.preventDefault();
  els.dropCard.classList.remove('is-dragging');
  const file = event.dataTransfer?.files?.[0];
  if (file) handleFile(file);
});

els.pasteBtn.addEventListener('click', () => {
  loadText('', null, 'paste');
});

els.exampleBtn.addEventListener('click', () => {
  loadText(EXAMPLE_CONFIG, 'eqapo-example.txt', 'example');
});

els.resetBtn.addEventListener('click', resetApp);

els.configInput.addEventListener('input', () => {
  updateCharCount();
  window.clearTimeout(convertTimer);
  convertTimer = window.setTimeout(convertNow, 220);
});

els.deviceSelect.addEventListener('change', () => {
  state.device = els.deviceSelect.value;
  convertNow();
});

els.sampleRateGroup.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-rate]');
  if (!button) return;
  const rate = Number(button.dataset.rate);
  if (!Number.isFinite(rate) || rate === state.sampleRate) return;

  applySampleRate(rate);
  convertNow();
});

els.langButton.addEventListener('click', () => {
  if (els.langMenu.hidden) openLanguageMenu(null);
  else closeLanguageMenu();
});

els.langMenu.querySelectorAll('.lang-option').forEach((option) => {
  option.addEventListener('click', () => {
    const value = option.dataset.lang;
    if (value === 'en' || value === 'pl' || value === 'de') {
      state.lang = value;
      applyLanguage();
    }
    closeLanguageMenu(true);
  });
});

els.langPicker.addEventListener('keydown', (event) => {
  const options = [...els.langMenu.querySelectorAll('.lang-option')];

  if (event.key === 'Escape') {
    if (!els.langMenu.hidden) {
      event.preventDefault();
      closeLanguageMenu(true);
    }
    return;
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const forward = event.key === 'ArrowDown';

    if (els.langMenu.hidden) {
      openLanguageMenu(forward ? 'selected' : 'last');
      return;
    }

    const index = options.indexOf(document.activeElement);
    const next =
      index < 0
        ? forward
          ? 0
          : options.length - 1
        : (index + (forward ? 1 : -1) + options.length) % options.length;
    options[next]?.focus();
    return;
  }

  if (els.langMenu.hidden) return;

  if (event.key === 'Home') {
    event.preventDefault();
    options[0]?.focus();
  } else if (event.key === 'End') {
    event.preventDefault();
    options[options.length - 1]?.focus();
  }
});

els.langPicker.addEventListener('focusout', (event) => {
  if (!els.langPicker.contains(event.relatedTarget)) closeLanguageMenu();
});

document.addEventListener('click', (event) => {
  if (!els.langMenu.hidden && !els.langPicker.contains(event.target)) closeLanguageMenu();
});

els.downloadBtn.addEventListener('click', downloadResult);
els.copyBtn.addEventListener('click', copyResult);
els.shareBtn.addEventListener('click', shareResult);

/* -------------------------------------------------------------------------- */
/* Start                                                                      */
/* -------------------------------------------------------------------------- */

applyLanguage();
applySampleRate(state.sampleRate);
setupChartResize();
