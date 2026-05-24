-- ============================================================================
-- Vikingbad Portaler – database, tilgangsstyring (RLS) og seed
-- Kjør i Supabase (SQL Editor) eller la Bolt kjøre migrasjonen.
-- ============================================================================

-- ---------- Tabeller ----------

-- Brukerprofiler (1:1 med Supabase Auth-brukere)
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  handle     text unique,
  name       text,
  email      text,
  created_at timestamptz not null default now()
);

-- Portaler (konfig + visningsnavn). Faktisk innhold ligger i portal_state.
create table if not exists public.portals (
  id          text primary key,
  name        text not null,
  subtitle    text,
  description  text,
  restricted  boolean not null default false
);

-- Medlemskap = tilgang. En person i to portaler er en «bro».
create table if not exists public.portal_members (
  portal_id   text not null references public.portals (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  member_role text,
  created_at  timestamptz not null default now(),
  primary key (portal_id, profile_id)
);

-- Hele portalens datamodell som ett JSONB-dokument (org, members, meetings, ...).
create table if not exists public.portal_state (
  portal_id  text primary key references public.portals (id) on delete cascade,
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Tverrgående programmer og overleveringer mellom avdelinger.
create table if not exists public.programs (
  id          text primary key,
  name        text not null,
  description text,
  icon        text,
  accent      text
);

create table if not exists public.program_handoffs (
  id          text primary key,
  program_id  text references public.programs (id) on delete cascade,
  from_portal text,
  to_portal   text,
  title       text,
  owner       text,
  recipient   text,
  due_date    date,
  status      text
);

-- ---------- Hjelpefunksjon for RLS ----------
-- SECURITY DEFINER => unngår rekursjon i RLS-policyene på portal_members.
create or replace function public.is_portal_member(p text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.portal_members
    where profile_id = auth.uid() and portal_id = p
  );
$$;
grant execute on function public.is_portal_member(text) to authenticated;

-- ---------- Auto-opprett profil ved registrering ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, handle, name, email)
  values (
    new.id,
    split_part(new.email, '@', 1),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Radnivå-sikkerhet ----------
alter table public.profiles         enable row level security;
alter table public.portals          enable row level security;
alter table public.portal_members   enable row level security;
alter table public.portal_state     enable row level security;
alter table public.programs         enable row level security;
alter table public.program_handoffs enable row level security;

-- profiles: innloggede kan se profiler (for navn på eiere/medlemmer); man kan endre sin egen.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (true);
drop policy if exists profiles_upsert_own on public.profiles;
create policy profiles_upsert_own on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- portals: innloggede kan lese konfig (trengs for portalvelger). Skriving via service_role/SQL.
drop policy if exists portals_select on public.portals;
create policy portals_select on public.portals for select to authenticated using (true);

-- portal_members: du ser medlemmene i portalene du selv er medlem av.
drop policy if exists portal_members_select on public.portal_members;
create policy portal_members_select on public.portal_members for select to authenticated using (public.is_portal_member(portal_id));

-- portal_state: full tilgang til portaler du er medlem av.
drop policy if exists portal_state_rw on public.portal_state;
create policy portal_state_rw on public.portal_state for all to authenticated
  using (public.is_portal_member(portal_id))
  with check (public.is_portal_member(portal_id));

-- programmer og overleveringer: lesbart for alle innloggede (tverrgående oversikt).
drop policy if exists programs_select on public.programs;
create policy programs_select on public.programs for select to authenticated using (true);
drop policy if exists handoffs_select on public.program_handoffs;
create policy handoffs_select on public.program_handoffs for select to authenticated using (true);

-- Seed: portalkonfigurasjon og tomme portaldokumenter
insert into public.portals (id, name, subtitle, description, restricted) values
  ('leadership', 'Ledergruppen', 'Ledergruppeportal', 'Strategi, beslutninger og styring', true),
  ('marketing', 'Markedsavdelingen', 'Markedsportal', 'Kampanjer, innhold og merkevare', false),
  ('sales', 'Salgsavdelingen', 'Salgsportal', 'Pipeline, forhandlere og ordre', false),
  ('innkjop', 'Innkjøpsavdelingen', 'Innkjøpsportal', 'Leverandører, kontrakter og forsyning', false),
  ('produkt', 'Produkt & Sourcing', 'Produkt & Sourcing', 'Utvikling, design, lansering og leverandørkjede', false)
on conflict (id) do update set name = excluded.name, subtitle = excluded.subtitle, description = excluded.description, restricted = excluded.restricted;

insert into public.portal_state (portal_id, content) values
  ('leadership', '{"initialized": true, "org": {"portalId": "leadership", "portalName": "Ledergruppeportal", "orgName": "Ledergruppen", "teamLabel": "Ledergruppen", "teamOverline": "Personene bak beslutningene", "groupNoun": "ledergruppen", "meetingNoun": "ledermøte", "meetingNounDef": "ledermøtene", "sectionStrategy": "Strategi & Plan", "navPlans": "Årshjul", "navInitiatives": "Initiativer", "navTeam": "Ledergruppen", "plansTitle": "Årshjul", "plansOverline": "Rullerende 12 måneder fremover", "initiativeTitle": "Initiativer", "initiativeOverline": "Strategisk portefølje", "initiativeNewBtn": "Nytt initiativ", "initiativeNoun": "initiativ", "initiativeEmpty": "Strategiske satsninger – større prosjekter med tydelig eier, fase og milepæler. Holder styr på det som beveger organisasjonen fremover.", "proposalsOverline": "Saker til ledergruppemøtene", "messagesOverline": "Internt rom for ledergruppen", "decisionsSub": "Logg over vedtak fra ledergruppen", "deskFooter": "Vikingbad ledergruppe", "assistantScope": "Vikingbads ledergruppeportal", "assistantContextHeader": "LEDERGRUPPEN", "tip": "La hver leder fylle inn forberedelse 24t før møtet. Bruk «Brief meg» for å være klar.", "planCategories": {"strategi": {"label": "Strategi", "color": "#1E3247", "bg": "#E0E5EB"}, "økonomi": {"label": "Økonomi", "color": "#9B7230", "bg": "#F4E9D2"}, "hr": {"label": "HR", "color": "#557758", "bg": "#E5EEE3"}, "produkt": {"label": "Produkt", "color": "#9B4836", "bg": "#F3E0D8"}, "marked": {"label": "Marked", "color": "#7B4D8C", "bg": "#EDE3F2"}, "styre": {"label": "Styre", "color": "#5C4A3A", "bg": "#EBE4D9"}, "drift": {"label": "Drift", "color": "#5C7B8A", "bg": "#E0E8EB"}}}, "members": [{"id": "svk", "name": "Stein Viggo Karlsen", "role": "CEO", "email": "svk@vikingbad.no", "initials": "SV"}, {"id": "tm", "name": "Tonny Morewood", "role": "CIO", "email": "tonny@vikingbad.no", "initials": "TM"}, {"id": "ak", "name": "Arild Kaale", "role": "CMO", "email": "arild.kaale@vikingbad.no", "initials": "AK"}, {"id": "ghl", "name": "Geir Håkon Lindhjem", "role": "Leder Salg", "email": "ghl@vikingbad.no", "initials": "GH"}, {"id": "om", "name": "Ørjan Moi", "role": "Strategisk ressurs", "email": "orjan@vikingbad.no", "initials": "ØM"}, {"id": "sl", "name": "Snorre Larstad", "role": "CPO", "email": "snorre@vikingbad.no", "initials": "SL"}, {"id": "ee", "name": "Elisabeth Engler", "role": "Leder Innkjøp", "email": "elisabeth.engler@vikingbad.no", "initials": "EE"}], "meetings": [], "decisions": [], "tasks": [], "documents": [], "plans": [], "initiatives": [], "kpis": [], "risks": [], "agendaProposals": [], "channels": [], "messages": [], "readState": {}}'::jsonb),
  ('marketing', '{"initialized": true, "org": {"portalId": "marketing", "portalName": "Markedsportal", "orgName": "Markedsavdelingen", "teamLabel": "Markedsteamet", "teamOverline": "Personene bak merkevaren", "groupNoun": "markedsteamet", "meetingNoun": "markedsmøte", "meetingNounDef": "markedsmøtene", "sectionStrategy": "Plan & Kampanjer", "navPlans": "Markedsplan", "navInitiatives": "Kampanjer", "navTeam": "Markedsteamet", "plansTitle": "Markedsplan", "plansOverline": "Innholds- og kampanjekalender · 12 måneder", "initiativeTitle": "Kampanjer", "initiativeOverline": "Kampanjeportefølje", "initiativeNewBtn": "Ny kampanje", "initiativeNoun": "kampanje", "initiativeEmpty": "Kampanjer er større markedssatsninger med eget budsjett, tidslinje og milepæler – fra brief til evaluering. Her holder dere oversikt over alt som er i gang.", "proposalsOverline": "Saker til markedsmøtene", "messagesOverline": "Internt rom for markedsteamet", "decisionsSub": "Logg over vedtak i markedsteamet", "deskFooter": "Vikingbad markedsavdeling", "assistantScope": "Vikingbads markedsportal", "assistantContextHeader": "MARKEDSTEAMET", "tip": "Planlegg innhold i god tid. Bruk «Brief meg» før kampanje- og byråmøter.", "planCategories": {"kampanje": {"label": "Kampanje", "color": "#9B4836", "bg": "#F3E0D8"}, "innhold": {"label": "Innhold", "color": "#1E3247", "bg": "#E0E5EB"}, "some": {"label": "Sosiale medier", "color": "#7B4D8C", "bg": "#EDE3F2"}, "epost": {"label": "E-post", "color": "#9B7230", "bg": "#F4E9D2"}, "pr": {"label": "PR & presse", "color": "#557758", "bg": "#E5EEE3"}, "event": {"label": "Event & messe", "color": "#5C7B8A", "bg": "#E0E8EB"}, "produkt": {"label": "Produktlansering", "color": "#5C4A3A", "bg": "#EBE4D9"}}}, "members": [{"id": "ak", "name": "Arild Kaale", "role": "Markedssjef", "email": "arild.kaale@vikingbad.no", "initials": "AK"}, {"id": "ms", "name": "Marte Sundby", "role": "Digital & performance", "email": "marte.sundby@vikingbad.no", "initials": "MS"}, {"id": "ht", "name": "Henrik Tangen", "role": "Innhold & sosiale medier", "email": "henrik.tangen@vikingbad.no", "initials": "HT"}, {"id": "is", "name": "Ingrid Solheim", "role": "Merkevare & design", "email": "ingrid.solheim@vikingbad.no", "initials": "IS"}, {"id": "je", "name": "Jonas Eriksen", "role": "Markedskoordinator", "email": "jonas.eriksen@vikingbad.no", "initials": "JE"}, {"id": "ka", "name": "Kristine Aas", "role": "PR & kommunikasjon", "email": "kristine.aas@vikingbad.no", "initials": "KA"}, {"id": "sb", "name": "Sofie Berg", "role": "Web & e-handel", "email": "sofie.berg@vikingbad.no", "initials": "SB"}], "meetings": [], "decisions": [], "tasks": [], "documents": [], "plans": [], "initiatives": [], "kpis": [], "risks": [], "agendaProposals": [], "channels": [], "messages": [], "readState": {}}'::jsonb),
  ('sales', '{"initialized": true, "org": {"portalId": "sales", "portalName": "Salgsportal", "orgName": "Salgsavdelingen", "teamLabel": "Salgsteamet", "teamOverline": "Personene som lukker salgene", "groupNoun": "salgsteamet", "meetingNoun": "salgsmøte", "meetingNounDef": "salgsmøtene", "sectionStrategy": "Plan & Pipeline", "navPlans": "Salgskalender", "navInitiatives": "Satsninger", "navTeam": "Salgsteamet", "plansTitle": "Salgskalender", "plansOverline": "Aktiviteter, besøk og frister · 12 måneder", "initiativeTitle": "Satsninger", "initiativeOverline": "Salgssatsninger", "initiativeNewBtn": "Ny satsning", "initiativeNoun": "satsning", "initiativeEmpty": "Satsninger er større salgsløft med eget mål, budsjett og milepæler – nye distrikter, key account-program, forhandlerrekruttering. Her holder dere oversikt over alt som er i gang.", "proposalsOverline": "Saker til salgsmøtene", "messagesOverline": "Internt rom for salgsteamet", "decisionsSub": "Logg over vedtak i salgsteamet", "deskFooter": "Vikingbad salgsavdeling", "assistantScope": "Vikingbads salgsportal", "assistantContextHeader": "SALGSTEAMET", "tip": "Hold pipelinen fersk. Bruk «Brief meg» før kundebesøk og forhandlersamlinger.", "planCategories": {"kundebesøk": {"label": "Kundebesøk", "color": "#1E3247", "bg": "#E0E5EB"}, "tilbud": {"label": "Tilbud & anbud", "color": "#9B4836", "bg": "#F3E0D8"}, "forhandler": {"label": "Forhandler", "color": "#557758", "bg": "#E5EEE3"}, "kampanje": {"label": "Salgskampanje", "color": "#9B7230", "bg": "#F4E9D2"}, "messe": {"label": "Messe & event", "color": "#7B4D8C", "bg": "#EDE3F2"}, "opplæring": {"label": "Opplæring", "color": "#5C7B8A", "bg": "#E0E8EB"}, "rapport": {"label": "Rapportering", "color": "#5C4A3A", "bg": "#EBE4D9"}}}, "members": [{"id": "ghl", "name": "Geir Håkon Lindhjem", "role": "Salgssjef", "email": "ghl@vikingbad.no", "initials": "GH"}, {"id": "tb", "name": "Thomas Berg", "role": "Key Account Manager", "email": "thomas.berg@vikingbad.no", "initials": "TB"}, {"id": "cn", "name": "Camilla Nguyen", "role": "Salgskonsulent Øst", "email": "camilla.nguyen@vikingbad.no", "initials": "CN"}, {"id": "ah", "name": "Anders Holt", "role": "Salgskonsulent Vest", "email": "anders.holt@vikingbad.no", "initials": "AH"}, {"id": "lv", "name": "Lene Vik", "role": "Salgskonsulent Nord", "email": "lene.vik@vikingbad.no", "initials": "LV"}, {"id": "ps", "name": "Pål Strand", "role": "Innesalg & ordre", "email": "pal.strand@vikingbad.no", "initials": "PS"}, {"id": "md", "name": "Mona Dahl", "role": "Salgssupport", "email": "mona.dahl@vikingbad.no", "initials": "MD"}], "meetings": [], "decisions": [], "tasks": [], "documents": [], "plans": [], "initiatives": [], "kpis": [], "risks": [], "agendaProposals": [], "channels": [], "messages": [], "readState": {}}'::jsonb),
  ('innkjop', '{"initialized": true, "org": {"portalId": "innkjop", "portalName": "Innkjøpsportal", "orgName": "Innkjøpsavdelingen", "teamLabel": "Innkjøpsteamet", "teamOverline": "Personene som sikrer leveransene", "groupNoun": "innkjøpsteamet", "meetingNoun": "innkjøpsmøte", "meetingNounDef": "innkjøpsmøtene", "sectionStrategy": "Plan & Forsyning", "navPlans": "Innkjøpskalender", "navInitiatives": "Satsninger", "navTeam": "Innkjøpsteamet", "plansTitle": "Innkjøpskalender", "plansOverline": "Bestillinger, kontrakter og frister · 12 måneder", "initiativeTitle": "Satsninger", "initiativeOverline": "Innkjøpssatsninger", "initiativeNewBtn": "Ny satsning", "initiativeNoun": "satsning", "initiativeEmpty": "Satsninger er større innkjøpsprosjekter med eget mål, budsjett og milepæler – kostnadsprogram, leverandørkonsolidering, nye rammeavtaler. Her holder dere oversikt over alt som er i gang.", "proposalsOverline": "Saker til innkjøpsmøtene", "messagesOverline": "Internt rom for innkjøpsteamet", "decisionsSub": "Logg over vedtak i innkjøpsteamet", "deskFooter": "Vikingbad innkjøp", "assistantScope": "Vikingbads innkjøpsportal", "assistantContextHeader": "INNKJØPSTEAMET", "tip": "Hold kontraktsfrister og leverandørstatus oppdatert. Bruk «Brief meg» før forhandlinger.", "planCategories": {"bestilling": {"label": "Bestilling", "color": "#1E3247", "bg": "#E0E5EB"}, "kontrakt": {"label": "Kontrakt & avtale", "color": "#9B7230", "bg": "#F4E9D2"}, "forhandling": {"label": "Forhandling", "color": "#9B4836", "bg": "#F3E0D8"}, "leverandor": {"label": "Leverandøroppfølging", "color": "#557758", "bg": "#E5EEE3"}, "lager": {"label": "Lager & logistikk", "color": "#5C7B8A", "bg": "#E0E8EB"}, "kvalitet": {"label": "Kvalitet & revisjon", "color": "#7B4D8C", "bg": "#EDE3F2"}, "rapport": {"label": "Rapportering", "color": "#5C4A3A", "bg": "#EBE4D9"}}}, "members": [{"id": "ee", "name": "Elisabeth Engler", "role": "Innkjøpsleder", "email": "elisabeth.engler@vikingbad.no", "initials": "EE"}, {"id": "ho", "name": "Hanne Os", "role": "Operativ innkjøper", "email": "hanne.os@vikingbad.no", "initials": "HO"}, {"id": "rj", "name": "Rune Jakobsen", "role": "Kategoriansvarlig komponenter", "email": "rune.jakobsen@vikingbad.no", "initials": "RJ"}, {"id": "ti", "name": "Tone Iversen", "role": "Innkjøper emballasje & forbruk", "email": "tone.iversen@vikingbad.no", "initials": "TI"}, {"id": "bk", "name": "Bjørn Krogh", "role": "Sourcing Manager", "email": "bjorn.krogh@vikingbad.no", "initials": "BK"}, {"id": "sa", "name": "Siri Aune", "role": "Innkjøpskoordinator", "email": "siri.aune@vikingbad.no", "initials": "SA"}, {"id": "fm", "name": "Fredrik Moen", "role": "Kontrakt & avtaler", "email": "fredrik.moen@vikingbad.no", "initials": "FM"}], "meetings": [], "decisions": [], "tasks": [], "documents": [], "plans": [], "initiatives": [], "kpis": [], "risks": [], "agendaProposals": [], "channels": [], "messages": [], "readState": {}}'::jsonb),
  ('produkt', '{"initialized": true, "org": {"portalId": "produkt", "portalName": "Produkt & Sourcing", "orgName": "Produkt & Sourcing", "teamLabel": "Produkt & Sourcing", "teamOverline": "Produktutvikling og leverandørkjede", "groupNoun": "teamet", "meetingNoun": "avdelingsmøte", "meetingNounDef": "avdelingsmøtene", "sectionStrategy": "Plan & Portefølje", "navPlans": "Kalender", "navInitiatives": "Prosjekter", "navTeam": "Produkt & Sourcing", "plansTitle": "Produkt- & sourcingkalender", "plansOverline": "Utvikling, lansering og leverandørarbeid · 12 måneder", "initiativeTitle": "Prosjekter", "initiativeOverline": "Prosjektportefølje", "initiativeNewBtn": "Nytt prosjekt", "initiativeNoun": "prosjekt", "initiativeEmpty": "Prosjekter er produktsatsninger og sourcing-prosesser med egen tidslinje, budsjett og milepæler – fra konsept og design til lansering, og fra kvalifisering til ferdig leverandør. Her holder dere oversikt over alt som er i gang.", "proposalsOverline": "Saker til avdelingsmøtene", "messagesOverline": "Internt rom for produkt- og sourcing-teamet", "decisionsSub": "Logg over vedtak i produkt- og sourcing-teamet", "deskFooter": "Vikingbad produkt & sourcing", "assistantScope": "Vikingbads portal for produkt og sourcing", "assistantContextHeader": "PRODUKT & SOURCING-TEAMET", "tip": "Hold milepæler, kvalitetskrav og leverandørstatus oppdatert. Bruk «Brief meg» før design-, sourcing- og lanseringsmøter.", "planCategories": {"konsept": {"label": "Konsept & idé", "color": "#9B7230", "bg": "#F4E9D2"}, "design": {"label": "Design", "color": "#7B4D8C", "bg": "#EDE3F2"}, "utvikling": {"label": "Utvikling", "color": "#1E3247", "bg": "#E0E5EB"}, "test": {"label": "Test & kvalitet", "color": "#557758", "bg": "#E5EEE3"}, "lansering": {"label": "Lansering", "color": "#9B4836", "bg": "#F3E0D8"}, "kvalifisering": {"label": "Leverandørkvalifisering", "color": "#5C7B8A", "bg": "#E0E8EB"}, "revisjon": {"label": "Leverandørrevisjon", "color": "#B0533F", "bg": "#F3E0D8"}, "baerekraft": {"label": "Bærekraft / ESG", "color": "#6B8A6E", "bg": "#E5EEE3"}, "rapport": {"label": "Rapportering & portefølje", "color": "#5C4A3A", "bg": "#EBE4D9"}}}, "members": [{"id": "sl", "name": "Snorre Larstad", "role": "Produkt- & sourcingsjef", "email": "snorre@vikingbad.no", "initials": "SL"}, {"id": "kw", "name": "Kari Wold", "role": "Produktutvikler (R&D)", "email": "kari.wold@vikingbad.no", "initials": "KW"}, {"id": "eo", "name": "Erik Olsen", "role": "Industridesigner", "email": "erik.olsen@vikingbad.no", "initials": "EO"}, {"id": "nh", "name": "Nina Haug", "role": "Kategoriansvarlig dusj", "email": "nina.haug@vikingbad.no", "initials": "NH"}, {"id": "tg", "name": "Trond Gabrielsen", "role": "Kvalitet & test", "email": "trond.gabrielsen@vikingbad.no", "initials": "TG"}, {"id": "ml", "name": "Mari Lund", "role": "Teknisk dokumentasjon", "email": "mari.lund@vikingbad.no", "initials": "ML"}, {"id": "vs", "name": "Vegard Sæther", "role": "Produktkoordinator", "email": "vegard.sather@vikingbad.no", "initials": "VS"}, {"id": "bk", "name": "Bjørn Krogh", "role": "Leder Sourcing", "email": "bjorn.krogh@vikingbad.no", "initials": "BK"}, {"id": "gm", "name": "Geir Madsen", "role": "Strategisk sourcing", "email": "geir.madsen@vikingbad.no", "initials": "GM"}, {"id": "aw", "name": "Astrid Wang", "role": "Leverandørrevisor", "email": "astrid.wang@vikingbad.no", "initials": "AW"}, {"id": "dl", "name": "Daniel Lie", "role": "Sourcing-analytiker", "email": "daniel.lie@vikingbad.no", "initials": "DL"}, {"id": "yk", "name": "Yusuf Karim", "role": "International sourcing (Asia)", "email": "yusuf.karim@vikingbad.no", "initials": "YK"}, {"id": "hb", "name": "Heidi Borg", "role": "Bærekraft i leverandørkjede", "email": "heidi.borg@vikingbad.no", "initials": "HB"}, {"id": "pn", "name": "Petter Nordahl", "role": "Sourcing-koordinator", "email": "petter.nordahl@vikingbad.no", "initials": "PN"}], "meetings": [], "decisions": [], "tasks": [], "documents": [], "plans": [], "initiatives": [], "kpis": [], "risks": [], "agendaProposals": [], "channels": [], "messages": [], "readState": {}}'::jsonb)
on conflict (portal_id) do nothing;

-- ============================================================================
-- BOOTSTRAP – kjør EN gang etter at du har opprettet din egen konto i appen.
-- Gir din bruker tilgang til alle portaler (bytt ut e-posten):
--
--   insert into public.portal_members (portal_id, profile_id)
--   select p.id, pr.id
--   from public.portals p
--   cross join public.profiles pr
--   where pr.email = 'din@epost.no'
--   on conflict do nothing;
--
-- For å begrense (f.eks. kun ledergruppen for én person), legg inn enkeltrader:
--   insert into public.portal_members (portal_id, profile_id)
--   select 'leadership', id from public.profiles where email = 'leder@epost.no';
-- ============================================================================
