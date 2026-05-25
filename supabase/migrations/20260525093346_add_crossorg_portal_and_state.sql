/*
  # Add crossorg portal and portal_state row with RLS policies

  1. New Data
    - Creates a 'crossorg' portal entry in the portals table
    - Inserts a 'crossorg' row into portal_state for shared cross-organization
      projects data (projects that span multiple departments)

  2. Security Changes
    - New SELECT policy: all authenticated users can read the crossorg portal_state row
    - New INSERT policy: authenticated users can insert crossorg (for upsert)
    - New UPDATE policy: authenticated users can update crossorg
    - Note: Write access could be further restricted to only project
      participants/leaders in a future iteration. Last-write-wins on
      concurrent changes to the crossorg document.

  3. Important Notes
    - The crossorg row stores { projects: [] } as JSONB content
    - This approach avoids writing to other departments' portal_state rows
    - Existing per-portal RLS policies remain unchanged
*/

-- Create the crossorg portal entry
INSERT INTO portals (id, name, subtitle, description, restricted)
VALUES ('crossorg', 'Pa tvers', 'Delt arbeidsrom', 'Tverrgaende prosjekter og samarbeid', false)
ON CONFLICT (id) DO NOTHING;

-- Insert crossorg portal_state row
INSERT INTO portal_state (portal_id, content, updated_at)
VALUES ('crossorg', '{"projects": []}'::jsonb, now())
ON CONFLICT (portal_id) DO NOTHING;

-- SELECT: all authenticated can read crossorg
DROP POLICY IF EXISTS "Authenticated can read crossorg" ON portal_state;
CREATE POLICY "Authenticated can read crossorg"
  ON portal_state FOR SELECT
  TO authenticated
  USING (portal_id = 'crossorg');

-- UPDATE: authenticated members can update crossorg
DROP POLICY IF EXISTS "Authenticated can update crossorg" ON portal_state;
CREATE POLICY "Authenticated can update crossorg"
  ON portal_state FOR UPDATE
  TO authenticated
  USING (portal_id = 'crossorg')
  WITH CHECK (portal_id = 'crossorg');

-- INSERT: authenticated can insert crossorg (for upsert)
DROP POLICY IF EXISTS "Authenticated can insert crossorg" ON portal_state;
CREATE POLICY "Authenticated can insert crossorg"
  ON portal_state FOR INSERT
  TO authenticated
  WITH CHECK (portal_id = 'crossorg');