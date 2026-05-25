import React, { useState, useMemo } from 'react';

const C = {
  navy: '#252525', brass: '#9D8068', bg: '#EDE9DF', ink: '#252525',
  inkSoft: '#5A5A5A', inkMuted: '#7A7A7A', border: '#CBC4AF', borderSoft: '#DDD8CB',
  surface: '#FFFFFF', surfaceAlt: '#E4DFD4',
  sage: '#5E6A60', sageLight: '#E3E7E3',
  brassLight: '#EDE4DB', brassDark: '#7D6450',
  rust: '#F4835A', rustLight: '#FDE8E0',
};

const portalMeta = {
  leadership: { name: 'Ledergruppen', subtitle: 'Ledergruppeportal', icon: 'shield', color: '#252525', restricted: true },
  marketing:  { name: 'Markedsavdelingen', subtitle: 'Markedsportal', icon: 'megaphone', color: '#9D8068' },
  sales:      { name: 'Salgsavdelingen', subtitle: 'Salgsportal', icon: 'trending', color: '#5E6A60' },
  innkjop:    { name: 'Innkjøpsavdelingen', subtitle: 'Innkjøpsportal', icon: 'clipboard', color: '#7D6450' },
  produkt:    { name: 'Produkt & Sourcing', subtitle: 'Produkt & Sourcing', icon: 'compass', color: '#4A6B5C' },
};

const portalIcons = {
  shield: <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>,
  megaphone: <><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></>,
  trending: <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
  clipboard: <><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></>,
  compass: <><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></>,
};

function PortalIcon({ icon, size = 20, color = '#fff' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
         fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {portalIcons[icon]}
    </svg>
  );
}

export default function DirectoryView({ allData, currentUserId, isAdmin }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { portalSections, allPeople } = useMemo(() => {
    const peopleMap = {};
    const sections = [];

    const portalIds = Object.keys(allData || {}).filter(k => k !== 'crossorg' && portalMeta[k]);

    for (const pid of portalIds) {
      const portal = allData[pid];
      if (!portal || !portal.members) continue;
      const meta = portalMeta[pid];
      const sectionMembers = [];

      for (const m of portal.members) {
        sectionMembers.push(m);
        if (!peopleMap[m.id]) {
          peopleMap[m.id] = { ...m, portals: [pid] };
        } else {
          if (!peopleMap[m.id].portals.includes(pid)) {
            peopleMap[m.id].portals.push(pid);
          }
        }
      }

      sections.push({ portalId: pid, meta, members: sectionMembers });
    }

    return { portalSections: sections, allPeople: peopleMap };
  }, [allData]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return portalSections;
    const q = searchQuery.toLowerCase();
    return portalSections.map(sec => ({
      ...sec,
      members: sec.members.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q)
      ),
    })).filter(sec => sec.members.length > 0);
  }, [portalSections, searchQuery]);

  const person = selectedPerson ? allPeople[selectedPerson] : null;

  return (
    <div style={{ padding: '32px 28px', fontFamily: "'Manrope', system-ui, sans-serif", maxWidth: 860, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, color: C.ink, marginBottom: 4 }}>
          Avdelinger & medarbeidere
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.5 }}>
          Oversikt over alle avdelinger og deres medlemmer i Vikingbad.
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Sok etter navn, rolle eller e-post..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', maxWidth: 360, padding: '10px 14px', borderRadius: 9,
            border: `1px solid ${C.border}`, fontSize: 13, fontFamily: 'inherit',
            background: C.surface, color: C.ink, outline: 'none',
          }}
        />
      </div>

      {filteredSections.map(sec => (
        <PortalSection
          key={sec.portalId}
          section={sec}
          allPeople={allPeople}
          onSelect={setSelectedPerson}
        />
      ))}

      {filteredSections.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: C.inkMuted, fontSize: 14 }}>
          Ingen treff for "{searchQuery}"
        </div>
      )}

      {person && (
        <PersonModal
          person={person}
          isAdmin={isAdmin}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
}

function PortalSection({ section, allPeople, onSelect }) {
  const { portalId, meta, members } = section;
  const isRestricted = meta.restricted;

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
        padding: '14px 18px', borderRadius: 12,
        background: C.surface, border: `1px solid ${C.borderSoft}`,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: meta.color || C.navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <PortalIcon icon={meta.icon} size={18} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{meta.name}</div>
          <div style={{ fontSize: 12, color: C.inkMuted }}>{meta.subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isRestricted && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 4, background: C.rustLight, color: C.rust,
            }}>
              Begrenset
            </span>
          )}
          <span style={{ fontSize: 12, color: C.inkMuted, fontWeight: 500 }}>
            {members.length} {members.length === 1 ? 'medlem' : 'medlemmer'}
          </span>
        </div>
      </div>

      <div style={{
        background: C.surface, borderRadius: 10, border: `1px solid ${C.borderSoft}`,
        overflow: 'hidden',
      }}>
        {members.map((m, i) => {
          const multiPortal = allPeople[m.id]?.portals?.length > 1;
          return (
            <div
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 18px', cursor: 'pointer',
                borderTop: i > 0 ? `1px solid ${C.borderSoft}` : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.bg}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: meta.color || C.navy, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {m.initials || m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>
                    {m.name}
                  </span>
                  {multiPortal && (
                    <span style={{
                      fontSize: 9.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                      padding: '2px 6px', borderRadius: 3,
                      background: C.sageLight, color: C.sage,
                    }}>
                      Flere
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.inkMuted, marginTop: 1 }}>{m.role}</div>
              </div>
              <div style={{ fontSize: 12, color: C.inkSoft, textAlign: 'right', flexShrink: 0 }}>
                {m.email}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PersonModal({ person, isAdmin, onClose }) {
  const portalNames = (person.portals || []).map(pid => portalMeta[pid]?.name || pid);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 400, background: C.surface,
          borderRadius: 16, padding: '30px 28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: C.navy, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700,
          }}>
            {person.initials || person.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.ink }}>{person.name}</div>
            <div style={{ fontSize: 13, color: C.inkMuted }}>{person.role}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {person.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span style={{ fontSize: 13, color: C.ink }}>{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.inkMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span style={{ fontSize: 13, color: C.ink }}>{person.phone}</span>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Tilhorighet
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {portalNames.map(name => (
              <span key={name} style={{
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                background: C.brassLight, color: C.brassDark,
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {isAdmin && (
            <button
              style={{
                padding: '9px 16px', borderRadius: 8, border: `1px solid ${C.border}`,
                background: C.surface, color: C.ink, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Rediger
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: C.brass, color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  );
}
