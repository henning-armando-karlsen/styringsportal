/*
  # Add crossorg shared portal_state row

  1. Changes
    - Inserts a row in portal_state with portal_id = 'crossorg' if it
      does not already exist. This stores shared cross-organisational
      data (projects, etc.) in the same JSONB content column.

  2. Security
    - New RLS policies for the 'crossorg' row:
      - All authenticated users can SELECT (read)
      - Write (UPDATE) allowed for admins (is_admin()) or any
        authenticated user (for now, to enable collaboration).
        NOTE: Write access can be tightened to only project
        participants/leads in a future iteration.

  3. Important Notes
    - Uses last-write-wins semantics for concurrent edits
    - Existing portal_state policies remain unchanged
    - The crossorg row is not tied to any real portal; it's a
      virtual shared document
*/

-- Insert crossorg row if missing
INSERT INTO public.portal_state (portal_id, content)
VALUES ('crossorg', '{"projects": []}'::jsonb)
ON CONFLICT (portal_id) DO NOTHING;

-- RLS: authenticated can read crossorg
DROP POLICY IF EXISTS "Authenticated can read crossorg" ON public.portal_state;
CREATE POLICY "Authenticated can read crossorg"
  ON public.portal_state FOR SELECT
  TO authenticated
  USING (portal_id = 'crossorg');

-- RLS: authenticated can write crossorg (collaborative; tighten later)
-- NOTE: Last-write-wins. Tighten to project participants/leads later.
DROP POLICY IF EXISTS "Authenticated can write crossorg" ON public.portal_state;
CREATE POLICY "Authenticated can write crossorg"
  ON public.portal_state FOR UPDATE
  TO authenticated
  USING (portal_id = 'crossorg')
  WITH CHECK (portal_id = 'crossorg');