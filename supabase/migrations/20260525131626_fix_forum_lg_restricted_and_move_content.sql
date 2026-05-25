/*
  # Fix forum:lg - make restricted and move leadership meeting content

  1. Set forum:lg restricted=true in portals table
  2. Move any meetings/agendaProposals/decisions from leadership portal_state
     into forum:lg portal_state (merge, avoid duplicates by id)
  3. Clear those arrays in leadership portal_state after move

  Note: As of this migration, both portals have 0 items in these arrays.
  The migration is still written to handle future re-runs safely.
*/

-- 1. Make forum:lg restricted
UPDATE public.portals SET restricted = true WHERE id = 'forum:lg';

-- 2. Move content from leadership to forum:lg (idempotent merge)
DO $$
DECLARE
  leadership_content jsonb;
  forum_content jsonb;
  merged_meetings jsonb;
  merged_proposals jsonb;
  merged_decisions jsonb;
  merged_tasks jsonb;
  l_meetings jsonb;
  l_proposals jsonb;
  l_decisions jsonb;
  l_tasks jsonb;
BEGIN
  SELECT content INTO leadership_content FROM public.portal_state WHERE portal_id = 'leadership';
  SELECT content INTO forum_content FROM public.portal_state WHERE portal_id = 'forum:lg';

  IF leadership_content IS NULL OR forum_content IS NULL THEN
    RETURN;
  END IF;

  l_meetings := COALESCE(leadership_content->'meetings', '[]'::jsonb);
  l_proposals := COALESCE(leadership_content->'agendaProposals', '[]'::jsonb);
  l_decisions := COALESCE(leadership_content->'decisions', '[]'::jsonb);
  l_tasks := COALESCE(leadership_content->'tasks', '[]'::jsonb);

  -- Merge: forum existing + leadership items (deduplicate by id)
  merged_meetings := COALESCE(forum_content->'meetings', '[]'::jsonb);
  merged_proposals := COALESCE(forum_content->'agendaProposals', '[]'::jsonb);
  merged_decisions := COALESCE(forum_content->'decisions', '[]'::jsonb);
  merged_tasks := COALESCE(forum_content->'tasks', '[]'::jsonb);

  -- Append leadership items that don't already exist in forum (by id)
  IF jsonb_array_length(l_meetings) > 0 THEN
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO merged_meetings
    FROM (
      SELECT item FROM jsonb_array_elements(merged_meetings) AS item
      UNION ALL
      SELECT item FROM jsonb_array_elements(l_meetings) AS item
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(merged_meetings) AS existing
        WHERE existing->>'id' = item->>'id'
      )
    ) combined;
  END IF;

  IF jsonb_array_length(l_proposals) > 0 THEN
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO merged_proposals
    FROM (
      SELECT item FROM jsonb_array_elements(merged_proposals) AS item
      UNION ALL
      SELECT item FROM jsonb_array_elements(l_proposals) AS item
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(merged_proposals) AS existing
        WHERE existing->>'id' = item->>'id'
      )
    ) combined;
  END IF;

  IF jsonb_array_length(l_decisions) > 0 THEN
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO merged_decisions
    FROM (
      SELECT item FROM jsonb_array_elements(merged_decisions) AS item
      UNION ALL
      SELECT item FROM jsonb_array_elements(l_decisions) AS item
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(merged_decisions) AS existing
        WHERE existing->>'id' = item->>'id'
      )
    ) combined;
  END IF;

  IF jsonb_array_length(l_tasks) > 0 THEN
    SELECT COALESCE(jsonb_agg(item), '[]'::jsonb) INTO merged_tasks
    FROM (
      SELECT item FROM jsonb_array_elements(merged_tasks) AS item
      UNION ALL
      SELECT item FROM jsonb_array_elements(l_tasks) AS item
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(merged_tasks) AS existing
        WHERE existing->>'id' = item->>'id'
      )
    ) combined;
  END IF;

  -- Update forum:lg with merged content
  UPDATE public.portal_state
  SET content = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(content, '{meetings}', merged_meetings),
        '{agendaProposals}', merged_proposals
      ),
      '{decisions}', merged_decisions
    ),
    '{tasks}', merged_tasks
  ),
  updated_at = now()
  WHERE portal_id = 'forum:lg';

  -- Clear leadership arrays
  UPDATE public.portal_state
  SET content = jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(content, '{meetings}', '[]'::jsonb),
        '{agendaProposals}', '[]'::jsonb
      ),
      '{decisions}', '[]'::jsonb
    ),
    '{tasks}', '[]'::jsonb
  ),
  updated_at = now()
  WHERE portal_id = 'leadership';
END $$;
