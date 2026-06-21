/*
  # IKT-portal + IKT-plan: registrering, state-rader, medlemskap og RLS

  1. Data
    - Oppretter portal-radene 'ikt' (avdelingsportal) og 'iktplan' (planleggingsverktøyets
      delte dokument) — kreves pga. FK fra portal_state.portal_id -> portals.id.
    - Oppretter tomme portal_state-rader for begge.
    - Gir Henning og alle eksisterende admins medlemskap i 'ikt'.

  2. Sikkerhet (RLS)
    - 'ikt'-dokumentet dekkes av den generiske portal_state_rw-policyen (medlemmer).
    - 'iktplan' følger samme mønster som markedsplan:
        SELECT for alle innloggede (slik at hver ansvarlig ser «sine» IKT-oppgaver
        på skrivebordet uansett hvilken portal de står i),
        INSERT/UPDATE for IKT-/ledelse-medlemmer eller admin.

  3. Viktig
    - IKT-oppgaver skrives IKKE inn i andre portalers dokumenter. Skrivebord/innboks
      UTLEDER sine IKT-poster direkte fra 'iktplan'-raden (auto-synk, ingen duplikater).
    - Bruker eksisterende SECURITY DEFINER-funksjoner is_portal_member(text) og is_admin().
*/

-- 1) Portal-rader (FK-krav)
INSERT INTO public.portals (id, name, subtitle, description, restricted)
VALUES
  ('ikt',     'IKT',      'IKT-portal',       'IT-utvikling, drift og leveranser',     false),
  ('iktplan', 'IKT-plan', 'IKT-planlegging',  'Behov, prioritering og gjennomføring',  false)
ON CONFLICT (id) DO NOTHING;

-- 2) Tomme portal_state-dokumenter
INSERT INTO public.portal_state (portal_id, content, updated_at)
VALUES ('ikt', '{}'::jsonb, now()), ('iktplan', '{}'::jsonb, now())
ON CONFLICT (portal_id) DO NOTHING;

-- 3) Medlemskap i IKT-portalen: Henning + alle nåværende admins
INSERT INTO public.portal_members (portal_id, profile_id, member_role)
SELECT 'ikt', p.id, 'admin'
FROM public.profiles p
WHERE p.handle = 'henning'
ON CONFLICT (portal_id, profile_id) DO NOTHING;

INSERT INTO public.portal_members (portal_id, profile_id, member_role)
SELECT DISTINCT 'ikt', pm.profile_id, 'admin'
FROM public.portal_members pm
WHERE pm.member_role = 'admin'
ON CONFLICT (portal_id, profile_id) DO NOTHING;

-- 4) RLS for iktplan-dokumentet (samme mønster som markedsplan)
DROP POLICY IF EXISTS "Authenticated can read iktplan" ON public.portal_state;
CREATE POLICY "Authenticated can read iktplan"
  ON public.portal_state FOR SELECT
  TO authenticated
  USING (portal_id = 'iktplan');

DROP POLICY IF EXISTS "IKT or leadership can insert iktplan" ON public.portal_state;
CREATE POLICY "IKT or leadership can insert iktplan"
  ON public.portal_state FOR INSERT
  TO authenticated
  WITH CHECK (
    portal_id = 'iktplan'
    AND (public.is_portal_member('ikt') OR public.is_portal_member('leadership') OR public.is_admin())
  );

DROP POLICY IF EXISTS "IKT or leadership can update iktplan" ON public.portal_state;
CREATE POLICY "IKT or leadership can update iktplan"
  ON public.portal_state FOR UPDATE
  TO authenticated
  USING (
    portal_id = 'iktplan'
    AND (public.is_portal_member('ikt') OR public.is_portal_member('leadership') OR public.is_admin())
  )
  WITH CHECK (
    portal_id = 'iktplan'
    AND (public.is_portal_member('ikt') OR public.is_portal_member('leadership') OR public.is_admin())
  );
