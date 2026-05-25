/*
  # Create forum_default_members table and auto-assign trigger

  1. New Tables
    - forum_default_members (forum_id text, handle text)
      - Canonical source of which handles belong to which forums
      - Seeded from org chart

  2. Trigger
    - On INSERT into profiles, auto-create portal_members rows
      for forums that match the new profile's handle

  3. Security
    - Enable RLS on forum_default_members
    - Only admins can modify
    - Authenticated users can read (needed for app display)
*/

-- Create forum_default_members table
CREATE TABLE IF NOT EXISTS public.forum_default_members (
  forum_id text NOT NULL,
  handle text NOT NULL,
  PRIMARY KEY (forum_id, handle)
);

ALTER TABLE public.forum_default_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read forum defaults"
  ON public.forum_default_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage forum defaults"
  ON public.forum_default_members
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed data from org chart
INSERT INTO public.forum_default_members (forum_id, handle) VALUES
  ('forum:lg', 'svk'), ('forum:lg', 'tm'), ('forum:lg', 'om'), ('forum:lg', 'henning'),
  ('forum:lg', 'elh'), ('forum:lg', 'ak'), ('forum:lg', 'ghl'), ('forum:lg', 'sl'), ('forum:lg', 'ee'),
  ('forum:ulg', 'svk'), ('forum:ulg', 'tm'), ('forum:ulg', 'om'), ('forum:ulg', 'henning'),
  ('forum:ulg', 'elh'), ('forum:ulg', 'hba'), ('forum:ulg', 'ak'), ('forum:ulg', 'svb'),
  ('forum:ulg', 'cb'), ('forum:ulg', 'er'), ('forum:ulg', 'ghl'), ('forum:ulg', 'mo'),
  ('forum:ulg', 'sms'), ('forum:ulg', 'sl'), ('forum:ulg', 'tpj'), ('forum:ulg', 'po'), ('forum:ulg', 'ee'),
  ('forum:dmg', 'svk'), ('forum:dmg', 'om'), ('forum:dmg', 'sl'), ('forum:dmg', 'tpj'),
  ('forum:dmg', 'po'), ('forum:dmg', 'ee'),
  ('forum:sug', 'svk'), ('forum:sug', 'om'), ('forum:sug', 'ak'), ('forum:sug', 'ghl'),
  ('forum:sug', 'sl'), ('forum:sug', 'tpj'),
  ('forum:lgf', 'tpj')
ON CONFLICT (forum_id, handle) DO NOTHING;

-- Function to auto-assign forum membership when a profile is created
CREATE OR REPLACE FUNCTION public.assign_forum_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.portal_members (portal_id, profile_id, member_role)
  SELECT fdm.forum_id, NEW.id, 'member'
  FROM public.forum_default_members fdm
  WHERE fdm.handle = NEW.handle
  ON CONFLICT (portal_id, profile_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on profiles insert
DROP TRIGGER IF EXISTS trg_assign_forum_membership ON public.profiles;
CREATE TRIGGER trg_assign_forum_membership
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_forum_membership();

-- Backfill: assign existing profiles their forum membership
INSERT INTO public.portal_members (portal_id, profile_id, member_role)
SELECT fdm.forum_id, p.id, 'member'
FROM public.forum_default_members fdm
JOIN public.profiles p ON p.handle = fdm.handle
ON CONFLICT (portal_id, profile_id) DO NOTHING;
