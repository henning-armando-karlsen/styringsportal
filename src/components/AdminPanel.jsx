import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const C = {
  navy: '#1A2433', brass: '#B8893B', bg: '#FBF7EF', ink: '#1A2433',
  inkSoft: '#5A6675', border: '#E6DCC8', surface: '#FFFFFF',
  green: '#3D7B4F', greenBg: '#E5EEE3', red: '#9B4836', redBg: '#F3E0D8',
  amberBg: '#F4E9D2', amber: '#9B7230',
};

const PORTALS = [
  { id: 'leadership', name: 'Ledelse' },
  { id: 'marketing', name: 'Marked' },
  { id: 'sales', name: 'Salg' },
  { id: 'innkjop', name: 'Innkjøp' },
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
      supabase.from('profiles').select('id, handle, name, email'),
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
      if (!window.confirm('Du er i ferd med å fjerne din egen admin-tilgang. Er du sikker?')) return;
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
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: C.ink, marginBottom: 4 }}>
          Brukere & tilgang
        </div>
        <div style={{ fontSize: 13, color: C.inkSoft }}>
          Administrer hvem som har tilgang til hvilke portaler.
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', background: C.redBg, color: C.red, borderRadius: 8, fontSize: 13, marginBottom: 18 }}>
          {error}
        </div>
      )}

      {noAccessProfiles.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Venter på tilgang ({noAccessProfiles.length})
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
          {admin ? 'Admin' : 'Gjør admin'}
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
