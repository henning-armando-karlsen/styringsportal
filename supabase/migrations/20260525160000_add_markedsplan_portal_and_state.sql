/*
  # Markedsplan: delt portal_state-rad + RLS

  1. Data
    - Oppretter portal-raden 'markedsplan' (kreves pga. FK fra portal_state.portal_id -> portals.id)
    - Oppretter portal_state-raden 'markedsplan' med et tomt JSONB-dokument

  2. Sikkerhet (RLS)
    - SELECT: alle innloggede kan lese markedsplanen, slik at hver ansvarlig
      ser "sine" oppgaver paa skrivebordet uansett hvilken portal de staar i.
    - INSERT/UPDATE: kun medlemmer av marketing eller leadership, eller admin,
      kan redigere markedsplanen.

  3. Viktig
    - Markedsoppgaver skrives IKKE inn i andre portalers dokumenter. Den enkeltes
      skrivebord/oppgaver UTLEDER sine markedsplan-oppgaver direkte fra denne raden
      (auto-synk: ingen duplikater, ingen RLS-brudd, alltid i takt med planen).
    - Bruker eksisterende SECURITY DEFINER-funksjoner is_portal_member(text) og is_admin().
*/

-- 1) Portal-rad (FK-krav)
INSERT INTO public.portals (id, name, subtitle, description, restricted)
VALUES ('markedsplan', 'Markedsplan', 'Felles markedsplan', 'Marked x Salg - SOSTAC', false)
ON CONFLICT (id) DO NOTHING;

-- 2) Tomt portal_state-dokument
INSERT INTO public.portal_state (portal_id, content, updated_at)
VALUES ('markedsplan', '{}'::jsonb, now())
ON CONFLICT (portal_id) DO NOTHING;

-- 3) RLS: SELECT for alle innloggede
DROP POLICY IF EXISTS "Authenticated can read markedsplan" ON public.portal_state;
CREATE POLICY "Authenticated can read markedsplan"
  ON public.portal_state FOR SELECT
  TO authenticated
  USING (portal_id = 'markedsplan');

-- 4) RLS: INSERT (for upsert) - marked/ledelse-medlemmer eller admin
DROP POLICY IF EXISTS "Marketing or leadership can insert markedsplan" ON public.portal_state;
CREATE POLICY "Marketing or leadership can insert markedsplan"
  ON public.portal_state FOR INSERT
  TO authenticated
  WITH CHECK (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('leadership') OR public.is_admin())
  );

-- 5) RLS: UPDATE - marked/ledelse-medlemmer eller admin
DROP POLICY IF EXISTS "Marketing or leadership can update markedsplan" ON public.portal_state;
CREATE POLICY "Marketing or leadership can update markedsplan"
  ON public.portal_state FOR UPDATE
  TO authenticated
  USING (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('leadership') OR public.is_admin())
  )
  WITH CHECK (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('leadership') OR public.is_admin())
  );
