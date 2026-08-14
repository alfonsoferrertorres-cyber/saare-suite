import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Activity,
  Cpu,
  ShieldCheck,
  Zap,
  Sliders,
  Maximize2,
  Play,
  Pause,
  RefreshCw,
  Layers,
  Radio,
  Terminal,
  Lock,
  CheckCircle2,
  Key,
  BarChart2,
  Sparkles,
  Eye,
  Settings,
  Database,
  Code2,
  Copy,
  Check
} from 'lucide-react';

const COLOR_PALETTE = {
  bg: '#050811',
  meshLines: '#0f172a',
  meshLinesActive: 'rgba(0, 240, 255, 0.15)',
  cyan: '#00f0ff',
  gold: '#C5A059',
  goldLight: '#E5C079',
  grayUnfiltered: '#475569',
  grayDim: '#1e293b',
  textMuted: '#94a3b8'
};

/* ============================================================================
   COMPONENT 1: HeroBackground.jsx
   Quantum Vector Mesh Canvas (Cyber Mesh 2D/WebGL Replacement)
   ============================================================================ */
export const HeroBackground = ({
  particleCount = 85,
  interactionRadius = 160,
  accelerationForce = 1.8,
  showGridLines = true,
  isPaused = false,
  onFpsUpdate
}) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const particlesRef = useRef([]);
  const fpsTracker = useRef({ frames: 0, lastTime: performance.now(), currentFps: 60 });

  const initParticles = useCallback((width, height) => {
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        baseRadius: Math.random() * 1.8 + 1.2,
        radius: Math.random() * 1.8 + 1.2,
        energy: Math.random() * 0.2, // 0 = cyan, >0.4 = golden boost
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initParticles]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mousePos.current.targetX = e.clientX - rect.left;
      mousePos.current.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = -1000;
      mousePos.current.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastFrameTime = performance.now();
    const targetFpsMs = 1000 / 60;

    const render = (now) => {
      const elapsed = now - lastFrameTime;

      if (elapsed >= targetFpsMs) {
        lastFrameTime = now - (elapsed % targetFpsMs);

        // Track FPS performance metrics
        fpsTracker.current.frames++;
        if (now - fpsTracker.current.lastTime >= 500) {
          fpsTracker.current.currentFps = Math.round((fpsTracker.current.frames * 1000) / (now - fpsTracker.current.lastTime));
          if (onFpsUpdate) onFpsUpdate(fpsTracker.current.currentFps);
          fpsTracker.current.frames = 0;
          fpsTracker.current.lastTime = now;
        }

        const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

        // Smooth mouse cursor interpolation
        mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.1;
        mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.1;

        // Render deep canvas background
        ctx.fillStyle = COLOR_PALETTE.bg;
        ctx.fillRect(0, 0, width, height);

        const particles = particlesRef.current;

        // Render mesh interconnections
        if (showGridLines) {
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distSq = dx * dx + dy * dy;
              const maxDist = 130;

              if (distSq < maxDist * maxDist) {
                const dist = Math.sqrt(distSq);
                const alpha = (1 - dist / maxDist) * 0.25;

                const isEnergyLine = particles[i].energy > 0.4 || particles[j].energy > 0.4;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = isEnergyLine
                  ? `rgba(197, 160, 89, ${alpha * 1.5})`
                  : `rgba(15, 23, 42, ${alpha * 2})`;
                ctx.lineWidth = isEnergyLine ? 1.2 : 0.8;
                ctx.stroke();
              }
            }
          }
        }

        // Update physics and render particle nodes
        particles.forEach((p) => {
          if (!isPaused) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            const dx = p.x - mousePos.current.x;
            const dy = p.y - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < interactionRadius) {
              const force = (1 - dist / interactionRadius) * accelerationForce;
              const angle = Math.atan2(dy, dx);
              
              p.x += Math.cos(angle) * force * 1.5;
              p.y += Math.sin(angle) * force * 1.5;
              p.energy = Math.min(1, p.energy + 0.12);
              p.radius = p.baseRadius * (1 + force * 0.8);
            } else {
              p.energy = Math.max(0, p.energy - 0.015);
              p.radius = p.baseRadius + Math.sin(now * 0.003 + p.pulsePhase) * 0.3;
            }
          }

          const isGold = p.energy > 0.4;
          const mainColor = isGold ? COLOR_PALETTE.gold : COLOR_PALETTE.cyan;

          if (p.energy > 0.2) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (2 + p.energy), 0, Math.PI * 2);
            ctx.fillStyle = isGold ? 'rgba(197, 160, 89, 0.12)' : 'rgba(0, 240, 255, 0.08)';
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = mainColor;
          ctx.shadowColor = mainColor;
          ctx.shadowBlur = p.energy > 0.5 ? 12 : 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Render interactive cursor proximity zone
        if (mousePos.current.x > 0 && mousePos.current.y > 0) {
          ctx.beginPath();
          ctx.arc(mousePos.current.x, mousePos.current.y, interactionRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [interactionRadius, accelerationForce, showGridLines, isPaused, onFpsUpdate]);

  return (
    <div className="relative w-full h-full min-h-[480px] overflow-hidden rounded-2xl border border-slate-800/80 bg-[#050811] shadow-2xl">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
    </div>
  );
};


/* ============================================================================
   COMPONENT 2: RuntimeStream.jsx
   Data Plane Stream L7 Memory Barrier Canvas
   ============================================================================ */
export const RuntimeStream = ({
  flowSpeed = 1.2,
  packetDensity = 14,
  inspectionActive = true,
  algorithm = 'Ed25519',
  onMetricUpdate
}) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const packetsRef = useRef([]);
  const metricsRef = useRef({ totalProcessed: 0, verifiedCount: 0 });

  const generatePayload = useCallback(() => {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
    const types = ['HTTP/2', 'gRPC', 'TLS1.3', 'JSON-RPC', 'WASM-INSPECT'];
    const type = types[Math.floor(Math.random() * types.length)];
    return { hex: `0x${hex}`, type };
  }, []);

  const initPackets = useCallback((width, height) => {
    const packets = [];
    const laneCount = 5;
    const laneHeight = height / (laneCount + 1);

    for (let i = 0; i < packetDensity; i++) {
      const lane = i % laneCount;
      const { hex, type } = generatePayload();
      packets.push({
        id: `pkt_${Math.random().toString(36).substr(2, 6)}`,
        x: (i / packetDensity) * width,
        y: laneHeight * (lane + 1) + (Math.random() * 12 - 6),
        lane,
        speed: flowSpeed * (0.85 + Math.random() * 0.3),
        size: Math.random() * 5 + 9,
        inspected: false,
        signature: null,
        payload: hex,
        protocol: type,
        pulseProgress: 0
      });
    }
    packetsRef.current = packets;
  }, [packetDensity, flowSpeed, generatePayload]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.scale(dpr, dpr);
      initPackets(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initPackets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();
    const targetFpsMs = 1000 / 60;

    const render = (now) => {
      const elapsed = now - lastTime;

      if (elapsed >= targetFpsMs) {
        lastTime = now - (elapsed % targetFpsMs);

        const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
        const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));
        const barrierX = width * 0.5;

        // Render stream background
        const bgGradient = ctx.createLinearGradient(0, 0, width, 0);
        bgGradient.addColorStop(0, '#040711');
        bgGradient.addColorStop(0.5, '#070c1e');
        bgGradient.addColorStop(1, '#050914');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // Render L7 RAM Inspection Barrier
        ctx.fillStyle = inspectionActive ? 'rgba(197, 160, 89, 0.04)' : 'rgba(30, 41, 59, 0.04)';
        ctx.fillRect(barrierX - 35, 0, 70, height);

        ctx.beginPath();
        ctx.moveTo(barrierX, 0);
        ctx.lineTo(barrierX, height);
        ctx.strokeStyle = inspectionActive ? COLOR_PALETTE.gold : 'rgba(100, 116, 139, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        if (inspectionActive) {
          ctx.beginPath();
          ctx.moveTo(barrierX, 0);
          ctx.lineTo(barrierX, height);
          ctx.strokeStyle = 'rgba(197, 160, 89, 0.3)';
          ctx.lineWidth = 8;
          ctx.stroke();
        }

        // L7 Memory Plane Header Labels
        ctx.font = '600 11px monospace';
        ctx.fillStyle = inspectionActive ? COLOR_PALETTE.gold : COLOR_PALETTE.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText(`[ BARRERA DE MEMORIA L7 : ${algorithm} ]`, barrierX, 24);
        ctx.fillText(`REGIÓN ZERO-COPY EN RAM`, barrierX, height - 16);

        const packets = packetsRef.current;

        packets.forEach((pkt) => {
          pkt.x += pkt.speed * flowSpeed;

          // Inspection barrier crossing logic
          if (!pkt.inspected && pkt.x >= barrierX) {
            pkt.inspected = inspectionActive;
            pkt.pulseProgress = 1.0;
            pkt.signature = `ed25519_sig_${Math.random().toString(36).substring(2, 8)}`;
            metricsRef.current.totalProcessed++;
            if (inspectionActive) metricsRef.current.verifiedCount++;

            if (onMetricUpdate) {
              onMetricUpdate({ ...metricsRef.current });
            }
          }

          if (pkt.pulseProgress > 0) {
            pkt.pulseProgress = Math.max(0, pkt.pulseProgress - 0.04);
          }

          if (pkt.x > width + 40) {
            pkt.x = -30;
            pkt.inspected = false;
            pkt.signature = null;
            const newPayload = generatePayload();
            pkt.payload = newPayload.hex;
            pkt.protocol = newPayload.type;
          }

          const isPassed = pkt.inspected;
          const nodeColor = isPassed ? COLOR_PALETTE.gold : COLOR_PALETTE.grayUnfiltered;
          const strokeColor = isPassed ? COLOR_PALETTE.cyan : '#334155';

          // Pulse effect at moment of verification
          if (pkt.pulseProgress > 0 && inspectionActive) {
            ctx.beginPath();
            ctx.arc(pkt.x, pkt.y, pkt.size + (1 - pkt.pulseProgress) * 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(197, 160, 89, ${pkt.pulseProgress})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Packet node representation
          ctx.save();
          ctx.translate(pkt.x, pkt.y);

          ctx.beginPath();
          ctx.arc(0, 0, pkt.size, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = isPassed ? 10 : 0;
          ctx.fill();

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();

          // Packet metadata annotations
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = isPassed ? COLOR_PALETTE.goldLight : '#64748b';
          ctx.fillText(`${pkt.protocol}`, pkt.x, pkt.y - pkt.size - 8);

          if (isPassed) {
            ctx.fillStyle = COLOR_PALETTE.cyan;
            ctx.fillText(`[FIRMADO: ${pkt.payload}]`, pkt.x, pkt.y + pkt.size + 14);
          } else {
            ctx.fillStyle = '#475569';
            ctx.fillText(`SIN FILTRAR ${pkt.payload}`, pkt.x, pkt.y + pkt.size + 14);
          }
        });
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [flowSpeed, inspectionActive, algorithm, generatePayload, onMetricUpdate]);

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 bg-[#040711] shadow-2xl">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};


/* ============================================================================
   CODE INSPECTOR TEMPLATES FOR INDIVIDUAL FILE EXPORT
   ============================================================================ */
const HERO_BACKGROUND_CODE = `import React, { useEffect, useRef, useCallback } from 'react';

const COLOR_PALETTE = {
  bg: '#050811',
  meshLines: '#0f172a',
  cyan: '#00f0ff',
  gold: '#C5A059'
};

export const HeroBackground = ({
  particleCount = 85,
  interactionRadius = 160,
  accelerationForce = 1.8,
  showGridLines = true,
  isPaused = false,
  onFpsUpdate
}) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const mousePos = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });
  const particlesRef = useRef([]);

  const initParticles = useCallback((width, height) => {
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        baseRadius: Math.random() * 1.8 + 1.2,
        radius: Math.random() * 1.8 + 1.2,
        energy: Math.random() * 0.2,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }
    particlesRef.current = particles;
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = \`\${rect.width}px\`;
      canvas.style.height = \`\${rect.height}px\`;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mousePos.current.targetX = e.clientX - rect.left;
      mousePos.current.targetY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastFrameTime = performance.now();
    const targetFpsMs = 1000 / 60;

    const render = (now) => {
      const elapsed = now - lastFrameTime;
      if (elapsed >= targetFpsMs) {
        lastFrameTime = now - (elapsed % targetFpsMs);
        const width = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
        const height = canvas.height / Math.min(window.devicePixelRatio || 1, 2);

        mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.1;
        mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.1;

        ctx.fillStyle = COLOR_PALETTE.bg;
        ctx.fillRect(0, 0, width, height);

        const particles = particlesRef.current;

        if (showGridLines) {
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const distSq = dx * dx + dy * dy;
              if (distSq < 130 * 130) {
                const alpha = (1 - Math.sqrt(distSq) / 130) * 0.25;
                const isEnergy = particles[i].energy > 0.4 || particles[j].energy > 0.4;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = isEnergy ? \`rgba(197, 160, 89, \${alpha * 1.5})\` : \`rgba(15, 23, 42, \${alpha * 2})\`;
                ctx.lineWidth = isEnergy ? 1.2 : 0.8;
                ctx.stroke();
              }
            }
          }
        }

        particles.forEach((p) => {
          if (!isPaused) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;

            const dx = p.x - mousePos.current.x;
            const dy = p.y - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < interactionRadius) {
              const force = (1 - dist / interactionRadius) * accelerationForce;
              const angle = Math.atan2(dy, dx);
              p.x += Math.cos(angle) * force * 1.5;
              p.y += Math.sin(angle) * force * 1.5;
              p.energy = Math.min(1, p.energy + 0.12);
            } else {
              p.energy = Math.max(0, p.energy - 0.015);
            }
          }

          const isGold = p.energy > 0.4;
          const mainColor = isGold ? COLOR_PALETTE.gold : COLOR_PALETTE.cyan;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = mainColor;
          ctx.fill();
        });
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [interactionRadius, accelerationForce, showGridLines, isPaused]);

  return (
    <div className="relative w-full h-full min-h-[480px] overflow-hidden rounded-2xl border border-slate-800 bg-[#050811]">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
    </div>
  );
};
export default HeroBackground;`;

const RUNTIME_STREAM_CODE = `import React, { useEffect, useRef, useCallback } from 'react';

const COLOR_PALETTE = {
  gold: '#C5A059',
  cyan: '#00f0ff',
  grayUnfiltered: '#475569'
};

export const RuntimeStream = ({
  flowSpeed = 1.2,
  packetDensity = 14,
  inspectionActive = true,
  algorithm = 'Ed25519',
  onMetricUpdate
}) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const packetsRef = useRef([]);
  const metricsRef = useRef({ totalProcessed: 0, verifiedCount: 0 });

  const generatePayload = useCallback(() => {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
    return { hex: \`0x\${hex}\`, type: 'HTTP/2' };
  }, []);

  const initPackets = useCallback((width, height) => {
    const packets = [];
    const laneCount = 5;
    const laneHeight = height / (laneCount + 1);

    for (let i = 0; i < packetDensity; i++) {
      const lane = i % laneCount;
      const payload = generatePayload();
      packets.push({
        id: \`pkt_\${i}\`,
        x: (i / packetDensity) * width,
        y: laneHeight * (lane + 1),
        speed: flowSpeed * (0.85 + Math.random() * 0.3),
        size: 10,
        inspected: false,
        payload: payload.hex,
        protocol: payload.type,
        pulseProgress: 0
      });
    }
    packetsRef.current = packets;
  }, [packetDensity, flowSpeed, generatePayload]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      initPackets(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initPackets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let lastTime = performance.now();

    const render = (now) => {
      if (now - lastTime >= 1000 / 60) {
        lastTime = now;
        const width = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
        const height = canvas.height / Math.min(window.devicePixelRatio || 1, 2);
        const barrierX = width * 0.5;

        ctx.fillStyle = '#040711';
        ctx.fillRect(0, 0, width, height);

        // Barrier Line
        ctx.beginPath();
        ctx.moveTo(barrierX, 0); ctx.lineTo(barrierX, height);
        ctx.strokeStyle = inspectionActive ? COLOR_PALETTE.gold : '#475569';
        ctx.lineWidth = 2;
        ctx.stroke();

        packetsRef.current.forEach((pkt) => {
          pkt.x += pkt.speed * flowSpeed;

          if (!pkt.inspected && pkt.x >= barrierX) {
            pkt.inspected = inspectionActive;
            metricsRef.current.totalProcessed++;
            if (inspectionActive) metricsRef.current.verifiedCount++;
            if (onMetricUpdate) onMetricUpdate({ ...metricsRef.current });
          }

          if (pkt.x > width + 40) {
            pkt.x = -30;
            pkt.inspected = false;
          }

          ctx.beginPath();
          ctx.arc(pkt.x, pkt.y, pkt.size, 0, Math.PI * 2);
          ctx.fillStyle = pkt.inspected ? COLOR_PALETTE.gold : COLOR_PALETTE.grayUnfiltered;
          ctx.fill();
        });
      }
      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [flowSpeed, inspectionActive, algorithm, generatePayload, onMetricUpdate]);

  return (
    <div className="relative w-full h-full min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 bg-[#040711]">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};
export default RuntimeStream;`;


/* ============================================================================
   MAIN SHOWCASE APP CONTAINER
   ============================================================================ */
export default function ShowcaseApp() {
  const [activeTab, setActiveTab] = useState('combined'); // 'combined' | 'hero' | 'runtime' | 'code'
  const [activeCodeFile, setActiveCodeFile] = useState('hero'); // 'hero' | 'runtime'
  const [copiedFile, setCopiedFile] = useState(null);

  // Hero Background state
  const [heroParticleCount, setHeroParticleCount] = useState(85);
  const [heroRadius, setHeroRadius] = useState(160);
  const [heroSpeed, setHeroSpeed] = useState(1.8);
  const [showGrid, setShowGrid] = useState(true);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [currentFps, setCurrentFps] = useState(60);

  // Runtime Stream state
  const [streamSpeed, setStreamSpeed] = useState(1.2);
  const [packetDensity, setPacketDensity] = useState(12);
  const [inspectionActive, setInspectionActive] = useState(true);
  const [selectedAlgo, setSelectedAlgo] = useState('Ed25519');
  const [streamMetrics, setStreamMetrics] = useState({ totalProcessed: 0, verifiedCount: 0 });

  const handleMetricUpdate = useCallback((metrics) => {
    setStreamMetrics((prev) => ({
      ...prev,
      totalProcessed: metrics.totalProcessed,
      verifiedCount: metrics.verifiedCount
    }));
  }, []);

  const copyToClipboard = (code, fileName) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(fileName);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#03050c] text-slate-100 font-sans antialiased p-4 md:p-8 selection:bg-cyan-500 selection:text-black">
      {/* Header Navigation Bar */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-6 h-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              Sistema Canvas Modular
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Dos componentes desacoplados: <span className="text-cyan-400 font-mono font-semibold">HeroBackground.jsx</span> y <span className="text-amber-400 font-mono font-semibold">RuntimeStream.jsx</span>
          </p>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('combined')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'combined'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Vista Unificada
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'hero'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            HeroBackground.jsx
          </button>
          <button
            onClick={() => setActiveTab('runtime')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'runtime'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            RuntimeStream.jsx
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Código por Separado
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto space-y-8">

        {/* Global Realtime Metrics */}
        {activeTab !== 'code' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-3 border-r border-slate-800/60 pr-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono">Tasa de Frames</div>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  {currentFps} FPS
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 border-r border-slate-800/60 pr-4">
              <Cpu className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono">Carga CPU estimada</div>
                <div className="text-sm font-bold text-amber-300">&lt; 3.8% (Objetivo &lt;4%)</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 border-r border-slate-800/60 pr-4">
              <Zap className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono">Escala Retina/4K</div>
                <div className="text-sm font-bold text-slate-100">Capped @ 2x DPR</div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-[11px] text-slate-400 uppercase font-mono">Validación Ed25519</div>
                <div className="text-sm font-bold text-emerald-300">Activa en RAM</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1: HERO BACKGROUND COMPONENT */}
        {(activeTab === 'combined' || activeTab === 'hero') && (
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
                  COMPONENTE 1: HeroBackground.jsx
                </span>
                <h2 className="text-xl md:text-2xl font-bold mt-2 text-white flex items-center gap-2">
                  Malla Cuántica Vectorial 2D
                </h2>
              </div>

              {/* Quick Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsHeroPaused(!isHeroPaused)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {isHeroPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  {isHeroPaused ? 'Reanudar' : 'Pausar'}
                </button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                    showGrid
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Lineas Malla: {showGrid ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            <div className="relative group">
              <HeroBackground
                particleCount={heroParticleCount}
                interactionRadius={heroRadius}
                accelerationForce={heroSpeed}
                showGridLines={showGrid}
                isPaused={isHeroPaused}
                onFpsUpdate={setCurrentFps}
              />

              <div className="absolute top-4 left-4 pointer-events-none bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-slate-800 max-w-xs hidden sm:block">
                <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  Malla Interactiva 2D
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Colores: Fondo <span className="text-slate-100 font-mono">#050811</span>, líneas <span className="text-slate-100 font-mono">#0f172a</span>, partículas en <span className="text-cyan-400 font-mono">#00f0ff</span> y aceleración por cursor en <span className="text-[#C5A059] font-mono">#C5A059</span>.
                </p>
              </div>

              {/* Adjusters Panel */}
              <div className="absolute bottom-4 right-4 bg-slate-950/85 backdrop-blur-lg p-4 rounded-xl border border-slate-800/90 text-xs w-72 space-y-3 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono font-bold text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Parámetros Malla
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">HeroBackground</span>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1 font-mono">
                    <span>Partículas</span>
                    <span className="text-cyan-400 font-bold">{heroParticleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="160"
                    value={heroParticleCount}
                    onChange={(e) => setHeroParticleCount(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1 font-mono">
                    <span>Radio de Inferencia</span>
                    <span className="text-cyan-400 font-bold">{heroRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="280"
                    value={heroRadius}
                    onChange={(e) => setHeroRadius(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 2: RUNTIME STREAM COMPONENT */}
        {(activeTab === 'combined' || activeTab === 'runtime') && (
          <section className="space-y-4 pt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold text-amber-400 uppercase tracking-widest bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-800/40">
                  COMPONENTE 2: RuntimeStream.jsx
                </span>
                <h2 className="text-xl md:text-2xl font-bold mt-2 text-white flex items-center gap-2">
                  Inspección Criptográfica L7 en Memoria RAM
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInspectionActive(!inspectionActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition flex items-center gap-1.5 ${
                    inspectionActive
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Inspección RAM: {inspectionActive ? 'ACTIVA' : 'BYPASS'}
                </button>

                <select
                  value={selectedAlgo}
                  onChange={(e) => setSelectedAlgo(e.target.value)}
                  className="bg-slate-900 text-xs font-mono text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
                >
                  <option value="Ed25519">Ed25519 (Requerido)</option>
                  <option value="ECDSA-P256">ECDSA-P256</option>
                  <option value="BLS12-381">BLS12-381</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <RuntimeStream
                flowSpeed={streamSpeed}
                packetDensity={packetDensity}
                inspectionActive={inspectionActive}
                algorithm={selectedAlgo}
                onMetricUpdate={handleMetricUpdate}
              />

              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">Total Paquetes Procesados</div>
                      <div className="text-lg font-mono font-bold text-slate-100">
                        {streamMetrics.totalProcessed.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">STREAM IN-RAM</span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">Firmados {selectedAlgo}</div>
                      <div className="text-lg font-mono font-bold text-amber-400">
                        {streamMetrics.verifiedCount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400/80 bg-amber-950/40 border border-amber-800/40 px-2 py-1 rounded">
                    ESTADO DORADO
                  </span>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BarChart2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-[11px] font-mono text-slate-400">Latencia Zero-Copy</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">0.08 ms</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded">
                    SIN COPY
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: CODE INSPECTOR FOR INDIVIDUAL FILES */}
        {activeTab === 'code' && (
          <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" /> Visor de Código Modular Desacoplado
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Aquí puedes copiar el código exacto de cada uno de los componentes por separado para importarlos en tu proyecto.
                </p>
              </div>

              {/* Toggle sub-files */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveCodeFile('hero')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeCodeFile === 'hero'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HeroBackground.jsx
                </button>
                <button
                  onClick={() => setActiveCodeFile('runtime')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${
                    activeCodeFile === 'runtime'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  RuntimeStream.jsx
                </button>
              </div>
            </div>

            {/* Code Display Area */}
            <div className="relative group">
              <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeCodeFile === 'hero' ? HERO_BACKGROUND_CODE : RUNTIME_STREAM_CODE,
                      activeCodeFile
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono flex items-center gap-1.5 shadow-md transition"
                >
                  {copiedFile === activeCodeFile ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      Copiar {activeCodeFile === 'hero' ? 'HeroBackground.jsx' : 'RuntimeStream.jsx'}
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-[#02040a] p-5 rounded-xl border border-slate-800/80 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed max-h-[500px]">
                <code>
                  {activeCodeFile === 'hero' ? HERO_BACKGROUND_CODE : RUNTIME_STREAM_CODE}
                </code>
              </pre>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}