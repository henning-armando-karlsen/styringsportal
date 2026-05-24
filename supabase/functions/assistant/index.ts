// Supabase Edge Function: assistant
// Proxy mot Anthropic slik at API-nøkkelen ALDRI ligger i nettleseren.
//
// Sett hemmelig nøkkel i Supabase:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Deploy:
//   supabase functions deploy assistant
//
// Klienten (appen) kaller POST {SUPABASE_URL}/functions/v1/assistant med samme
// body som Anthropic Messages API ({ model, max_tokens, system, messages }).
// Svaret videreformidles uendret, så appens parsing av `data.content` virker som før.

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Bruk POST' }), { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY mangler i Edge Function secrets' }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const payload = {
    model: body.model || DEFAULT_MODEL,
    max_tokens: body.max_tokens ?? 1500,
    system: body.system,
    messages: body.messages || [],
  };

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  return new Response(text, { status: res.status, headers: { ...cors, 'Content-Type': 'application/json' } });
});
