/*
  # Skop Markedsplan til Marked + Salg

  Markedsplanen er et Marked x Salg-verktoey og skal kun vaere tilgjengelig for
  medlemmer av marketing og sales (samt admin). Denne migrasjonen erstatter de
  tidligere policyene paa 'markedsplan'-raden i portal_state:

    - SELECT: tidligere "alle innloggede" -> naa kun marketing/sales-medlemmer + admin
    - INSERT/UPDATE: tidligere marketing/leadership -> naa marketing/sales + admin

  Konsekvens: brukere utenfor Marked/Salg faar ikke lenger lest raden, saa
  markedsplanen (og utledede oppgaver) dukker ikke opp for dem. Bruker is_portal_member(text)
  og is_admin() som finnes fra tidligere migrasjoner.
*/

-- SELECT: kun marked/salg-medlemmer eller admin
DROP POLICY IF EXISTS "Authenticated can read markedsplan" ON public.portal_state;
DROP POLICY IF EXISTS "Marketing or sales can read markedsplan" ON public.portal_state;
CREATE POLICY "Marketing or sales can read markedsplan"
  ON public.portal_state FOR SELECT
  TO authenticated
  USING (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('sales') OR public.is_admin())
  );

-- INSERT: kun marked/salg-medlemmer eller admin
DROP POLICY IF EXISTS "Marketing or leadership can insert markedsplan" ON public.portal_state;
DROP POLICY IF EXISTS "Marketing or sales can insert markedsplan" ON public.portal_state;
CREATE POLICY "Marketing or sales can insert markedsplan"
  ON public.portal_state FOR INSERT
  TO authenticated
  WITH CHECK (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('sales') OR public.is_admin())
  );

-- UPDATE: kun marked/salg-medlemmer eller admin
DROP POLICY IF EXISTS "Marketing or leadership can update markedsplan" ON public.portal_state;
DROP POLICY IF EXISTS "Marketing or sales can update markedsplan" ON public.portal_state;
CREATE POLICY "Marketing or sales can update markedsplan"
  ON public.portal_state FOR UPDATE
  TO authenticated
  USING (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('sales') OR public.is_admin())
  )
  WITH CHECK (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('sales') OR public.is_admin())
  );
