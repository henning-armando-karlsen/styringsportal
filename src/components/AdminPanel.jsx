import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const C = {
  navy: '#252525', brass: '#9D8068', bg: '#EDE9DF', ink: '#252525',
  inkSoft: '#5A5A5A', inkMuted: '#7A7A7A', border: '#CBC4AF', surface: '#FFFFFF',
  green: '#5E6A60', greenBg: '#E3E7E3', red: '#F4835A', redBg: '#FDE8E0',
  amberBg: '#EDE4DB', amber: '#7D6450', brassLight: '#EDE4DB',
};

const PORTALS = [
  { id: 'leadership', name: 'Ledelse' },
  { id: 'marketing', name: 'Marked' },
  { id: 'sales', name: 'Salg' },
  { id: 'innkjop', name: 'Innkjop' },
  { id: 'produkt', name: 'Produkt' },
];

export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [tab, setTab] = useState('users');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const admin = await checkIsAdmin();
      setIsAdmin(admin);
      if (admin) await loadData();
      setLoading(false);
    })();
  }, []);

  const loadData = async () => {
    const [profilesRes, membersRes] = await Promise.all([
      supabase.from('profiles').select('id, handle, name, email, phone, primary_portal, active'),
      supabase.from('portal_members').select('portal_id, profile_id, member_role'),
    ]);
    if (profilesRes.error) { setError(profilesRes.error.message); return; }
    if (membersRes.error) { setError(membersRes.error.message); return; }
    setProfiles((profilesRes.data || []).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
    setMembers(membersRes.data || []);
  };

  const getMembership = useCallback((profileId, portalId) => {
    return members.find(m => m.profile_id === profileId && m.portal_id === portalId);
  }, [members]);

  const isUserAdmin = useCallback((profileId) => {
    return members.some(m => m.profile_id === profileId && m.member_role === 'admin');
  }, [members]);

  const hasAnyAccess = useCallback((profileId) => {
    return members.some(m => m.profile_id === profileId);
  }, [members]);

  const togglePortalAccess = async (profileId, portalId) => {
    const existing = getMembership(profileId, portalId);
    setSaving(`${profileId}-${portalId}`);
    setError(null);
    try {
      if (existing) {
        const { error: err } = await supabase
          .from('portal_members')
          .delete()
          .eq('portal_id', portalId)
          .eq('profile_id', profileId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('portal_members')
          .insert({ portal_id: portalId, profile_id: profileId, member_role: 'member' });
        if (err) throw err;
      }
      await loadData();
    } catch (e) {
      setError(e.message || 'Lagring feilet');
    } finally {
      setSaving(null);
    }
  };

  const toggleAdmin = async (profileId) => {
    if (profileId === currentUserId) {
      if (!window.confirm('Du er i ferd med a fjerne din egen admin-tilgang. Er du sikker?')) return;
    }
    const userIsAdmin = isUserAdmin(profileId);
    setSaving(`admin-${profileId}`);
    setError(null);
    try {
      if (userIsAdmin) {
        const { error: err } = await supabase
          .from('portal_members')
          .update({ member_role: 'member' })
          .eq('profile_id', profileId)
          .eq('member_role', 'admin');
        if (err) throw err;
      } else {
        for (const p of PORTALS) {
          const { error: err } = await supabase
            .from('portal_members')
            .upsert(
              { portal_id: p.id, profile_id: profileId, member_role: 'admin' },
              { onConflict: 'portal_id,profile_id' }
            );
          if (err) throw err;
        }
      }
      await loadData();
    } catch (e) {
      setError(e.message || 'Lagring feilet');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: "'Manrope', system-ui, sans-serif", color: C.inkSoft }}>
        Laster ...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 60, textAlign: 'center', fontFamily: "'Manrope', system-ui, sans-serif" }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 8 }}>Ingen tilgang</div>
        <div style={{ fontSize: 14, color: C.inkSoft }}>Du har ikke administratorrettigheter.</div>
      </div>
    );
  }

  const noAccessProfiles = profiles.filter(p => !hasAnyAccess(p.id));
  const accessProfiles = profiles.filter(p => hasAnyAccess(p.id));

  return (
    <div style={{ padding: '32px 28px', fontFamily: "'Manrope', system-ui, sans-serif", maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: C.ink, marginBottom: 4 }}>
          Administrasjon
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft }}>
          Administrer brukere, tilganger og registrer nye medarbeidere.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
        {[
          { key: 'users', label: 'Brukere & tilgang' },
          { key: 'register', label: 'Registrer medarbeider' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', border: 'none', background: 'none',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 500, cursor: 'pointer',
              fontFamily: 'inherit', color: tab === t.key ? C.ink : C.inkSoft,
              borderBottom: tab === t.key ? `2px solid ${C.brass}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: C.redBg, color: C.red, borderRadius: 8, fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {tab === 'users' && (
        <>
          {noAccessProfiles.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                Venter pa tilgang ({noAccessProfiles.length})
              </div>
              <div style={{ background: C.amberBg, borderRadius: 10, padding: '14px 16px' }}>
                {noAccessProfiles.map(p => (
                  <UserRow
                    key={p.id}
                    profile={p}
                    members={members}
                    currentUserId={currentUserId}
                    saving={saving}
                    getMembership={getMembership}
                    isUserAdmin={isUserAdmin}
                    onTogglePortal={togglePortalAccess}
                    onToggleAdmin={toggleAdmin}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Aktive brukere ({accessProfiles.length})
          </div>
          <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
            {accessProfiles.map((p, i) => (
              <UserRow
                key={p.id}
                profile={p}
                members={members}
                currentUserId={currentUserId}
                saving={saving}
                getMembership={getMembership}
                isUserAdmin={isUserAdmin}
                onTogglePortal={togglePortalAccess}
                onToggleAdmin={toggleAdmin}
                borderTop={i > 0}
              />
            ))}
          </div>
        </>
      )}

      {tab === 'register' && (
        <RegisterForm onSuccess={() => { setTab('users'); loadData(); }} setError={setError} />
      )}
    </div>
  );
}

function RegisterForm({ onSuccess, setError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [handle, setHandle] = useState('');
  const [selectedPortals, setSelectedPortals] = useState([]);
  const [primaryPortal, setPrimaryPortal] = useState('');
  const [role, setRole] = useState('member');
  const [makeAdmin, setMakeAdmin] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (email && !handle) {
      const auto = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 10);
      setHandle(auto);
    }
  }, [email]);

  useEffect(() => {
    if (selectedPortals.length > 0 && !selectedPortals.includes(primaryPortal)) {
      setPrimaryPortal(selectedPortals[0]);
    }
    if (selectedPortals.length === 0) setPrimaryPortal('');
  }, [selectedPortals]);

  const togglePortal = (pid) => {
    setSelectedPortals(prev =>
      prev.includes(pid) ? prev.filter(p => p !== pid) : [...prev, pid]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (selectedPortals.length === 0) {
      setError('Velg minst en avdeling');
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Ikke innlogget');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'Apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ action: 'invite', email, name }),
      });
      const json = await res.json();
      if (!res.ok && res.status !== 409) throw new Error(json.error || 'Feil ved opprettelse');

      const userId = json.userId;

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          handle,
          name,
          email,
          phone: phone || null,
          primary_portal: primaryPortal || null,
          active: true,
        }, { onConflict: 'id' });

        const memberRole = makeAdmin ? 'admin' : (role || 'member');
        for (const pid of selectedPortals) {
          await supabase.from('portal_members').upsert(
            { portal_id: pid, profile_id: userId, member_role: memberRole },
            { onConflict: 'portal_id,profile_id' }
          );
        }
      }

      setResult({ success: true, email, userId });
      setName(''); setEmail(''); setPhone(''); setHandle('');
      setSelectedPortals([]); setPrimaryPortal(''); setRole('member'); setMakeAdmin(false);
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.message || 'Noe gikk galt');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 13px', borderRadius: 8, border: `1px solid ${C.border}`,
    fontSize: 13, fontFamily: 'inherit', background: '#fff', color: C.ink,
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: C.inkSoft, display: 'block', marginBottom: 14 };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ fontSize: 14, color: C.inkSoft, marginBottom: 20, lineHeight: 1.5 }}>
        Registrer en ny medarbeider. De vil fa tilgang til portalen(e) du velger, og kan logge inn med e-post og passord.
      </div>

      {result?.success && (
        <div style={{ padding: '12px 16px', background: C.greenBg, color: C.green, borderRadius: 8, fontSize: 13, marginBottom: 18, fontWeight: 500 }}>
          {result.email} er registrert. Brukeren kan na logge inn.
        </div>
      )}

      <form onSubmit={submit}>
        <label style={labelStyle}>
          Navn *
          <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="Ola Nordmann" />
        </label>

        <label style={labelStyle}>
          E-post *
          <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ola@vikingbad.no" />
        </label>

        <label style={labelStyle}>
          Telefon
          <input style={inputStyle} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+47 123 45 678" />
        </label>

        <label style={labelStyle}>
          Handle (kort ID)
          <input style={inputStyle} value={handle} onChange={e => setHandle(e.target.value)} required placeholder="ola" maxLength={20} pattern="[a-z0-9]+" title="Kun sma bokstaver og tall" />
        </label>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.inkSoft, marginBottom: 8 }}>Avdelinger *</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PORTALS.map(p => {
              const active = selectedPortals.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePortal(p.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 20, border: 'none', fontSize: 12, fontWeight: 500,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.12s',
                    background: active ? C.greenBg : '#F0ECE4',
                    color: active ? C.green : C.inkSoft,
                  }}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {selectedPortals.length > 1 && (
          <label style={labelStyle}>
            Primaravdeling
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={primaryPortal}
              onChange={e => setPrimaryPortal(e.target.value)}
            >
              {selectedPortals.map(pid => {
                const p = PORTALS.find(x => x.id === pid);
                return <option key={pid} value={pid}>{p?.name || pid}</option>;
              })}
            </select>
          </label>
        )}

        <label style={labelStyle}>
          Rolle
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={role} onChange={e => setRole(e.target.value)}>
            <option value="member">Medlem</option>
            <option value="admin">Administrator</option>
          </select>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={makeAdmin}
            onChange={e => setMakeAdmin(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: C.brass }}
          />
          <span style={{ fontSize: 13, color: C.ink }}>Gi administratortilgang</span>
        </label>

        <button
          type="submit"
          disabled={busy}
          style={{
            padding: '12px 24px', borderRadius: 9, border: 'none',
            background: C.brass, color: '#fff', fontSize: 14, fontWeight: 600,
            cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit',
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Registrerer ...' : 'Registrer medarbeider'}
        </button>
      </form>
    </div>
  );
}

function UserRow({ profile, members, currentUserId, saving, getMembership, isUserAdmin, onTogglePortal, onToggleAdmin, borderTop }) {
  const admin = isUserAdmin(profile.id);
  const isSelf = profile.id === currentUserId;

  return (
    <div style={{ padding: '14px 16px', borderTop: borderTop ? `1px solid ${C.border}` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: admin ? C.brass : C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
          {(profile.name || profile.handle || '?').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {profile.name || profile.handle}{isSelf && ' (deg)'}
          </div>
          <div style={{ fontSize: 12, color: C.inkSoft }}>{profile.email}</div>
        </div>
        <button
          onClick={() => onToggleAdmin(profile.id)}
          disabled={saving === `admin-${profile.id}`}
          style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
            background: admin ? C.brass : 'transparent',
            color: admin ? '#fff' : C.inkSoft,
            border: admin ? 'none' : `1px solid ${C.border}`,
            opacity: saving === `admin-${profile.id}` ? 0.5 : 1,
          }}
        >
          {admin ? 'Admin' : 'Gjor admin'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PORTALS.map(portal => {
          const membership = getMembership(profile.id, portal.id);
          const active = !!membership;
          const isSaving = saving === `${profile.id}-${portal.id}`;
          return (
            <button
              key={portal.id}
              onClick={() => onTogglePortal(profile.id, portal.id)}
              disabled={isSaving}
              style={{
                padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 11, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                background: active ? C.greenBg : '#F0ECE4',
                color: active ? C.green : C.inkSoft,
                opacity: isSaving ? 0.5 : 1,
              }}
            >
              {portal.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
