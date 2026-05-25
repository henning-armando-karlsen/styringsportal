/*
  # Fix identity flow: henning admin setup + self-read RLS safety net

  1. Profile Updates
    - Updates henning@compete.no profile: name = 'Henning Armando Karlsen',
      primary_portal = 'leadership'

  2. RLS Safety Net
    - Adds policy for users to SELECT their own portal_members rows
      (profile_id = auth.uid()), ensuring identity resolution works
      even without circular is_portal_member check

  3. Portal Content
    - Adds member entry {id:'henning', name:'Henning Armando Karlsen', role:'Administrator', email:'henning@compete.no'}
      to the leadership portal's content.members array if not already present

  4. Important Notes
    - All operations are idempotent (safe to run multiple times)
    - Does not modify passwords or auth credentials
    - Does not drop or delete any data
*/

-- 1. Update henning's profile
UPDATE public.profiles
SET name = 'Henning Armando Karlsen',
    primary_portal = 'leadership',
    active = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'henning@compete.no' LIMIT 1);

-- 2. Add self-read policy on portal_members (users can always read their own memberships)
DROP POLICY IF EXISTS "Users can read own memberships" ON public.portal_members;
CREATE POLICY "Users can read own memberships"
  ON public.portal_members FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- 3. Ensure henning member entry exists in leadership portal_state content.members
DO $$
DECLARE
  v_content jsonb;
  v_members jsonb;
  v_henning_exists boolean;
BEGIN
  SELECT content INTO v_content
  FROM public.portal_state
  WHERE portal_id = 'leadership';

  IF v_content IS NULL THEN
    RETURN;
  END IF;

  v_members := COALESCE(v_content->'members', '[]'::jsonb);

  SELECT EXISTS(
    SELECT 1 FROM jsonb_array_elements(v_members) elem
    WHERE elem->>'id' = 'henning'
  ) INTO v_henning_exists;

  IF NOT v_henning_exists THEN
    v_members := v_members || jsonb_build_array(jsonb_build_object(
      'id', 'henning',
      'name', 'Henning Armando Karlsen',
      'role', 'Administrator',
      'email', 'henning@compete.no',
      'initials', 'HK'
    ));
    v_content := jsonb_set(v_content, '{members}', v_members);
    UPDATE public.portal_state
    SET content = v_content, updated_at = now()
    WHERE portal_id = 'leadership';
  END IF;
END $$;
