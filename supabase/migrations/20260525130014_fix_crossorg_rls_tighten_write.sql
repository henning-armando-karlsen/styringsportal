/*
  # FIX 1: Tighten crossorg write RLS

  1. Drop overly permissive write policies on portal_state for crossorg
  2. Create is_crossorg_editor() function: returns true if user is admin OR
     user's profile.handle is a lead or member in any project in crossorg content
  3. Add restrictive UPDATE policy using is_crossorg_editor()
  4. Keep INSERT restricted to admin only (row already exists)
  5. Keep existing read policy unchanged
*/

-- Drop the permissive write policies
DROP POLICY IF EXISTS "Authenticated can update crossorg" ON public.portal_state;
DROP POLICY IF EXISTS "Authenticated can insert crossorg" ON public.portal_state;
DROP POLICY IF EXISTS "Authenticated can write crossorg" ON public.portal_state;

-- Create helper function to check if user can edit crossorg
CREATE OR REPLACE FUNCTION public.is_crossorg_editor()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_handle text;
  content_val jsonb;
BEGIN
  IF public.is_admin() THEN
    RETURN true;
  END IF;

  SELECT p.handle INTO user_handle
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF user_handle IS NULL THEN
    RETURN false;
  END IF;

  SELECT ps.content INTO content_val
  FROM public.portal_state ps
  WHERE ps.portal_id = 'crossorg';

  IF content_val IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM jsonb_array_elements(content_val->'projects') AS proj
    WHERE proj->>'lead' = user_handle
       OR EXISTS (
         SELECT 1
         FROM jsonb_array_elements(proj->'members') AS mem
         WHERE mem->>'memberId' = user_handle
       )
  );
END;
$$;

-- New UPDATE policy: only crossorg editors can update
CREATE POLICY "Crossorg editors can update"
  ON public.portal_state
  FOR UPDATE
  TO authenticated
  USING (portal_id = 'crossorg' AND public.is_crossorg_editor())
  WITH CHECK (portal_id = 'crossorg' AND public.is_crossorg_editor());

-- New INSERT policy: only admins (row already exists, but safety)
CREATE POLICY "Admin can insert crossorg"
  ON public.portal_state
  FOR INSERT
  TO authenticated
  WITH CHECK (portal_id = 'crossorg' AND public.is_admin());
