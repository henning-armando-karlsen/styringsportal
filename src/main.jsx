import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthGate } from './lib/AuthGate.jsx';

function Root() {
  const [identity, setIdentity] = useState(null);
  const handleIdentity = useCallback((id) => setIdentity(id), []);
  return (
    <AuthGate onIdentity={handleIdentity}>
      <App identity={identity} />
    </AuthGate>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
