/**
 * EQ APO / Peace -> Wavelet GraphicEQ
 *
 * Pure conversion core. No DOM, no dependencies, safe to run in a browser,
 * in a Cloudflare Worker, or in Node for tests.
 *
 * The processing pipeline mirrors the original eqapotographiceq-gui project
 * (AutoEQ smoothing + Equalizer APO GraphicEQ writer), but computes the
 * equalizer transfer function directly from the filter definitions instead
 * of rendering it through Equalizer APO on Windows.
 */

export const DEFAULT_SAMPLE_RATE = 48000;
export const SAMPLE_RATES = [44100, 48000, 96000, 192000];

const KNOWN_SAMPLE_RATES = new Set([
  8000, 11025, 16000, 22050, 32000, 44100, 48000, 64000, 88200, 96000, 176400, 192000, 352800, 384000,
]);

export const GRID_MIN = 20;
export const GRID_MAX = 22000;
export const GRID_STEP = 1.01;

export const BAND_MIN = 20;
export const BAND_MAX = 20000;
export const BAND_STEP = 1.0563;

const MAX_GAIN = 25;
const TRIM_MIN_BANDS = 20;

const TYPE_ALIASES = {
  pk: 'peaking',
  peak: 'peaking',
  peaking: 'peaking',
  bell: 'peaking',
  peq: 'peaking',
  ls: 'lowshelf',
  lsc: 'lowshelf',
  lowshelf: 'lowshelf',
  'low shelf': 'lowshelf',
  hs: 'highshelf',
  hsc: 'highshelf',
  highshelf: 'highshelf',
  'high shelf': 'highshelf',
  lp: 'lowpass',
  lpf: 'lowpass',
  lowpass: 'lowpass',
  'low pass': 'lowpass',
  hp: 'highpass',
  hpf: 'highpass',
  highpass: 'highpass',
  'high pass': 'highpass',
  no: 'notch',
  notch: 'notch',
  bp: 'bandpass',
  bpf: 'bandpass',
  bandpass: 'bandpass',
  'band pass': 'bandpass',
  ap: 'allpass',
  allpass: 'allpass',
  'all pass': 'allpass',
};

const DEFAULT_Q = {
  peaking: 1,
  lowshelf: Math.SQRT1_2,
  highshelf: Math.SQRT1_2,
  lowpass: Math.SQRT1_2,
  highpass: Math.SQRT1_2,
  notch: 1,
  bandpass: 1,
};

const IGNORED_COMMANDS = /^(Channel|Copy|Delay|Stage|Benchmark|Eval|If|ElseIf|Else|EndIf|End|Select|Virtual|Output|Input|Plugin|Command|Device)\b/i;

/** Metadata used by the UI and by consumers of the API. */
export const FILTER_LABELS = {
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

/* -------------------------------------------------------------------------- */
/* Parsing                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Splits an APO/Peace config into the global preamble and per-device sections.
 * @param {string} text
 */
export function parseConfig(text) {
  const source = String(text ?? '').replace(/^\uFEFF/, '');
  const rawLines = source.split(/\r\n|\r|\n/);
  const globalLines = [];
  const sections = [];
  const devices = [];
  let current = null;

  rawLines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith('//')) return;

    const deviceMatch = /^Device\s*:\s*(.*)$/i.exec(line);
    if (deviceMatch) {
      const name = deviceMatch[1].trim() || 'all';
      current = { name, lines: [], line: index + 1 };
      sections.push(current);
      if (!devices.includes(name)) devices.push(name);
      return;
    }

    const entry = { text: line, line: index + 1 };
    if (current) current.lines.push(entry);
    else globalLines.push(entry);
  });

  return { rawLines, globalLines, sections, devices };
}

function isAllDevice(name) {
  return /^(all|\*)$/i.test(name.trim());
}

function isKnownSampleRate(value) {
  return Number.isFinite(value) && KNOWN_SAMPLE_RATES.has(Math.round(value));
}

/**
 * Looks for the device sample rate in metadata lines such as
 * `Sample rate: 48000`, `48 kHz` or an AutoEQ-style `... 96000Hz` title.
 * Filter and GraphicEQ lines are ignored so their `Fc` values cannot match.
 * @param {string} text
 * @returns {number|null}
 */
export function detectSampleRate(text) {
  const lines = String(text ?? '').replace(/^\uFEFF/, '').split(/\r\n|\r|\n/);
  let fallback = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^(Filter\b|GraphicEQ\s*:|Preamp\s*:|Include\s*:|Convolution\s*:)/i.test(line)) continue;

    const explicit = /(?:sample\s*rate|^fs)\s*[:=]?\s*(\d{4,6}|\d+(?:[.,]\d+)?\s*kHz)/i.exec(line);
    if (explicit) {
      const value = /khz/i.test(explicit[1])
        ? Math.round(toNumber(explicit[1].replace(/\s*kHz/i, '')) * 1000)
        : toNumber(explicit[1]);
      if (isKnownSampleRate(value)) return Math.round(value);
    }

    const khz = /(\d+(?:[.,]\d+)?)\s*kHz\b/i.exec(line);
    if (khz) {
      const value = Math.round(toNumber(khz[1]) * 1000);
      if (isKnownSampleRate(value)) fallback ??= value;
    }

    const hz = /(\d{4,6})\s*Hz\b/i.exec(line);
    if (hz) {
      const value = toNumber(hz[1]);
      if (isKnownSampleRate(value)) fallback ??= Math.round(value);
    }
  }

  return fallback;
}

function selectInput(parsed, requestedDevice) {
  if (!parsed.sections.length) {
    return { lines: parsed.globalLines, device: null, devices: [] };
  }

  const device = parsed.devices.includes(requestedDevice)
    ? requestedDevice
    : parsed.devices[0];
  const lines = [...parsed.globalLines];

  for (const section of parsed.sections) {
    if (section.name === device || isAllDevice(section.name)) {
      lines.push(...section.lines);
    }
  }

  return { lines, device, devices: parsed.devices };
}

function toNumber(value) {
  if (value === null || value === undefined) return null;
  const number = Number(String(value).replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function readParam(text, name, units = '') {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(
    `(?:^|\\s)${escaped}\\s*[:=]?\\s*([-+]?\\d+(?:[.,]\\d+)?)\\s*${units}`,
    'i',
  );
  const match = regex.exec(text);
  return match ? toNumber(match[1]) : null;
}

function readBandwidth(text) {
  const match = /(?:^|\s)BW\s+(?:Oct(?:aves?)?\s+)?([-+]?\d+(?:[.,]\d+)?)/i.exec(text);
  return match ? toNumber(match[1]) : null;
}

function readFilterType(text) {
  const tokens = text.trim().split(/\s+/);
  for (let length = Math.min(2, tokens.length); length >= 1; length -= 1) {
    const key = tokens.slice(0, length).join(' ').toLowerCase();
    if (TYPE_ALIASES[key]) return { type: TYPE_ALIASES[key], key };
  }
  return null;
}

function parseGraphicEqPoints(value) {
  const points = [];
  const pairPattern = /([-+]?\d+(?:[.,]\d+)?)\s+([-+]?\d+(?:[.,]\d+)?)/g;
  let match;
  while ((match = pairPattern.exec(value)) !== null) {
    const frequency = toNumber(match[1]);
    const gain = toNumber(match[2]);
    if (frequency !== null && frequency > 0 && gain !== null) {
      points.push({ frequency, gain });
    }
  }

  const byFrequency = new Map();
  for (const point of points) byFrequency.set(point.frequency, point);
  return [...byFrequency.values()].sort((a, b) => a.frequency - b.frequency);
}

/**
 * Parses the selected lines. Returns filters, warnings and a small summary.
 */
function parseLines(lines) {
  const filters = [];
  const warnings = [];
  const byType = {};
  let disabled = 0;
  let preamp = null;
  let sawDirective = false;

  const addType = (type) => {
    byType[type] = (byType[type] || 0) + 1;
  };

  for (const entry of lines) {
    const { text, line } = entry;

    if (!sawDirective) {
      // Export headers (AutoEQ/Peace titles, timestamps) come before the first
      // real directive and are not commands we should warn about.
      if (!text.includes(':') && !IGNORED_COMMANDS.test(text)) continue;
      sawDirective = true;
    }

    if (/^Preamp\s*:/i.test(text)) {
      preamp = readParam(text, 'Preamp', '(?:dB)?');
      continue;
    }

    const filterMatch = /^Filter\s*\d*\s*:\s*(ON|OFF)\b(.*)$/i.exec(text);
    if (filterMatch) {
      const enabled = /^ON$/i.test(filterMatch[1]);
      const rest = filterMatch[2].trim();
      const typeInfo = readFilterType(rest);

      if (!enabled) {
        disabled += 1;
        if (typeInfo) addType(typeInfo.type);
        continue;
      }

      if (!typeInfo) {
        warnings.push({
          code: 'unsupported-filter-type',
          line,
          type: rest.split(/\s+/)[0] || '?',
        });
        continue;
      }

      const type = typeInfo.type;
      const fc = readParam(rest, 'Fc', '(?:Hz)?');
      if (fc === null || fc <= 0) {
        warnings.push({ code: 'missing-parameter', line, parameter: 'Fc' });
        continue;
      }

      const gain = readParam(rest, 'Gain', '(?:dB)?') ?? 0;
      let q = readParam(rest, 'Q');
      let slope = readParam(rest, 'S');
      const bandwidth = readBandwidth(rest);

      if (q !== null && q <= 0) {
        warnings.push({ code: 'invalid-value', line, parameter: 'Q' });
        q = null;
      }
      if (slope !== null && slope <= 0) {
        warnings.push({ code: 'invalid-value', line, parameter: 'S' });
        slope = null;
      }

      const needsQ = type !== 'allpass';
      if (needsQ && q === null && slope === null && bandwidth === null) {
        const fallback = DEFAULT_Q[type] ?? 1;
        warnings.push({
          code: 'missing-q',
          line,
          q: fallback,
          typeLabel: FILTER_LABELS[type] || type,
        });
      }

      filters.push({
        kind: 'biquad',
        type,
        fc,
        gain,
        q,
        slope,
        bandwidth,
        line,
      });
      addType(type);
      continue;
    }

    if (/^GraphicEQ\s*:/i.test(text)) {
      const value = text.slice(text.indexOf(':') + 1);
      const points = parseGraphicEqPoints(value);
      if (points.length < 2) {
        warnings.push({ code: 'graphic-eq-empty', line });
        continue;
      }
      filters.push({ kind: 'graphicEq', points, line });
      addType('graphiceq');
      continue;
    }

    if (/^Convolution\s*:/i.test(text)) {
      warnings.push({ code: 'convolution', line });
      continue;
    }

    if (/^Include\s*:/i.test(text)) {
      warnings.push({ code: 'include', line });
      continue;
    }

    if (IGNORED_COMMANDS.test(text)) continue;

    const commandMatch = /^([^:]+)\s*:/.exec(text);
    if (commandMatch) {
      warnings.push({
        code: 'ignored-command',
        line,
        command: commandMatch[1].trim(),
      });
    } else {
      warnings.push({ code: 'ignored-line', line, text });
    }
  }

  return {
    filters,
    warnings,
    preamp,
    summary: {
      active: filters.length,
      disabled,
      byType,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Frequency response                                                         */
/* -------------------------------------------------------------------------- */

function bandwidthToQ(bandwidth, type) {
  if (!(bandwidth > 0)) return null;
  if (type === 'peaking' || type === 'notch' || type === 'bandpass') {
    const p = 2 ** bandwidth;
    return Math.sqrt(p) / (p - 1);
  }
  return 1 / (2 * Math.sinh((Math.LN2 / 2) * bandwidth));
}

function resolveQ(filter) {
  if (filter.q !== null && filter.q > 0) return filter.q;
  if (filter.bandwidth !== null) {
    const q = bandwidthToQ(filter.bandwidth, filter.type);
    if (q && q > 0) return q;
  }
  return DEFAULT_Q[filter.type] ?? 1;
}

/**
 * RBJ biquad coefficients. The response is evaluated as a complex transfer
 * function, which matches Equalizer APO's biquad magnitude response.
 */
function designBiquad(filter, sampleRate) {
  const fs = sampleRate;
  const nyquist = fs / 2;
  const fc = Math.min(Math.max(filter.fc, 0.0001), nyquist * 0.9999);
  const w0 = (2 * Math.PI * fc) / fs;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const A = 10 ** ((filter.gain || 0) / 40);
  const type = filter.type;

  let alpha;
  if ((type === 'lowshelf' || type === 'highshelf') && filter.q === null && filter.slope !== null) {
    const slope = Math.max(filter.slope, 0.0001);
    alpha = (sin / 2) * Math.sqrt((A + 1 / A) * (1 / slope - 1) + 2);
  } else {
    alpha = sin / (2 * resolveQ(filter));
  }

  switch (type) {
    case 'peaking':
      return {
        b0: 1 + alpha * A,
        b1: -2 * cos,
        b2: 1 - alpha * A,
        a0: 1 + alpha / A,
        a1: -2 * cos,
        a2: 1 - alpha / A,
      };
    case 'lowshelf': {
      const two = 2 * Math.sqrt(A) * alpha;
      return {
        b0: A * (A + 1 - (A - 1) * cos + two),
        b1: 2 * A * (A - 1 - (A + 1) * cos),
        b2: A * (A + 1 - (A - 1) * cos - two),
        a0: A + 1 + (A - 1) * cos + two,
        a1: -2 * (A - 1 + (A + 1) * cos),
        a2: A + 1 + (A - 1) * cos - two,
      };
    }
    case 'highshelf': {
      const two = 2 * Math.sqrt(A) * alpha;
      return {
        b0: A * (A + 1 + (A - 1) * cos + two),
        b1: -2 * A * (A - 1 + (A + 1) * cos),
        b2: A * (A + 1 + (A - 1) * cos - two),
        a0: A + 1 - (A - 1) * cos + two,
        a1: 2 * (A - 1 - (A + 1) * cos),
        a2: A + 1 - (A - 1) * cos - two,
      };
    }
    case 'lowpass':
      return {
        b0: (1 - cos) / 2,
        b1: 1 - cos,
        b2: (1 - cos) / 2,
        a0: 1 + alpha,
        a1: -2 * cos,
        a2: 1 - alpha,
      };
    case 'highpass':
      return {
        b0: (1 + cos) / 2,
        b1: -(1 + cos),
        b2: (1 + cos) / 2,
        a0: 1 + alpha,
        a1: -2 * cos,
        a2: 1 - alpha,
      };
    case 'notch':
      return {
        b0: 1,
        b1: -2 * cos,
        b2: 1,
        a0: 1 + alpha,
        a1: -2 * cos,
        a2: 1 - alpha,
      };
    case 'bandpass':
      return {
        b0: alpha,
        b1: 0,
        b2: -alpha,
        a0: 1 + alpha,
        a1: -2 * cos,
        a2: 1 - alpha,
      };
    case 'allpass':
      return {
        b0: 1 - alpha,
        b1: -2 * cos,
        b2: 1 + alpha,
        a0: 1 + alpha,
        a1: -2 * cos,
        a2: 1 - alpha,
      };
    default:
      return null;
  }
}

function biquadDb(coeffs, frequency, sampleRate) {
  const w = (2 * Math.PI * frequency) / sampleRate;
  const cosW = Math.cos(w);
  const sinW = Math.sin(w);
  const cos2W = Math.cos(2 * w);
  const sin2W = Math.sin(2 * w);

  const numReal = coeffs.b0 + coeffs.b1 * cosW + coeffs.b2 * cos2W;
  const numImag = -(coeffs.b1 * sinW + coeffs.b2 * sin2W);
  const denReal = coeffs.a0 + coeffs.a1 * cosW + coeffs.a2 * cos2W;
  const denImag = -(coeffs.a1 * sinW + coeffs.a2 * sin2W);

  const power = (numReal * numReal + numImag * numImag) /
    (denReal * denReal + denImag * denImag);
  return 10 * Math.log10(Math.max(power, 1e-24));
}

function interpolatePoints(points, frequency) {
  if (frequency <= points[0].frequency) return points[0].gain;
  const last = points[points.length - 1];
  if (frequency >= last.frequency) return last.gain;

  let low = 0;
  let high = points.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (points[mid].frequency <= frequency) low = mid;
    else high = mid;
  }

  const left = points[low];
  const right = points[high];
  const t = (Math.log10(frequency) - Math.log10(left.frequency)) /
    (Math.log10(right.frequency) - Math.log10(left.frequency));
  return left.gain + (right.gain - left.gain) * t;
}

function responseCurve(filters, frequencies, sampleRate) {
  const result = new Float64Array(frequencies.length);

  for (const filter of filters) {
    if (filter.kind === 'graphicEq') {
      for (let i = 0; i < frequencies.length; i += 1) {
        result[i] += interpolatePoints(filter.points, frequencies[i]);
      }
      continue;
    }

    if (filter.type === 'allpass') continue;
    const coeffs = designBiquad(filter, sampleRate);
    if (!coeffs) continue;
    for (let i = 0; i < frequencies.length; i += 1) {
      result[i] += biquadDb(coeffs, frequencies[i], sampleRate);
    }
  }

  return Array.from(result);
}

function buildGrid() {
  const frequencies = [];
  let frequency = GRID_MIN;
  while (frequency <= GRID_MAX) {
    frequencies.push(frequency);
    frequency *= GRID_STEP;
  }
  return frequencies;
}

function buildBandFrequencies() {
  const count = Math.ceil(Math.log(BAND_MAX / BAND_MIN) / Math.log(BAND_STEP));
  const frequencies = [];
  for (let index = 0; index < count; index += 1) {
    frequencies.push(Math.floor(BAND_MIN * BAND_STEP ** index));
  }
  return [...new Set(frequencies)].sort((a, b) => a - b);
}

/* -------------------------------------------------------------------------- */
/* AutoEQ-style smoothing (Savitzky-Golay, heavy/light combination)           */
/* -------------------------------------------------------------------------- */

function windowSizeFromOctaves(frequencies, octaves) {
  const factor = 2 ** octaves;
  let ratioSum = 0;
  for (let i = 1; i < frequencies.length; i += 1) {
    ratioSum += frequencies[i] / frequencies[i - 1];
  }
  const averageRatio = ratioSum / (frequencies.length - 1);
  let size = Math.round(Math.log(factor) / Math.log(averageRatio));
  if (size % 2 === 0) size += 1;
  if (size < 3) size = 3;
  if (size > frequencies.length) {
    size = frequencies.length % 2 === 0 ? frequencies.length - 1 : frequencies.length;
  }
  return size;
}

function solve3(matrix, vector) {
  const a = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < 3; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < 3; row += 1) {
      if (Math.abs(a[row][column]) > Math.abs(a[pivot][column])) pivot = row;
    }
    [a[column], a[pivot]] = [a[pivot], a[column]];
    const divisor = a[column][column];
    if (Math.abs(divisor) < 1e-12) return [0, 0, 0];
    for (let c = column; c < 4; c += 1) a[column][c] /= divisor;
    for (let row = 0; row < 3; row += 1) {
      if (row === column) continue;
      const factor = a[row][column];
      if (!factor) continue;
      for (let c = column; c < 4; c += 1) a[row][c] -= factor * a[column][c];
    }
  }
  return [a[0][3], a[1][3], a[2][3]];
}

function fitQuadraticNormal(xs, values) {
  const count = xs.length;
  let mean = 0;
  for (const x of xs) mean += x;
  mean /= count;

  let s0 = 0;
  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  let t0 = 0;
  let t1 = 0;
  let t2 = 0;
  for (let i = 0; i < count; i += 1) {
    const x = xs[i] - mean;
    const x2 = x * x;
    s0 += 1;
    s2 += x2;
    s3 += x2 * x;
    s4 += x2 * x2;
    const y = values[i];
    t0 += y;
    t1 += x * y;
    t2 += x2 * y;
  }

  const matrix = [
    [s0, 0, s2],
    [0, s2, 0],
    [s2, 0, s4],
  ];
  const coefficients = solve3(matrix, [t0, t1, t2]);
  return { coefficients, mean };
}

function evaluateQuadratic(fit, x) {
  const centered = x - fit.mean;
  const [a0, a1, a2] = fit.coefficients;
  return a0 + a1 * centered + a2 * centered * centered;
}

function savgolKernel(windowSize) {
  const half = (windowSize - 1) / 2;
  const xs = [];
  for (let i = -half; i <= half; i += 1) xs.push(i);

  let s0 = 0;
  let s2 = 0;
  let s4 = 0;
  for (const x of xs) {
    s0 += 1;
    s2 += x * x;
    s4 += x * x * x * x;
  }
  const matrix = [
    [s0, 0, s2],
    [0, s2, 0],
    [s2, 0, s4],
  ];
  const weights = solve3(matrix, [1, 0, 0]);

  return xs.map((x) => weights[0] + weights[1] * x + weights[2] * x * x);
}

function savgol(values, windowSize) {
  const count = values.length;
  if (windowSize < 3 || windowSize > count) return [...values];
  const half = (windowSize - 1) / 2;
  const kernel = savgolKernel(windowSize);
  const output = new Array(count);

  for (let i = half; i < count - half; i += 1) {
    let sum = 0;
    for (let j = 0; j < windowSize; j += 1) {
      sum += kernel[j] * values[i - half + j];
    }
    output[i] = sum;
  }

  const firstFit = fitQuadraticNormal(
    Array.from({ length: windowSize }, (_, index) => index),
    values.slice(0, windowSize),
  );
  for (let i = 0; i < half; i += 1) {
    output[i] = evaluateQuadratic(firstFit, i);
  }

  const start = count - windowSize;
  const lastValues = values.slice(start);
  const lastFit = fitQuadraticNormal(
    Array.from({ length: windowSize }, (_, index) => index),
    lastValues,
  );
  for (let i = count - half; i < count; i += 1) {
    output[i] = evaluateQuadratic(lastFit, i - start);
  }

  return output;
}

function sigmoidWeights(frequencies, lower, upper) {
  const center = Math.sqrt(upper / lower) * lower;
  const logCenter = Math.log10(center);
  const halfRange = Math.log10(upper) - logCenter;
  return frequencies.map((frequency) => {
    const x = (Math.log10(frequency) - logCenter) / (halfRange / 4);
    return 1 / (1 + Math.exp(-Math.max(-60, Math.min(60, x))));
  });
}

function blendCurves(normal, treble, weights) {
  return normal.map((value, index) => value * (1 - weights[index]) + treble[index] * weights[index]);
}

function smoothResponse(raw, frequencies) {
  const normalWindow = windowSizeFromOctaves(frequencies, 1 / 6);
  const midWindow = windowSizeFromOctaves(frequencies, 1 / 3);
  const trebleWindow = windowSizeFromOctaves(frequencies, 1.3);

  const light = blendCurves(
    savgol(raw, normalWindow),
    savgol(raw, midWindow),
    sigmoidWeights(frequencies, 100, 10000),
  );

  const heavy = blendCurves(
    savgol(raw, midWindow),
    savgol(raw, trebleWindow),
    sigmoidWeights(frequencies, 1000, 6000),
  );

  const combined = light.map((value, index) => Math.min(value, heavy[index]));
  return savgol(combined, midWindow);
}

function meanBetween(frequencies, values, lower, upper) {
  let sum = 0;
  let count = 0;
  for (let i = 0; i < frequencies.length; i += 1) {
    if (frequencies[i] >= lower && frequencies[i] <= upper) {
      sum += values[i];
      count += 1;
    }
  }
  return count ? sum / count : 0;
}

function interpolateCurveAt(frequencies, values, target) {
  if (target <= frequencies[0]) return values[0];
  if (target >= frequencies[frequencies.length - 1]) return values[values.length - 1];

  let low = 0;
  let high = frequencies.length - 1;
  while (high - low > 1) {
    const mid = (low + high) >> 1;
    if (frequencies[mid] <= target) low = mid;
    else high = mid;
  }

  const t = (Math.log10(target) - Math.log10(frequencies[low])) /
    (Math.log10(frequencies[high]) - Math.log10(frequencies[low]));
  return values[low] + (values[high] - values[low]) * t;
}

/* -------------------------------------------------------------------------- */
/* Public conversion API                                                      */
/* -------------------------------------------------------------------------- */

function formatGain(value) {
  const rounded = Math.round(value * 10) / 10;
  const text = rounded.toFixed(1);
  return text === '-0.0' ? '0.0' : text;
}

export function formatGraphicEq(bands) {
  return `GraphicEQ: ${bands.map((band) => `${band.frequency} ${band.gainText}`).join('; ')}`;
}

/**
 * Converts an Equalizer APO or Peace configuration into a Wavelet GraphicEQ.
 *
 * @param {string} text Config contents.
 * @param {object} [options]
 * @param {number} [options.sampleRate=48000] Device sample rate used by APO.
 * @param {string} [options.device] Device section name (from parseConfig()).
 * @returns {object} Result or `{ ok: false, error, warnings }`.
 */
export function convertConfig(text, options = {}) {
  const source = String(text ?? '');
  if (!source.trim()) {
    return { ok: false, error: { code: 'empty-input' }, warnings: [] };
  }

  const requestedSampleRate =
    options.sampleRate === undefined || options.sampleRate === null || options.sampleRate === ''
      ? null
      : Number(options.sampleRate);
  const detectedSampleRate = detectSampleRate(source);
  const sampleRate = requestedSampleRate ?? detectedSampleRate ?? DEFAULT_SAMPLE_RATE;

  if (!Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 384000) {
    return {
      ok: false,
      error: { code: 'invalid-sample-rate' },
      warnings: [],
    };
  }

  const parsed = parseConfig(source);
  const selection = selectInput(parsed, options.device);
  const parsedLines = parseLines(selection.lines);
  const { filters, warnings } = parsedLines;

  const base = {
    ok: false,
    devices: selection.devices,
    device: selection.device,
    sampleRate,
    detectedSampleRate,
    warnings,
    preamp: parsedLines.preamp,
  };

  if (!filters.length) {
    return {
      ...base,
      error: {
        code: parsedLines.summary.disabled > 0 ? 'no-active-filters' : 'no-filters',
      },
      summary: parsedLines.summary,
    };
  }

  for (const filter of filters) {
    if (filter.kind === 'biquad' && filter.fc >= sampleRate / 2) {
      warnings.push({
        code: 'above-nyquist',
        line: filter.line,
        fc: filter.fc,
        sampleRate,
      });
    }
  }
  warnings.sort((a, b) => a.line - b.line);

  const grid = buildGrid();
  const rawCurve = responseCurve(filters, grid, sampleRate);
  const smoothed = smoothResponse(rawCurve, grid);

  const centered = smoothed.map((value) => value - meanBetween(grid, smoothed, 100, 10000));
  const capped = centered.map((value) => Math.min(value, MAX_GAIN));

  const bandFrequencies = buildBandFrequencies();
  const bandValues = bandFrequencies.map((frequency) =>
    interpolateCurveAt(grid, capped, frequency));

  const bandMax = Math.max(...bandValues);
  const offset = bandMax + 0.1;
  const bands = bandFrequencies.map((frequency, index) => {
    const gain = bandValues[index] - offset;
    return { frequency, gain, gainText: formatGain(gain) };
  });

  while (
    bands.length > TRIM_MIN_BANDS &&
    Math.abs(bands[bands.length - 1].gain) < 0.1 &&
    Math.abs(bands[bands.length - 2].gain) < 0.1
  ) {
    bands.pop();
  }

  const rawMax = Math.max(...rawCurve);
  const maxGain = Math.max(...bands.map((band) => band.gain));
  const minGain = Math.min(...bands.map((band) => band.gain));

  return {
    ...base,
    ok: true,
    filters: parsedLines.summary.byType,
    filterCount: parsedLines.summary.active,
    disabledCount: parsedLines.summary.disabled,
    bands,
    graphicEq: formatGraphicEq(bands),
    curves: {
      original: grid.map((frequency, index) => ({
        frequency,
        gain: rawCurve[index] - rawMax,
      })),
      wavelet: grid.map((frequency, index) => ({
        frequency,
        gain: smoothed[index] - offset,
      })),
    },
    stats: {
      bands: bands.length,
      max: maxGain,
      min: minGain,
      filterCount: parsedLines.summary.active,
      preamp: parsedLines.preamp,
      sampleRate,
    },
  };
}
