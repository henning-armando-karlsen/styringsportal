import { supabase, SUPABASE_ENABLED } from './supabase.js';

export { SUPABASE_ENABLED };

/*
  Persisteringsmodell (v1):
  Hver portal sin komplette datamodell (org, members, meetings, tasks, ...) lagres
  som ett JSONB-dokument i tabellen `portal_state` (én rad per portal).
  Dette matcher appens interne datastruktur 1:1, så all eksisterende UI virker uendret.
  Radnivå-sikkerhet (RLS) styrer hvem som kan lese/skrive hver portal basert på
  medlemskap i `portal_members`. Se supabase/migrations/0001_init.sql.

  Når dere senere vil ha rapportering på tvers / spørringer per entitet, kan dette
  normaliseres til egne tabeller (meetings, tasks, ...). Strukturen her gjør det
  enkelt å migrere stegvis – be Bolt om hjelp til det når dere er klare.
*/

// Laster alle portaler brukeren har tilgang til. `seeds` brukes som fallback
// for portaler som ennå ikke har et lagret dokument.
export async function loadAllPortals(seeds) {
  if (!SUPABASE_ENABLED) return seeds;
  const { data, error } = await supabase.from('portal_state').select('portal_id, content');
  if (error) throw error;
  const out = { ...seeds };
  (data || []).forEach((row) => {
    if (row && row.content) out[row.portal_id] = row.content;
  });
  return out;
}

// Lagrer (upsert) hele portaldokumentet. Kalles gjennom appens sentrale save().
export async function savePortalContent(portalId, content) {
  if (!SUPABASE_ENABLED) return;
  const { error } = await supabase
    .from('portal_state')
    .upsert({ portal_id: portalId, content, updated_at: new Date().toISOString() });
  if (error) throw error;
}
