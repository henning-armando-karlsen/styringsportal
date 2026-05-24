import React, { useState, useEffect } from 'react';
import { supabase, SUPABASE_ENABLED } from './supabase.js';

/*
  Når Supabase IKKE er konfigurert: appen kjører som før med lokale seed-data
  og den innebygde «velg person»-innloggingen.

  Når Supabase ER konfigurert: brukeren må logge inn med ekte konto (e-post/passord).
  Etter innlogging styrer RLS hvilke portaler kontoen har tilgang til.
  Inne i appen velger man fortsatt hvilken person/portal man jobber som.
*/

const C = {
  navy: '#1A2433', brass: '#B8893B', bg: '#FBF7EF', ink: '#1A2433',
  inkSoft: '#5A6675', border: '#E6DCC8', surface: '#FFFFFF',
};

function SignIn() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
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
        setMsg('Konto opprettet. Sjekk e-post for bekreftelse om det kreves, og logg inn.');
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
            {busy ? 'Vent …' : (mode === 'signin' ? 'Logg inn' : 'Opprett konto')}
          </button>
        </form>
        <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(null); }} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: C.inkSoft, fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>
          {mode === 'signin' ? 'Har du ikke konto? Opprett en' : 'Har du konto? Logg inn'}
        </button>
      </div>
    </div>
  );
}

export function AuthGate({ children }) {
  if (!SUPABASE_ENABLED) return children;

  const [session, setSession] = useState(undefined); // undefined = laster, null = ikke innlogget

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.inkSoft, fontFamily: "'Manrope', system-ui, sans-serif" }}>Laster …</div>;
  }
  if (session === null) return <SignIn />;
  return children;
}
