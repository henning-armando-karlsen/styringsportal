/*
  # Update all portal members to match the official org chart

  1. Portal Content Updates
    - leadership: CEO + Stab + 4 column leaders (11 members)
    - marketing: Arild Kaale (leder) + 7 team members (8 total)
    - sales: Geir Hakon Lindheim (leder) + 3 direct + 7 RA team (11 total)
    - produkt: Snorre Larstad (leder) + 2 reports (3 total)
    - innkjop: Elisabeth Engler (leder) only (1 total)

  2. Profile Update
    - henning: role updated to 'Strategi (ekstern radgiver)'

  3. Important Notes
    - Removes all old seed members not in the org chart
    - Preserves henning@compete.no admin account untouched
    - Column leaders appear in BOTH leadership AND their own portal
    - Handles are derived from email prefix or initials
    - RA team members get role 'Salg - Reklamasjon (RA)'
    - Idempotent: replaces content.members entirely
*/

-- Update henning's role in profiles
UPDATE public.profiles
SET name = 'Henning Karlsen'
WHERE handle = 'henning';

-- LEADERSHIP portal members
UPDATE public.portal_state
SET content = jsonb_set(content, '{members}', '[
  {"id":"svk","name":"Stein Viggo Karlsen","role":"Administrerende direktør / CEO","email":"svk@vikingbad.no","initials":"SK"},
  {"id":"tm","name":"Tonny Morewood","role":"Direktør for Teknologi og IKT / CIO","email":"tonny@vikingbad.no","initials":"TM"},
  {"id":"eh","name":"Eirik Halvorsen","role":"Systemutvikler IKT","email":"eh@vikingbad.no","initials":"EH"},
  {"id":"om","name":"Ørjan Moy Jacobsen","role":"Spesialist Analyse","email":"orjan@vikingbad.no","initials":"ØJ"},
  {"id":"henning","name":"Henning Karlsen","role":"Strategi (ekstern rådgiver)","email":"henning@compete.no","initials":"HK"},
  {"id":"elh","name":"Espen Løvberg Hansen","role":"Direktør Økonomi og Finans / CFO","email":"espen.lovberg.hansen@vikingbad.no","initials":"EH"},
  {"id":"hba","name":"Hanne Birkenes Aamlid","role":"HR-leder","email":"hanne@vikingbad.no","initials":"HA"},
  {"id":"ak","name":"Arild Kaale","role":"Direktør for Marked","email":"arild.kaale@vikingbad.no","initials":"AK"},
  {"id":"ghl","name":"Geir Håkon Lindheim","role":"Leder Salg","email":"ghl@vikingbad.no","initials":"GL"},
  {"id":"sl","name":"Snorre Larstad","role":"Direktør for Sortimentsutvikling og Sourcing","email":"","initials":"SL"},
  {"id":"ee","name":"Elisabeth Engler","role":"Leder for supply chain","email":"","initials":"EE"}
]'::jsonb),
    updated_at = now()
WHERE portal_id = 'leadership';

-- MARKETING portal members
UPDATE public.portal_state
SET content = jsonb_set(content, '{members}', '[
  {"id":"ak","name":"Arild Kaale","role":"Direktør for Marked","email":"arild.kaale@vikingbad.no","initials":"AK"},
  {"id":"svb","name":"Stine Veronica Bernander","role":"Leder Marked","email":"stine@vikingbad.no","initials":"SB"},
  {"id":"sa","name":"Sona Appaiah","role":"Merkevare- og webdesigner","email":"sona.appaiah@vikingbad.no","initials":"SA"},
  {"id":"kfs","name":"Kaja Frigstad Skuggevik","role":"Spesialist visuelt design","email":"kaja.skuggevik@vikingbad.no","initials":"KS"},
  {"id":"cb","name":"Christer Bergene","role":"Studioleder Sandvika","email":"christer.bergene@vikingbad.no","initials":"CB"},
  {"id":"eg","name":"Emilie Gullvik","role":"Baderomsdesigner","email":"emilie.gullvik@vikingbad.no","initials":"EG"},
  {"id":"aj","name":"Andrea Jensen","role":"Baderomsdesigner","email":"andrea.jensen@vikingbad.no","initials":"AJ"},
  {"id":"er","name":"Eivind Rasmussen","role":"Studioleder Grimstad","email":"eivind@vikingbad.no","initials":"ER"}
]'::jsonb),
    updated_at = now()
WHERE portal_id = 'marketing';

-- SALES portal members
UPDATE public.portal_state
SET content = jsonb_set(content, '{members}', '[
  {"id":"ghl","name":"Geir Håkon Lindheim","role":"Leder Salg","email":"ghl@vikingbad.no","initials":"GL"},
  {"id":"mo","name":"Marius Olsen","role":"Teamleder Kundesenter","email":"marius@vikingbad.no","initials":"MO"},
  {"id":"sms","name":"Sølve Marlon Strømsland","role":"Salg Proff","email":"sms@vikingbad.no","initials":"SS"},
  {"id":"ah","name":"Anette Hansen","role":"Salg Proff","email":"","initials":"AH"},
  {"id":"cewh","name":"Carl Eric Wessel Holst","role":"Salg · Reklamasjon (RA)","email":"","initials":"CH"},
  {"id":"ie","name":"Irina Ellingsen","role":"Salg · Reklamasjon (RA)","email":"","initials":"IE"},
  {"id":"tn","name":"Tom Nyhagen","role":"Salg · Reklamasjon (RA)","email":"","initials":"TN"},
  {"id":"tmlo","name":"Tore Mølbach Lunde-Olsen","role":"Salg · Reklamasjon (RA)","email":"","initials":"TL"},
  {"id":"vs","name":"Vegard Somdal","role":"Salg · Reklamasjon (RA)","email":"","initials":"VS"},
  {"id":"pop","name":"Per Øivind Pedersen","role":"Salg · Reklamasjon (RA)","email":"","initials":"PP"},
  {"id":"at","name":"Aleksander Torjussen","role":"Salg · Reklamasjon (RA)","email":"","initials":"AT"}
]'::jsonb),
    updated_at = now()
WHERE portal_id = 'sales';

-- PRODUKT portal members
UPDATE public.portal_state
SET content = jsonb_set(content, '{members}', '[
  {"id":"sl","name":"Snorre Larstad","role":"Direktør for Sortimentsutvikling og Sourcing","email":"","initials":"SL"},
  {"id":"tpj","name":"Tom Patrich Josefsen","role":"Leder for Produktutvikling","email":"tpj@vikingbad.no","initials":"TJ"},
  {"id":"po","name":"Peder Østmoe","role":"Teamleder Teknisk kundeservice","email":"peder@vikingbad.no","initials":"PØ"}
]'::jsonb),
    updated_at = now()
WHERE portal_id = 'produkt';

-- INNKJOP portal members
UPDATE public.portal_state
SET content = jsonb_set(content, '{members}', '[
  {"id":"ee","name":"Elisabeth Engler","role":"Leder for supply chain","email":"","initials":"EE"}
]'::jsonb),
    updated_at = now()
WHERE portal_id = 'innkjop';
