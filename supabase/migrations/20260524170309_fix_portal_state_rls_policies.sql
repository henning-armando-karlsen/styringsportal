/*
  # Fix portal_state RLS policies for upsert compatibility

  1. Changes
    - Replace single FOR ALL policy with separate SELECT, INSERT, UPDATE, DELETE policies
    - PostgREST upsert requires explicit INSERT and UPDATE policies to function correctly
    - The USING and WITH CHECK clauses remain identical (is_portal_member check)

  2. Security
    - No change in access level - same is_portal_member() check on all operations
    - Authenticated users can only read/write portal_state for portals they belong to
*/

-- Drop the existing FOR ALL policy
drop policy if exists portal_state_rw on public.portal_state;

-- Create separate policies for each operation
create policy "Members can select portal state"
  on public.portal_state for select
  to authenticated
  using (public.is_portal_member(portal_id));

create policy "Members can insert portal state"
  on public.portal_state for insert
  to authenticated
  with check (public.is_portal_member(portal_id));

create policy "Members can update portal state"
  on public.portal_state for update
  to authenticated
  using (public.is_portal_member(portal_id))
  with check (public.is_portal_member(portal_id));

create policy "Members can delete portal state"
  on public.portal_state for delete
  to authenticated
  using (public.is_portal_member(portal_id));