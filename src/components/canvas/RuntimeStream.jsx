import React, { useEffect, useRef } from 'react';

export const RuntimeStream = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    let packets = [];
    const barrierXPercent = 0.5;
    let packetIdCounter = 0;

    for (let i = 0; i < 15; i++) {
      packets.push({
        id: packetIdCounter++,
        x: Math.random() * canvas.clientWidth,
        y: 40 + Math.random() * (canvas.clientHeight - 80),
        speed: 1.2 + Math.random() * 1.5,
        signed: false,
        signature: null
      });
    }

    let lastTime = performance.now();
    const fps = 60;
    const interval = 1000 / fps;

    const render = (currentTime) => {
      animationFrameId = requestAnimationFrame(render);
      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const barrierX = width * barrierXPercent;

      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#C5A059';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(barrierX, 0);
      ctx.lineTo(barrierX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#C5A059';
      ctx.font = '10px monospace';
      ctx.fillText('L7 RAM INSPECTION BARRIER [Ed25519]', barrierX + 10, 20);

      if (Math.random() < 0.05 && packets.length < 25) {
        packets.push({
          id: packetIdCounter++,
          x: -20,
          y: 40 + Math.random() * (height - 80),
          speed: 1.2 + Math.random() * 1.5,
          signed: false,
          signature: null
        });
      }

      packets.forEach((p) => {
        p.x += p.speed;

        if (p.x >= barrierX && !p.signed) {
          p.signed = true;
          p.signature = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.signed ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.signed ? '#C5A059' : '#475569';
        ctx.shadowColor = p.signed ? '#C5A059' : 'transparent';
        ctx.shadowBlur = p.signed ? 8 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (p.signed) {
          ctx.fillStyle = 'rgba(197, 160, 89, 0.75)';
          ctx.font = '9px monospace';
          ctx.fillText(`Ed25519:#${p.signature}`, p.x - 20, p.y + 16);
        }
      });

      // Limpieza segura fuera de loop
      packets = packets.filter((p) => p.x <= width + 50);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
    />
  );
};

export default RuntimeStream;