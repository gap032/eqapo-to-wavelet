import { convertConfig } from '../public/core.js';

const API_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: API_HEADERS,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'eqapo-to-wavelet' });
    }

    if (url.pathname === '/api/convert') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: API_HEADERS });
      }

      if (request.method !== 'POST') {
        return json({ ok: false, error: { code: 'method-not-allowed' } }, 405);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: { code: 'invalid-json' } }, 400);
      }

      const text = typeof body?.text === 'string' ? body.text : '';
      if (!text.trim()) {
        return json({ ok: false, error: { code: 'empty-input' } }, 400);
      }
      if (text.length > 1_000_000) {
        return json({ ok: false, error: { code: 'too-large' } }, 413);
      }

      const result = convertConfig(text, {
        sampleRate:
          body?.sampleRate === undefined || body?.sampleRate === null || body?.sampleRate === ''
            ? undefined
            : Number(body.sampleRate),
        device: typeof body.device === 'string' ? body.device : undefined,
      });

      return json(result, result.ok ? 200 : 422);
    }

    return env.ASSETS.fetch(request);
  },
};
