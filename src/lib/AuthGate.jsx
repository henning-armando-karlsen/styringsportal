import React, { useState, useEffect } from 'react';
import { supabase, SUPABASE_ENABLED } from './supabase.js';

const C = {
  navy: '#252525', brass: '#9D8068', bg: '#EDE9DF', ink: '#252525',
  inkSoft: '#5A5A5A', border: '#CBC4AF', surface: '#FFFFFF',
};

function SignIn() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Konto opprettet. Logg inn med e-post og passord.');
        setMode('signin');
      }
    } catch (err) {
      setMsg(err.message || 'Noe gikk galt.');
    } finally {
      setBusy(false);
    }
  };

  const input = {
    width: '100%', padding: '11px 13px', borderRadius: 9, border: `1px solid ${C.border}`,
    fontSize: 14, fontFamily: 'inherit', marginTop: 6, background: '#fff', color: C.ink,
  };
  const label = { fontSize: 12, fontWeight: 600, color: C.inkSoft, letterSpacing: 0.2 };

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${C.navy} 0%, #0F1722 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 380, background: C.surface, borderRadius: 16, padding: '34px 30px', boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 24, color: C.ink, marginBottom: 4 }}>Vikingbad</div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 22 }}>
          {mode === 'signin' ? 'Logg inn for å fortsette' : 'Opprett konto'}
        </div>
        <form onSubmit={submit}>
          <label style={label}>E-post
            <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <div style={{ height: 14 }} />
          <label style={label}>Passord
            <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} />
          </label>
          {msg && <div style={{ marginTop: 14, fontSize: 12.5, color: C.inkSoft, background: C.bg, padding: '10px 12px', borderRadius: 8, lineHeight: 1.5 }}>{msg}</div>}
          <button type="submit" disabled={busy} style={{ width: '100%', marginTop: 18, padding: '12px', borderRadius: 9, border: 'none', background: C.brass, color: '#fff', fontSize: 14, fontWeight: 600, cursor: busy ? 'default' : 'pointer', fontFamily: 'inherit', opacity: busy ? 0.7 : 1 }}>
            {busy ? 'Vent ...' : (mode === 'signin' ? 'Logg inn' : 'Opprett konto')}
          </button>
        </form>
        <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null); }} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: C.inkSoft, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>
          {mode === 'signin' ? 'Har du ikke konto? Opprett en' : 'Har du konto? Logg inn'}
        </button>
      </div>
    </div>
  );
}

function NotRegistered({ onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 440, background: C.surface, borderRadius: 16, padding: '40px 34px', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', border: `1px solid ${C.border}` }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EDE4DB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: C.brass, fontSize: 24 }}>!</div>
        <div style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 22, color: C.ink, marginBottom: 10 }}>Ikke registrert</div>
        <div style={{ fontSize: 14, color: C.inkSoft, lineHeight: 1.6, marginBottom: 24 }}>
          Du er ikke registrert i Styringsportalen enda. Kontakt en administrator for a bli lagt til.
        </div>
        <button onClick={onLogout} style={{ padding: '11px 24px', borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          Logg ut
        </button>
      </div>
    </div>
  );
}

export function AuthGate({ children, onIdentity }) {
  if (!SUPABASE_ENABLED) return children;

  const [session, setSession] = useState(undefined);
  const [identity, setIdentity] = useState(undefined); // undefined=loading, null=not registered, object=ok

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIdentity(null); return; }
    resolveIdentity(session.user.id).then(id => {
      setIdentity(id);
      if (id && onIdentity) onIdentity(id);
    });
  }, [session]);

  if (session === undefined || (session && identity === undefined)) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.inkSoft, fontFamily: "'Manrope', system-ui, sans-serif" }}>Laster ...</div>;
  }
  if (session === null) return <SignIn />;
  if (identity === null) return <NotRegistered onLogout={() => supabase.auth.signOut()} />;
  return children;
}

async function resolveIdentity(authUid) {
  // Fetch profile for the authenticated user
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, handle, name, email, phone, primary_portal, active')
    .eq('id', authUid)
    .maybeSingle();

  if (pErr || !profile || !profile.handle) return null;
  if (profile.active === false) return null;

  // Fetch portal memberships
  const { data: memberships, error: mErr } = await supabase
    .from('portal_members')
    .select('portal_id, member_role')
    .eq('profile_id', authUid);

  if (mErr) return null;
  const portalIds = (memberships || []).map(m => m.portal_id).filter(p => p !== 'crossorg');
  if (portalIds.length === 0) return null;

  const isAdmin = (memberships || []).some(m => m.member_role === 'admin');
  const primaryPortal = profile.primary_portal && portalIds.includes(profile.primary_portal)
    ? profile.primary_portal
    : portalIds[0];

  return {
    handle: profile.handle,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    portals: portalIds,
    primaryPortal,
    isAdmin,
  };
}
