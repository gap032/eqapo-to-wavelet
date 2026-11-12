import assert from 'node:assert/strict';
import test from 'node:test';

import { convertConfig, detectSampleRate, formatGraphicEq, parseConfig } from '../public/core.js';

const SAMPLE = `
Preamp: -6.0 dB
Filter 1: ON PK Fc 25 Hz Gain 5.0 dB Q 0.7
Filter 2: ON PK Fc 65 Hz Gain -3.0 dB Q 1.2
Filter 3: ON PK Fc 180 Hz Gain 2.5 dB Q 1.0
Filter 4: ON PK Fc 420 Hz Gain -2.0 dB Q 1.4
Filter 5: ON PK Fc 1200 Hz Gain 3.0 dB Q 1.8
Filter 6: ON PK Fc 3200 Hz Gain -4.0 dB Q 2.2
Filter 7: ON PK Fc 6400 Hz Gain 2.0 dB Q 2.5
Filter 8: ON HS Fc 10000 Hz Gain -3.0 dB Q 0.7
`;

test('converts a parametric config to a normalized 127-band GraphicEQ', () => {
  const result = convertConfig(SAMPLE);

  assert.equal(result.ok, true);
  assert.equal(result.error, undefined);
  assert.equal(result.sampleRate, 48000);
  assert.equal(result.filterCount, 8);
  assert.equal(result.stats.bands, 127);
  assert.ok(Math.abs(result.stats.max - -0.1) < 1e-9);
  assert.ok(result.stats.min < -8 && result.stats.min > -9);
  assert.equal(result.warnings.length, 0);

  assert.match(
    result.graphicEq,
    /^GraphicEQ: 20 -0\.5; 21 -0\.3; 22 -0\.2; 23 -0\.1; 24 -0\.1; 26 -0\.2;/,
  );
  assert.ok(!/\s-0\.0(;|$)/.test(result.graphicEq));
});

test('produces one value per band and a waveform curve', () => {
  const result = convertConfig(SAMPLE);

  assert.equal(result.bands.length, 127);
  assert.equal(result.curves.original.length, 704);
  assert.equal(result.curves.wavelet.length, 704);
  assert.equal(result.bands[0].frequency, 20);
  assert.equal(result.bands.at(-1).frequency, 19871);

  result.bands.forEach((band) => {
    assert.match(band.gainText, /^-?\d+\.\d$/);
    assert.ok(Number.isFinite(band.gain));
  });
});

test('formats bands exactly like AutoEQ GraphicEQ', () => {
  const bands = [
    { frequency: 20, gainText: '-3.0' },
    { frequency: 21, gainText: '0.0' },
  ];
  assert.equal(formatGraphicEq(bands), 'GraphicEQ: 20 -3.0; 21 0.0');
});

test('parses and selects device sections', () => {
  const config = `Device: Speakers
Preamp: -2 dB
Filter: ON PK Fc 1000 Hz Gain 8 dB Q 1.0
Device: Headphones
Filter: ON PK Fc 1000 Hz Gain -8 dB Q 1.0
`;

  const parsed = parseConfig(config);
  assert.deepEqual(parsed.devices, ['Speakers', 'Headphones']);

  const speakers = convertConfig(config, { device: 'Speakers' });
  const headphones = convertConfig(config, { device: 'Headphones' });

  assert.equal(speakers.device, 'Speakers');
  assert.equal(headphones.device, 'Headphones');

  const at = (result, frequency) =>
    result.bands.reduce((best, band) =>
      Math.abs(band.frequency - frequency) < Math.abs(best.frequency - frequency) ? band : best,
    );

  assert.ok(at(speakers, 1000).gain > -0.2);
  assert.ok(at(headphones, 1000).gain < -7);
});

test('supports GraphicEQ input lines', () => {
  const result = convertConfig('GraphicEQ: 20 -6; 1000 0; 20000 0');

  assert.equal(result.ok, true);
  assert.equal(result.filterCount, 1);
  assert.equal(result.filters.graphiceq, 1);
  assert.ok(result.bands[0].gain < -5.5);
  assert.ok(result.bands[0].gain > -6.5);
});

test('counts disabled filters and reports unsupported entries', () => {
  const config = `Convolution: impulse.wav
Filter: ON XY Fc 100 Hz Gain 2 dB Q 1
Filter: ON PK Fc 100 Hz Gain 2 dB
Filter 2: OFF PK Fc 1000 Hz Gain 3 dB Q 1
Filter 3: ON PK Fc 1000 Hz Gain 3 dB Q 1
`;
  const result = convertConfig(config);

  assert.equal(result.ok, true);
  assert.equal(result.disabledCount, 1);
  assert.equal(result.filterCount, 2);

  const codes = result.warnings.map((warning) => warning.code);
  assert.ok(codes.includes('convolution'));
  assert.ok(codes.includes('unsupported-filter-type'));
  assert.ok(codes.includes('missing-q'));
});

test('reports an empty input and a config without filters', () => {
  assert.equal(convertConfig('   ').error.code, 'empty-input');

  const disabled = convertConfig('Filter: OFF PK Fc 1000 Hz Gain 4 dB Q 1');
  assert.equal(disabled.ok, false);
  assert.equal(disabled.error.code, 'no-active-filters');

  const none = convertConfig('# only a comment\nPreamp: -3 dB');
  assert.equal(none.error.code, 'no-filters');
});

test('respects the device sample rate', () => {
  const config = 'Filter: ON HS Fc 15000 Hz Gain 6 dB Q 0.7';
  const at44100 = convertConfig(config, { sampleRate: 44100 });
  const at192000 = convertConfig(config, { sampleRate: 192000 });

  const near = (result) =>
    result.bands.reduce((best, band) =>
      Math.abs(band.frequency - 16000) < Math.abs(best.frequency - 16000) ? band : best,
    );

  assert.ok(at44100.stats.min < at192000.stats.min - 0.5);
  assert.notEqual(near(at44100).gainText, near(at192000).gainText);
});

test('handles low shelf, high shelf and pass filters', () => {
  const config = `Filter: ON LS Fc 100 Hz Gain 6 dB Q 0.7
Filter: ON HS Fc 10000 Hz Gain -6 dB Q 0.7
Filter: ON LP Fc 18000 Hz Q 0.7
Filter: ON HP Fc 20 Hz Q 0.7
`;
  const result = convertConfig(config);

  assert.equal(result.ok, true);
  assert.equal(result.filters.lowshelf, 1);
  assert.equal(result.filters.highshelf, 1);
  assert.equal(result.filters.lowpass, 1);
  assert.equal(result.filters.highpass, 1);
  assert.ok(result.stats.min < -5);
});

test('supports bandwidth and slope parameters', () => {
  const bw = convertConfig('Filter: ON PK Fc 1000 Hz Gain 6 dB BW Oct 1');
  const slope = convertConfig('Filter: ON LS Fc 100 Hz Gain 6 dB S 1.0');

  assert.equal(bw.ok, true);
  assert.equal(bw.warnings.length, 0);
  assert.equal(slope.ok, true);
  assert.equal(slope.warnings.length, 0);
});

test('detects the sample rate from export headers and ignores metadata lines', () => {
  const config = `UGREEN HiTune Max5c APO EQ Amirm Optimized Flat@HF 96000Hz
November192024-113729

Preamp: -6.00 dB

Filter 1: ON PK Fc 22.6 Hz Gain 6.25 dB Q 0.63
Filter 2: ON PK Fc 69.8 Hz Gain -6.57 dB Q 1.92
Filter 3: ON PK Fc 230.2 Hz Gain -6.39 dB Q 2.05
Filter 4: ON PK Fc 1041.4 Hz Gain -3.60 dB Q 2.50
`;

  assert.equal(detectSampleRate(config), 96000);

  const result = convertConfig(config);
  assert.equal(result.ok, true);
  assert.equal(result.sampleRate, 96000);
  assert.equal(result.detectedSampleRate, 96000);
  assert.equal(result.warnings.length, 0);

  const explicit = convertConfig(config, { sampleRate: 44100 });
  assert.equal(explicit.sampleRate, 44100);
  assert.equal(explicit.detectedSampleRate, 96000);
});

test('reads sample rate hints in Hz and kHz', () => {
  assert.equal(detectSampleRate('Sample rate: 44100'), 44100);
  assert.equal(detectSampleRate('Sample rate: 48 kHz'), 48000);
  assert.equal(detectSampleRate('GraphicEQ: 20 0; 20000 0'), null);
  assert.equal(detectSampleRate('Filter: ON PK Fc 96000 Hz Gain 1 dB Q 1'), null);
});
