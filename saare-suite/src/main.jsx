import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import Login from './Login.jsx';
import './index.css';
import './styles.css';

// Permite simular el estado de autenticación básico dentro de la sesión de la consola
function Root() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    () => localStorage.getItem('saare_token') !== null
  );

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <App onLogout={() => {
    localStorage.removeItem('saare_token');
    setIsAuthenticated(false);
  }} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);