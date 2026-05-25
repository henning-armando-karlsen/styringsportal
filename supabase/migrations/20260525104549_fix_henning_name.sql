/*
  # Fix henning's name

  1. Profile Update
    - Changes name from 'Henning Armando Karlsen' to 'Henning Karlsen'
      for handle = 'henning'

  2. Portal Content Update
    - Updates the member entry with id = 'henning' in all portal_state
      rows where it exists, setting name to 'Henning Karlsen'

  3. Important Notes
    - Idempotent: safe to run multiple times
    - Only changes name field, all other fields preserved
*/

-- 1. Update profiles
UPDATE public.profiles
SET name = 'Henning Karlsen'
WHERE handle = 'henning';

-- 2. Update member entry in all portal_state content.members arrays
DO $$
DECLARE
  r record;
  v_members jsonb;
  v_new_members jsonb;
  v_elem jsonb;
  i int;
BEGIN
  FOR r IN SELECT portal_id, content FROM public.portal_state
  LOOP
    v_members := r.content->'members';
    IF v_members IS NULL THEN CONTINUE; END IF;

    v_new_members := '[]'::jsonb;
    FOR i IN 0..jsonb_array_length(v_members)-1
    LOOP
      v_elem := v_members->i;
      IF v_elem->>'id' = 'henning' THEN
        v_elem := jsonb_set(v_elem, '{name}', '"Henning Karlsen"');
      END IF;
      v_new_members := v_new_members || jsonb_build_array(v_elem);
    END LOOP;

    IF v_new_members IS DISTINCT FROM v_members THEN
      UPDATE public.portal_state
      SET content = jsonb_set(content, '{members}', v_new_members),
          updated_at = now()
      WHERE portal_id = r.portal_id;
    END IF;
  END LOOP;
END $$;
