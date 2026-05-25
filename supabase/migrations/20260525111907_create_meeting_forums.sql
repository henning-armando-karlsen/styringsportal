/*
  # Create cross-functional meeting forums

  1. New portals registry entries
    - forum:ulg - Utvidet ledergruppe
    - forum:dmg - Driftsmotegruppe
    - forum:sug - Sortimentsutviklingsgruppe
    - forum:lgf - Ledergruppe deltaker fag

  2. New portal_state rows with org config + members
    - Each forum has meetings, decisions, tasks, documents, agendaProposals

  3. Portal Members
    - Chair role for designated meeting leader
    - Member role for all others
    - Only henning has a profile, so only he gets portal_members rows

  4. Security
    - Uses existing RLS on portal_state and portal_members
*/

-- 1. Register forums in portals table
INSERT INTO public.portals (id, name, subtitle, description, restricted)
VALUES
  ('forum:ulg', 'Utvidet ledergruppe', 'ULG', 'Bred ledergruppe pa tvers; strategi og oppfolging med utvidet deltakelse', false),
  ('forum:dmg', 'Driftsmotegruppe', 'DMG', 'Operativ drift og leveranse pa tvers', false),
  ('forum:sug', 'Sortimentsutviklingsgruppe', 'SUG', 'Sortiment, produktutvikling og sourcing', false),
  ('forum:lgf', 'Ledergruppe - deltaker fag', 'LGF', 'Fagdeltakelse i ledergruppen', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description;

-- 2. forum:ulg portal_state
INSERT INTO public.portal_state (portal_id, content)
VALUES ('forum:ulg', '{
  "org": {
    "portalId": "forum:ulg",
    "portalName": "Utvidet ledergruppe",
    "orgName": "Utvidet ledergruppe",
    "type": "forum",
    "purpose": "Bred ledergruppe pa tvers; strategi og oppfolging med utvidet deltakelse",
    "chair": "svk",
    "teamLabel": "ULG",
    "teamOverline": "Tverrgaende forum",
    "groupNoun": "ULG",
    "meetingNoun": "ULG-mote",
    "meetingNounDef": "ULG-motene",
    "sectionStrategy": "Agenda",
    "navPlans": "Kalender",
    "navInitiatives": "Satsninger",
    "navTeam": "Medlemmer",
    "proposalsOverline": "Innmeldte saker til ULG",
    "messagesOverline": "Internt rom for ULG",
    "decisionsSub": "Vedtak fattet i ULG",
    "deskFooter": "Utvidet ledergruppe",
    "assistantScope": "Utvidet ledergruppe (ULG)",
    "assistantContextHeader": "ULG",
    "tip": "ULG gir utvidet ledergruppe bred deltakelse i strategiske beslutninger."
  },
  "members": [
    {"id":"svk","name":"Stein Viggo Karlsen","role":"Administrerende direktor / CEO","email":"svk@vikingbad.no","initials":"SK"},
    {"id":"tm","name":"Tonny Morewood","role":"Direktor for Teknologi og IKT / CIO","email":"tonny@vikingbad.no","initials":"TM"},
    {"id":"om","name":"Orjan Moy Jacobsen","role":"Spesialist Analyse","email":"orjan@vikingbad.no","initials":"OJ"},
    {"id":"henning","name":"Henning Karlsen","role":"Strategi (ekstern radgiver)","email":"henning@compete.no","initials":"HK"},
    {"id":"elh","name":"Espen Lovberg Hansen","role":"Direktor Okonomi og Finans / CFO","email":"espen.lovberg.hansen@vikingbad.no","initials":"EH"},
    {"id":"hba","name":"Hanne Birkenes Aamlid","role":"HR-leder","email":"hanne@vikingbad.no","initials":"HA"},
    {"id":"ak","name":"Arild Kaale","role":"Direktor for Marked","email":"arild.kaale@vikingbad.no","initials":"AK"},
    {"id":"svb","name":"Stine Veronica Bernander","role":"Leder Marked","email":"stine@vikingbad.no","initials":"SB"},
    {"id":"cb","name":"Christer Bergene","role":"Studioleder Sandvika","email":"christer.bergene@vikingbad.no","initials":"CB"},
    {"id":"er","name":"Eivind Rasmussen","role":"Studioleder Grimstad","email":"eivind@vikingbad.no","initials":"ER"},
    {"id":"ghl","name":"Geir Hakon Lindheim","role":"Leder Salg","email":"ghl@vikingbad.no","initials":"GL"},
    {"id":"mo","name":"Marius Olsen","role":"Teamleder Kundesenter","email":"marius@vikingbad.no","initials":"MO"},
    {"id":"sms","name":"Solve Marlon Stromsland","role":"Salg Proff","email":"sms@vikingbad.no","initials":"SS"},
    {"id":"sl","name":"Snorre Larstad","role":"Direktor for Sortimentsutvikling og Sourcing","email":"","initials":"SL"},
    {"id":"tpj","name":"Tom Patrich Josefsen","role":"Leder for Produktutvikling","email":"tpj@vikingbad.no","initials":"TJ"},
    {"id":"po","name":"Peder Ostmoe","role":"Teamleder Teknisk kundeservice","email":"peder@vikingbad.no","initials":"PO"},
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

-- 3. forum:dmg portal_state
INSERT INTO public.portal_state (portal_id, content)
VALUES ('forum:dmg', '{
  "org": {
    "portalId": "forum:dmg",
    "portalName": "Driftsmotegruppe",
    "orgName": "Driftsmotegruppe",
    "type": "forum",
    "purpose": "Operativ drift og leveranse pa tvers (logistikk, lager, teknisk kundeservice, sourcing)",
    "chair": "ee",
    "teamLabel": "DMG",
    "teamOverline": "Tverrgaende forum",
    "groupNoun": "DMG",
    "meetingNoun": "driftsmote",
    "meetingNounDef": "driftsmotene",
    "sectionStrategy": "Agenda",
    "navPlans": "Kalender",
    "navInitiatives": "Satsninger",
    "navTeam": "Medlemmer",
    "proposalsOverline": "Innmeldte saker til DMG",
    "messagesOverline": "Internt rom for DMG",
    "decisionsSub": "Vedtak fattet i DMG",
    "deskFooter": "Driftsmotegruppe",
    "assistantScope": "Driftsmotegruppe (DMG)",
    "assistantContextHeader": "DMG",
    "tip": "DMG sikrer god koordinering av operativ drift pa tvers av avdelingene."
  },
  "members": [
    {"id":"svk","name":"Stein Viggo Karlsen","role":"Administrerende direktor / CEO","email":"svk@vikingbad.no","initials":"SK"},
    {"id":"om","name":"Orjan Moy Jacobsen","role":"Spesialist Analyse","email":"orjan@vikingbad.no","initials":"OJ"},
    {"id":"sl","name":"Snorre Larstad","role":"Direktor for Sortimentsutvikling og Sourcing","email":"","initials":"SL"},
    {"id":"tpj","name":"Tom Patrich Josefsen","role":"Leder for Produktutvikling","email":"tpj@vikingbad.no","initials":"TJ"},
    {"id":"po","name":"Peder Ostmoe","role":"Teamleder Teknisk kundeservice","email":"peder@vikingbad.no","initials":"PO"},
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

-- 4. forum:sug portal_state
INSERT INTO public.portal_state (portal_id, content)
VALUES ('forum:sug', '{
  "org": {
    "portalId": "forum:sug",
    "portalName": "Sortimentsutviklingsgruppe",
    "orgName": "Sortimentsutviklingsgruppe",
    "type": "forum",
    "purpose": "Sortiment, produktutvikling og sourcing",
    "chair": "sl",
    "teamLabel": "SUG",
    "teamOverline": "Tverrgaende forum",
    "groupNoun": "SUG",
    "meetingNoun": "SUG-mote",
    "meetingNounDef": "SUG-motene",
    "sectionStrategy": "Agenda",
    "navPlans": "Kalender",
    "navInitiatives": "Satsninger",
    "navTeam": "Medlemmer",
    "proposalsOverline": "Innmeldte saker til SUG",
    "messagesOverline": "Internt rom for SUG",
    "decisionsSub": "Vedtak fattet i SUG",
    "deskFooter": "Sortimentsutviklingsgruppe",
    "assistantScope": "Sortimentsutviklingsgruppe (SUG)",
    "assistantContextHeader": "SUG",
    "tip": "SUG koordinerer sortiment og produktutvikling pa tvers av avdelingene."
  },
  "members": [
    {"id":"svk","name":"Stein Viggo Karlsen","role":"Administrerende direktor / CEO","email":"svk@vikingbad.no","initials":"SK"},
    {"id":"om","name":"Orjan Moy Jacobsen","role":"Spesialist Analyse","email":"orjan@vikingbad.no","initials":"OJ"},
    {"id":"ak","name":"Arild Kaale","role":"Direktor for Marked","email":"arild.kaale@vikingbad.no","initials":"AK"},
    {"id":"ghl","name":"Geir Hakon Lindheim","role":"Leder Salg","email":"ghl@vikingbad.no","initials":"GL"},
    {"id":"sl","name":"Snorre Larstad","role":"Direktor for Sortimentsutvikling og Sourcing","email":"","initials":"SL"},
    {"id":"tpj","name":"Tom Patrich Josefsen","role":"Leder for Produktutvikling","email":"tpj@vikingbad.no","initials":"TJ"}
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

-- 5. forum:lgf portal_state
INSERT INTO public.portal_state (portal_id, content)
VALUES ('forum:lgf', '{
  "org": {
    "portalId": "forum:lgf",
    "portalName": "Ledergruppe - deltaker fag",
    "orgName": "Ledergruppe - deltaker fag",
    "type": "forum",
    "purpose": "Fagdeltakelse i ledergruppen",
    "chair": "tpj",
    "teamLabel": "LGF",
    "teamOverline": "Tverrgaende forum",
    "groupNoun": "LGF",
    "meetingNoun": "LGF-mote",
    "meetingNounDef": "LGF-motene",
    "sectionStrategy": "Agenda",
    "navPlans": "Kalender",
    "navInitiatives": "Satsninger",
    "navTeam": "Medlemmer",
    "proposalsOverline": "Innmeldte saker til LGF",
    "messagesOverline": "Internt rom for LGF",
    "decisionsSub": "Vedtak fattet i LGF",
    "deskFooter": "Ledergruppe deltaker fag",
    "assistantScope": "Ledergruppe deltaker fag (LGF)",
    "assistantContextHeader": "LGF",
    "tip": "LGF sikrer faglig forankring i lederbeslutninger."
  },
  "members": [
    {"id":"tpj","name":"Tom Patrich Josefsen","role":"Leder for Produktutvikling","email":"tpj@vikingbad.no","initials":"TJ"}
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

-- 6. Portal members (only henning has a profile currently)
-- henning is member of ULG
INSERT INTO public.portal_members (portal_id, profile_id, member_role)
SELECT 'forum:ulg', id, 'member' FROM public.profiles WHERE handle = 'henning'
ON CONFLICT (portal_id, profile_id) DO UPDATE SET member_role = EXCLUDED.member_role;
