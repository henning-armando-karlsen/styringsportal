// Supabase Edge Function (PORTAL-prosjektet): ingest-sortiment
//
// Mottar en pakke med arbeidselementer fra Sortimentsverktoeyet og lagrer den i
// portal_state-raden 'sortiment'. Skriving skjer med service-role (bypasser RLS),
// saa Sortiment-appen trenger ALDRI portalens noekler — kun denne URL-en + en delt
// hemmelighet.
//
// Sett hemmelighet (PORTAL-prosjektet):
//   supabase secrets set SORTIMENT_INGEST_SECRET=<lang-tilfeldig-streng>
// Deploy:
//   supabase functions deploy ingest-sortiment
//
// Forventet body: { items: SortimentItem[] }
// SortimentItem = {
//   external_id: string,            // "sopg:<id>" | "sinit:<id>" | "ssteg:<id>"
//   type: 'oppgave'|'initiativ'|'steg',
//   title: string,
//   assignee_email: string|null,    // for tildelte oppgaver (via profiles)
//   assignee_name: string|null,     // for fritekst-ansvarlig (initiativ/steg)
//   status: 'ikke_startet'|'pågår'|'fullført',
//   due: string|null,               // ISO-dato
//   link: string|null,              // dyplenke tilbake til Sortiment-appen
//   kilde: 'sortiment'
// }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-ingest-secret',
};
const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Bruk POST' }, 405);

  const secret = Deno.env.get('SORTIMENT_INGEST_SECRET');
  if (!secret || req.headers.get('x-ingest-secret') !== secret) {
    return json({ error: 'Ugyldig eller manglende hemmelighet' }, 401);
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const items = Array.isArray(body?.items) ? body.items : null;
  if (!items) return json({ error: 'Mangler items[]' }, 400);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const content = { items, synced_at: new Date().toISOString() };
  const { error } = await supabase
    .from('portal_state')
    .upsert({ portal_id: 'sortiment', content, updated_at: new Date().toISOString() }, { onConflict: 'portal_id' });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, count: items.length });
});
