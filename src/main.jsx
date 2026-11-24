import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';
import { initData } from './storage.js';
import './styles.css';

// Primero se preparan los datos iniciales (admin y propiedades de ejemplo) y luego se dibuja la web.
initData().then(() => {
  createRoot(document.getElementById('root')).render(
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  );
});
