// saare-console/src/main.jsx — Punto de Entrada Oficial S.A.A.R.E. Console GRC (v10.0)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('[SAARE_CONSOLE_FATAL] No se encontró el elemento contenedor #root en el DOM.');
}