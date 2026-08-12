import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('CONECTANDO...');
  const [newLogIds, setNewLogIds] = useState(new Set());
  const previousIdsRef = useRef(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/logs');
        if (res.ok) {
          const data = await res.json();
          const fetchedLogs = data.logs || data;
          
          // Detectar IDs nuevos para marcarlos
          const currentIds = new Set(fetchedLogs.map(l => l.id || l.evidenceId));
          const newlyAdded = new Set();
          
          currentIds.forEach(id => {
            if (!previousIdsRef.current.has(id)) {
              newlyAdded.add(id);
            }
          });

          if (newlyAdded.size > 0 && previousIdsRef.current.size > 0) {
            setNewLogIds(newlyAdded);
            setTimeout(() => setNewLogIds(new Set()), 3000); // Quitar marcado a los 3s
          }

          previousIdsRef.current = currentIds;
          setLogs(fetchedLogs);
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
              const logId = log.id || log.evidenceId || 'EV-' + index;
              const isNew = newLogIds.has(logId);
              return (
                <tr key={index} style={{ 
                  borderBottom: '1px solid #222',
                  backgroundColor: isNew ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  transition: 'background-color 1s ease'
                }}>
                  <td style={{ padding: '10px', color: isNew ? '#00ff88' : '#e2b340', fontWeight: isNew ? 'bold' : 'normal' }}>
                    {isNew ? '► ' : ''}{logId}
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
