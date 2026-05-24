/*
  # Add admin function and portal_members admin policies

  1. New Functions
    - `is_admin()` - SECURITY DEFINER function that returns true if the
      authenticated user has at least one row in portal_members with
      member_role = 'admin'. Used in RLS policies to grant admin users
      full management access to portal_members.

  2. Security Changes
    - New SELECT policy on portal_members: admins can see all rows
    - New INSERT policy on portal_members: admins can insert any row
    - New UPDATE policy on portal_members: admins can update any row
    - New DELETE policy on portal_members: admins can delete any row
    - Existing policy (portal_members_select) remains unchanged so
      non-admin users can still see members in their own portals

  3. Important Notes
    - is_admin() uses SECURITY DEFINER to avoid RLS recursion
    - Non-admin users are unaffected; they retain their existing
      read access via the original portal_members_select policy
*/

-- SECURITY DEFINER function to check if current user is admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.portal_members
    where profile_id = auth.uid() and member_role = 'admin'
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- Admin policies on portal_members (additive to existing policies)
drop policy if exists "Admin can view all members" on public.portal_members;
create policy "Admin can view all members"
  on public.portal_members for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin can insert members" on public.portal_members;
create policy "Admin can insert members"
  on public.portal_members for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin can update members" on public.portal_members;
create policy "Admin can update members"
  on public.portal_members for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin can delete members" on public.portal_members;
create policy "Admin can delete members"
  on public.portal_members for delete
  to authenticated
  using (public.is_admin());