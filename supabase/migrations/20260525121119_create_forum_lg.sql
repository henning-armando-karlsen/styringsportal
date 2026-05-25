/*
  # Add Ledergruppe (LG) meeting forum

  1. New portal registry entry
    - forum:lg - Ledergruppe (9 members)

  2. New portal_state row
    - Chair: svk (Stein Viggo Karlsen)
    - Members: svk, tm, om, henning, elh, ak, ghl, sl, ee

  3. Portal Members
    - Chair role for svk
    - Member role for henning (only profile that exists)
*/

-- Register forum in portals table
INSERT INTO public.portals (id, name, subtitle, description, restricted)
VALUES ('forum:lg', 'Ledergruppe', 'LG', 'Vikingbads ledergruppe; strategi, styring og beslutninger pa tvers', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- portal_state for forum:lg
INSERT INTO public.portal_state (portal_id, content)
VALUES ('forum:lg', '{
  "org": {
    "portalId": "forum:lg",
    "portalName": "Ledergruppe",
    "orgName": "Ledergruppe",
    "type": "forum",
    "purpose": "Vikingbads ledergruppe; strategi, styring og beslutninger pa tvers",
    "chair": "svk",
    "teamLabel": "LG",
    "teamOverline": "Tverrgaende forum",
    "groupNoun": "ledergruppen",
    "meetingNoun": "ledergruppemote",
    "meetingNounDef": "ledergruppemotene",
    "sectionStrategy": "Agenda",
    "navPlans": "Kalender",
    "navInitiatives": "Satsninger",
    "navTeam": "Medlemmer",
    "proposalsOverline": "Innmeldte saker til ledergruppen",
    "messagesOverline": "Internt rom for ledergruppen",
    "decisionsSub": "Vedtak fattet i ledergruppen",
    "deskFooter": "Ledergruppe",
    "assistantScope": "Vikingbads ledergruppe (LG)",
    "assistantContextHeader": "LEDERGRUPPEN",
    "tip": "Ledergruppen er det overste beslutningsorganet pa tvers av alle avdelinger."
  },
  "members": [
    {"id":"svk","name":"Stein Viggo Karlsen","role":"Administrerende direktor / CEO","email":"svk@vikingbad.no","initials":"SK"},
    {"id":"tm","name":"Tonny Morewood","role":"Direktor for Teknologi og IKT / CIO","email":"tonny@vikingbad.no","initials":"TM"},
    {"id":"om","name":"Orjan Moy Jacobsen","role":"Spesialist Analyse","email":"orjan@vikingbad.no","initials":"OJ"},
    {"id":"henning","name":"Henning Karlsen","role":"Strategi (ekstern radgiver)","email":"henning@compete.no","initials":"HK"},
    {"id":"elh","name":"Espen Lovberg Hansen","role":"Direktor Okonomi og Finans / CFO","email":"espen.lovberg.hansen@vikingbad.no","initials":"EH"},
    {"id":"ak","name":"Arild Kaale","role":"Direktor for Marked","email":"arild.kaale@vikingbad.no","initials":"AK"},
    {"id":"ghl","name":"Geir Hakon Lindheim","role":"Leder Salg","email":"ghl@vikingbad.no","initials":"GL"},
    {"id":"sl","name":"Snorre Larstad","role":"Direktor for Sortimentsutvikling og Sourcing","email":"","initials":"SL"},
    {"id":"ee","name":"Elisabeth Engler","role":"Leder for supply chain","email":"","initials":"EE"}
  ],
  "meetings": [],
  "decisions": [],
  "tasks": [],
  "documents": [],
  "agendaProposals": [],
  "channels": [],
  "messages": [],
  "readState": {}
}'::jsonb)
ON CONFLICT (portal_id) DO UPDATE SET
  content = jsonb_set(
    jsonb_set(portal_state.content, '{org}', EXCLUDED.content->'org'),
    '{members}', EXCLUDED.content->'members'
  ),
  updated_at = now();

-- Portal members for henning (chair=svk but svk has no profile; henning does)
INSERT INTO public.portal_members (portal_id, profile_id, member_role)
SELECT 'forum:lg', id, 'member' FROM public.profiles WHERE handle = 'henning'
ON CONFLICT (portal_id, profile_id) DO UPDATE SET member_role = EXCLUDED.member_role;
