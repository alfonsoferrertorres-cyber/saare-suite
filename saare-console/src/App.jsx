import React, { useState, useEffect } from 'react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('CONECTANDO...');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || data);
          setStatus('CONECTADO (PUERTO 3002)');
        }
      } catch (err) {
        setStatus('DISCONNECTED');
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const now = Date.now();

  return (
    <div style={{ padding: '20px', backgroundColor: '#0b0f19', color: '#fff', fontFamily: 'monospace', minHeight: '100vh' }}>
      <h1>SAARE OPERATION CENTER V2.2 - TESTIGO EN VIVO</h1>
      <p>ESTADO NODO LOCAL: <strong style={{ color: status.includes('CONECTADO') ? '#00ff88' : '#ff4444' }}>{status}</strong></p>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #333', color: '#888' }}>
            <th style={{ padding: '10px' }}>ID EVIDENCIA</th>
            <th>TIMESTAMP</th>
            <th>USUARIO</th>
            <th>ESTADO</th>
            <th>FIRMA SHA-256</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Esperando interceptaciones en localhost:3002...</td></tr>
          ) : (
            logs.map((log, index) => {
              const logTime = new Date(log.timestamp).getTime() || 0;
              const isRecent = (now - logTime) < 10000; // Resalta si el log entró hace menos de 10s

              return (
                <tr key={index} style={{ 
                  borderBottom: '1px solid #222',
                  backgroundColor: isRecent ? 'rgba(0, 255, 136, 0.25)' : 'transparent',
                  transition: 'background-color 0.5s ease'
                }}>
                  <td style={{ padding: '10px', color: isRecent ? '#00ff88' : '#e2b340', fontWeight: 'bold' }}>
                    {isRecent ? '► [NUEVO] ' : ''}{log.id || log.evidenceId || 'EV-' + index}
                  </td>
                  <td>{log.timestamp || new Date().toISOString()}</td>
                  <td style={{ color: '#00d2ff' }}>{log.user || log.userAnonymized || 'OPERADOR'}</td>
                  <td style={{ color: log.decision === 'RECHAZADO' || log.status === 'RECHAZADO' ? '#ff4444' : '#00ff88' }}>
                    {log.decision || log.status || 'PERMITIDO'}
                  </td>
                  <td style={{ fontSize: '11px', color: '#aaa' }}>{log.signature || log.sha256DataHash || 'a29d21f5bf04f769-ED25519'}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
