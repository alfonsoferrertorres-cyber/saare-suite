import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, Sphere } from '@react-three/drei';

export default function NetworkNodes({ activeFlow = true }) {
  const particle1 = useRef();
  const particle2 = useRef();

  // AnimaciÃ³n en tiempo real de los paquetes de datos viajando por la red
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * 2.5;
    
    // PartÃ­cula 1: App Localhost -> SAARE Gateway (-4 a 0)
    if (particle1.current) {
      const progress1 = (t % 2) / 2;
      particle1.current.position.x = -4 + progress1 * 4;
    }

    // PartÃ­cula 2: SAARE Gateway -> Proveedor LLM (0 a 4)
    if (particle2.current) {
      const progress2 = ((t + 1) % 2) / 2;
      particle2.current.position.x = 0 + progress2 * 4;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* LÃ­neas LÃ¡ser de TrÃ¡fico de Red */}
      <Line points={[[-4, 0, 0], [0, 0, 0]]} color="#00f0ff" lineWidth={2} />
      <Line points={[[0, 0, 0], [4, 0, 0]]} color="#00ff88" lineWidth={2} />

      {/* PartÃ­culas de Prompts en TrÃ¡nsito */}
      {activeFlow && (
        <>
          <mesh ref={particle1} position={[-4, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
          <mesh ref={particle2} position={[0, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
        </>
      )}

      {/* NODO 1: AplicaciÃ³n Local (Cliente ISV) */}
      <group position={[-4, 0, 0]}>
        <Sphere args={[0.4, 32, 32]}>
          <meshStandardMaterial color="#00f0ff" wireframe />
        </Sphere>
        <Html position={[0, 0.8, 0]} center distanceFactor={8}>
          <div style={nodeLabelStyle('#00f0ff')}>LOCAL APP (Port 3000)</div>
        </Html>
      </group>

      {/* NODO 2: SAARE PerimeterShield (NÃºcleo Central) */}
      <group position={[0, 0, 0]}>
        <Sphere args={[0.6, 32, 32]}>
          <meshStandardMaterial 
            color="#00f0ff" 
            emissive="#00f0ff" 
            emissiveIntensity={0.5} 
            wireframe 
          />
        </Sphere>
        <Html position={[0, 1.1, 0]} center distanceFactor={8}>
          <div style={nodeLabelStyle('#00f0ff', true)}>SAARE L7 PROXY (:3001)</div>
        </Html>
      </group>

      {/* NODO 3: Proveedor de IA / LLM Endpoint */}
      <group position={[4, 0, 0]}>
        <Sphere args={[0.4, 32, 32]}>
          <meshStandardMaterial color="#00ff88" wireframe />
        </Sphere>
        <Html position={[0, 0.8, 0]} center distanceFactor={8}>
          <div style={nodeLabelStyle('#00ff88')}>LLM API (External)</div>
        </Html>
      </group>
    </group>
  );
}

const nodeLabelStyle = (color, glow = false) => ({
  background: 'rgba(10, 10, 18, 0.9)',
  border: `1px solid ${color}`,
  boxShadow: glow ? `0 0 10px ${color}80` : 'none',
  padding: '4px 8px',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: 'monospace',
  fontSize: '10px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none'
});

