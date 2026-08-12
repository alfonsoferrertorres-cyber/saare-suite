import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Html, Torus, Ring } from '@react-three/drei';

export default function LicenseHologram({ 
  daysRemaining = 29, 
  totalDays = 30, 
  modulesActive = 9, 
  isValid = true 
}) {
  const outerRingRef = useRef();
  const innerRingRef = useRef();

  // Rotación holográfica opuesta
  useFrame((state, delta) => {
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z += delta * 0.3;
      outerRingRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.6;
    }
  });

  const hologramColor = isValid ? "#00f0ff" : "#ff0055";

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={1.2} position={[0, 2.5, 0]}>
      <group>
        {/* Anillo Holográfico Exterior */}
        <mesh ref={outerRingRef}>
          <torusGeometry args={[1.5, 0.02, 16, 100]} />
          <meshBasicMaterial color={hologramColor} wireframe transparent opacity={0.7} />
        </mesh>

        {/* Anillo de Precisión Interior */}
        <mesh ref={innerRingRef}>
          <ringGeometry args={[1.1, 1.15, 32]} />
          <meshBasicMaterial color={hologramColor} side={2} transparent opacity={0.4} wireframe />
        </mesh>

        {/* Panel Holográfico central (HUD Info) */}
        <Html position={[0, 0, 0]} center distanceFactor={7}>
          <div style={{
            background: 'rgba(10, 10, 18, 0.90)',
            border: `1px solid ${hologramColor}`,
            boxShadow: `0 0 15px ${hologramColor}50`,
            padding: '8px 14px',
            borderRadius: '8px',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '11px',
            textAlign: 'center',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none'
          }}>
            <div style={{ color: hologramColor, fontWeight: 'bold', letterSpacing: '1px' }}>
              SAARE.LIC :: EVALUATION PACK
            </div>
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#8a8d9b' }}>
              STATUS: <span style={{ color: '#00ff88' }}>{isValid ? 'ACTIVE' : 'EXPIRED'}</span> | {modulesActive}/9 MODULES UNLOCKED
            </div>
            <div style={{ marginTop: '2px', fontSize: '10px', color: hologramColor }}>
              TRIAL EXPIRATION: DAY {totalDays - daysRemaining}/{totalDays} [{daysRemaining} DAYS LEFT]
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}