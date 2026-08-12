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

    // Paquetes en el pipeline
    let packets = [
      { x: 100, speed: 0.45, clean: false },
      { x: -140, speed: 0.45, clean: false }
    ];

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const centerY = height / 2;

      // Posicionamiento de los 3 nodos según el diagrama
      const userX = 70;
      const saareX = width * 0.5;
      const iaX = width - 70;

      // Limpieza de lienzo
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // 1. DIBUJAR LÍNEAS DE CONEXIÓN (BUS DE FLUJO)
      // Tramo no seguro (Usuario -> SAARE)
      ctx.beginPath();
      ctx.moveTo(userX + 25, centerY);
      ctx.lineTo(saareX - 35, centerY);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Tramo sanitizado (SAARE -> IA)
      ctx.beginPath();
      ctx.moveTo(saareX + 35, centerY);
      ctx.lineTo(iaX - 25, centerY);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 2. NODO 1: USUARIO (IZQUIERDA)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(userX, centerY - 8, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(userX, centerY + 12, 13, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('USUARIO', userX, centerY + 34);

      // 3. NODO 2: ESCUDO SAARE (CENTRO)
      ctx.save();
      ctx.translate(saareX, centerY);
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(20, -10);
      ctx.lineTo(20, 10);
      ctx.lineTo(0, 24);
      ctx.lineTo(-20, 10);
      ctx.lineTo(-20, -10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SAARE (Filtro L7)', saareX, centerY - 32);

      // 4. NODO 3: MODELO IA / LLM (DERECHA)
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(iaX - 22, centerY - 18, 44, 36);
      ctx.fillStyle = 'rgba(52, 211, 153, 0.05)';
      ctx.fillRect(iaX - 22, centerY - 18, 44, 36);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('IA', iaX, centerY + 4);
      ctx.font = '10px monospace';
      ctx.fillText('LLM Target', iaX, centerY + 34);

      // GENERACIÓN CONTROLADA DE PETICIONES
      if (Math.random() < 0.006 && packets.length < 2) {
        packets.push({ x: userX + 30, speed: 0.45, clean: false });
      }

      // 5. ANIMACIÓN Y SANITIZACIÓN DEL PAYLOAD DEL PROMPT
      packets.forEach((p) => {
        p.x += p.speed;

        // Transición de estado en el Filtro L7
        if (p.x >= saareX) {
          p.clean = true;
        }

        const textColor = p.clean ? '#34d399' : '#f43f5e';
        const labelText = p.clean ? '548...' : 'DNI 548...';

        // Etiqueta del dato viajando sobre el flujo
        ctx.fillStyle = textColor;
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(labelText, p.x, centerY - 10);

        // Núcleo del paquete de tráfico
        ctx.beginPath();
        ctx.arc(p.x, centerY, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = textColor;
        ctx.shadowColor = textColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Filtro de salida al llegar al modelo de IA
      packets = packets.filter((p) => p.x <= iaX - 25);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

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