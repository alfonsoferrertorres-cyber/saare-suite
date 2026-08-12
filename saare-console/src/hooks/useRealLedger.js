import { useState, useEffect } from 'react';

export function useRealLedger() {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('DESCONECTADO');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('http://localhost:3002/api/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || data);
          setStatus('CONECTADO (3002)');
        }
      } catch (err) {
        setStatus('DISCONNECTED');
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return { logs, status };
}
