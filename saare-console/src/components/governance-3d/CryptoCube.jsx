import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial, Html } from '@react-three/drei';

export default function CryptoCube({ 
  isVerified = true, 
  hash = "ed25519:7f8a...9c21", 
  latency = "<1.16ms" 
}) {
  const outerMesh = useRef(null);
  const innerMesh = useRef(null);

  // Animación de rotación asíncrona para núcleo y coraza externa
  useFrame((state, delta) => {
    if (outerMesh.current) {
      outerMesh.current.rotation.x += delta * 0.4;
      outerMesh.current.rotation.y += delta * 0.6;
    }
    if (innerMesh.current) {
      innerMesh.current.rotation.x -= delta * 0.8;
      innerMesh.current.rotation.y -= delta * 0.5;
    }
  });

  const activeColor = isVerified ? "#00f0ff" : "#ff0055";

  return (
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.8}>
      <group>
        {/* Coraza Externa - Wireframe de Protección (PerimeterShield) */}
        <mesh ref={outerMesh}>
          <boxGeometry args={[2.2, 2.2, 2.2]} />
          <MeshWobbleMaterial 
            color={activeColor} 
            wireframe 
            factor={isVerified ? 0.15 : 0.6} 
            speed={isVerified ? 1.5 : 5} 
          />
        </mesh>

        {/* Núcleo Criptográfico Interno (EvidenceVault Ed25519) */}
        <mesh ref={innerMesh}>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial 
            color={activeColor} 
            roughness={0.2} 
            metalness={0.9} 
            emissive={activeColor} 
            emissiveIntensity={0.6} 
          />
        </mesh>

        {/* HUD Holográfico de Evidencia (Overlay HTML 3D) */}
        <Html position={[0, -1.8, 0]} center distanceFactor={8}>
          <div style={{
            background: 'rgba(10, 10, 18, 0.85)',
            border: `1px solid ${activeColor}`,
            boxShadow: `0 0 12px ${activeColor}40`,
            padding: '6px 12px',
            borderRadius: '6px',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none'
          }}>
            <div style={{ color: activeColor, fontWeight: 'bold', fontSize: '12px' }}>
              {isVerified ? 'VERIFIED BLOCK' : 'TAMPER DETECTED'}
            </div>
            <div>SIG: {hash}</div>
            <div>LATENCY: <span style={{ color: '#00ff88' }}>{latency}</span></div>
          </div>
        </Html>
      </group>
    </Float>
  );
}
