import React, { useState } from 'react';
import { Sphere, Line, Html } from '@react-three/drei';

// Los 9 módulos de la suite SAARE
const MODULES = [
  { id: 'perimeter', name: 'PerimeterShield', angle: 0 },
  { id: 'vault', name: 'EvidenceVault', angle: 40 },
  { id: 'dora', name: 'DORA Compliance', angle: 80 },
  { id: 'ens', name: 'ENS Alto', angle: 120 },
  { id: 'anonymizer', name: 'PII Anonymizer', angle: 160 },
  { id: 'ratelimit', name: 'Rate Limiter', angle: 200 },
  { id: 'audittrail', name: 'Audit Trail Engine', angle: 240 },
  { id: 'signer', name: 'Ed25519 Signer', angle: 280 },
  { id: 'policy', name: 'Policy Rules Engine', angle: 320 }
];

export default function PresetConstellation({ onSelectModule }) {
  const [activeModule, setActiveModule] = useState('perimeter');
  const radius = 3.2;

  return (
    <group position={[0, -0.5, 0]}>
      {MODULES.map((mod) => {
        const rad = (mod.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const z = Math.sin(rad) * radius;
        const isSelected = activeModule === mod.id;
        const nodeColor = isSelected ? '#00f0ff' : '#4a5568';

        return (
          <group key={mod.id} position={[x, 0, z]}>
            {/* Línea desde el centro a cada módulo */}
            <Line points={[[0, 0, 0], [-x, 0, -z]]} color={nodeColor} lineWidth={isSelected ? 2 : 0.8} opacity={0.5} transparent />

            {/* Nodo 3D Interactivo */}
            <Sphere 
              args={[isSelected ? 0.25 : 0.15, 16, 16]} 
              onClick={() => {
                setActiveModule(mod.id);
                if (onSelectModule) onSelectModule(mod);
              }}
            >
              <meshStandardMaterial 
                color={nodeColor} 
                emissive={nodeColor} 
                emissiveIntensity={isSelected ? 0.8 : 0.2} 
              />
            </Sphere>

            {/* Etiqueta flotante al pasar el ratón o seleccionar */}
            <Html position={[0, 0.4, 0]} center distanceFactor={9}>
              <button 
                onClick={() => {
                  setActiveModule(mod.id);
                  if (onSelectModule) onSelectModule(mod);
                }}
                style={{
                  background: isSelected ? 'rgba(0, 240, 255, 0.2)' : 'rgba(10, 10, 18, 0.7)',
                  border: `1px solid ${nodeColor}`,
                  color: isSelected ? '#00f0ff' : '#a0aec0',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {mod.name}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
