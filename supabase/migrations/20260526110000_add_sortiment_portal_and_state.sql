/*
  # Sortiment-synk: delt portal_state-rad + lese-RLS (PORTAL-prosjektet)

  Mottar arbeidselementer (oppgaver, initiativer, steg) fra Sortimentsverktoeyet
  via edge-funksjonen 'ingest-sortiment', og lagrer dem i EN delt rad slik at hver
  persons skrivebord kan utlede sine egne elementer (som for markedsplanen).

  1. Data
    - portals-rad 'sortiment' (FK-krav)
    - portal_state-rad 'sortiment' med { "items": [] }
  2. Sikkerhet
    - SELECT: alle innloggede kan lese (UI filtrerer slik at hver person kun ser sine egne)
    - Ingen klient-skrivepolicy: skriving skjer KUN server-side i edge-funksjonen
      'ingest-sortiment' med service-role (bypasser RLS).
*/

INSERT INTO public.portals (id, name, subtitle, description, restricted)
VALUES ('sortiment', 'Sortimentsutvikling', 'Synk fra Sortimentsverktoeyet', 'Oppgaver, initiativer og steg fra Sortimentsverktoeyet', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_state (portal_id, content, updated_at)
VALUES ('sortiment', '{"items": []}'::jsonb, now())
ON CONFLICT (portal_id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated can read sortiment" ON public.portal_state;
CREATE POLICY "Authenticated can read sortiment"
  ON public.portal_state FOR SELECT
  TO authenticated
  USING (portal_id = 'sortiment');
