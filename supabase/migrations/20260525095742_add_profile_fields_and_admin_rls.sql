/*
  # Add profile fields, update trigger, and extend admin RLS

  1. New Columns on `profiles`
    - `phone` (text) - phone number
    - `primary_portal` (text) - user's home/primary portal
    - `active` (bool, default true) - whether the user is active

  2. Trigger Update: `handle_new_user`
    - Now checks if a profile already exists with the same email
      (pre-registered by admin). If so, links auth.uid to that
      existing profile rather than creating a new one.
    - Falls back to creating a new profile if no match found.

  3. Security Changes
    - Admins (is_admin()) can INSERT profiles (for pre-registration)
    - Admins can UPDATE any profile (for editing employees)
    - Admins can UPDATE portal_state for any portal (to add members to content.members)

  4. Important Notes
    - Pre-registration flow: admin creates profile + portal_members
      before user logs in. When user logs in, trigger links their
      auth.uid to the existing profile.
    - active=false removes access but preserves history.
*/

-- Add columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'primary_portal'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN primary_portal text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Update handle_new_user trigger to link to pre-registered profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_profile_id uuid;
BEGIN
  -- Check if a pre-registered profile exists with this email
  SELECT id INTO existing_profile_id
  FROM public.profiles
  WHERE email = new.email AND id != new.id
  LIMIT 1;

  IF existing_profile_id IS NOT NULL THEN
    -- Link the pre-registered profile to this auth user
    UPDATE public.profiles
    SET id = new.id
    WHERE id = existing_profile_id;
  ELSE
    -- Create a new profile
    INSERT INTO public.profiles (id, handle, name, email)
    VALUES (
      new.id,
      split_part(new.email, '@', 1),
      coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
      new.email
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN new;
END;
$$;

-- Admin RLS: admins can INSERT profiles (pre-registration)
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin RLS: admins can UPDATE any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin RLS: admins can write portal_state for any portal
DROP POLICY IF EXISTS "Admins can update any portal_state" ON public.portal_state;
CREATE POLICY "Admins can update any portal_state"
  ON public.portal_state FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin RLS: admins can insert portal_state
DROP POLICY IF EXISTS "Admins can insert portal_state" ON public.portal_state;
CREATE POLICY "Admins can insert portal_state"
  ON public.portal_state FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());