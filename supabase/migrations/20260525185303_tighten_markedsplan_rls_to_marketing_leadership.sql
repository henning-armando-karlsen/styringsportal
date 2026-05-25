/*
  # Tighten markedsplan RLS: restrict write to marketing/leadership members + admin

  1. Changes
    - Drops the old broad INSERT/UPDATE policies that allowed all authenticated users
    - Creates new policies: only marketing/leadership members or admin can write
    - SELECT remains open for all authenticated (so everyone sees their assignments)

  2. Important Notes
    - Uses existing SECURITY DEFINER functions is_portal_member(text) and is_admin()
    - The markedsplan portal and portal_state rows already exist from earlier migration
*/

-- Drop old broad policies
DROP POLICY IF EXISTS "Authenticated can insert markedsplan" ON public.portal_state;
DROP POLICY IF EXISTS "Authenticated can update markedsplan" ON public.portal_state;

-- New INSERT: marketing/leadership members or admin only
DROP POLICY IF EXISTS "Marketing or leadership can insert markedsplan" ON public.portal_state;
CREATE POLICY "Marketing or leadership can insert markedsplan"
  ON public.portal_state FOR INSERT
  TO authenticated
  WITH CHECK (
    portal_id = 'markedsplan'
    AND (public.is_portal_member('marketing') OR public.is_portal_member('leadership') OR public.is_admin())
  );

-- New UPDATE: marketing/leadership members or admin only
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
