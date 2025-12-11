
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';

const COLORS = [
  '#000000', // Black
  '#0a0a0a', // Rich Black
  '#1a1a1a', // Onyx
  '#333333'  // Dark Gray
];

const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      originalX: number;
      originalY: number;
    }

    const nodes: Node[] = [];
    const numNodes = 400; 

    for (let i = 0; i < numNodes; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      nodes.push({
        x: x,
        y: y,
        originalX: x,
        originalY: y,
        vx: (Math.random() - 0.5) * 0.4, 
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchMove);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      nodes.forEach(node => {
        // Continuous autonomous drift
        node.x += node.vx;
        node.y += node.vy;

        // Wrap around boundaries
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;

        // Interactive effect
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = 250;
        
        let displayX = node.x;
        let displayY = node.y;

        if (distance < influenceRadius) {
          const force = (influenceRadius - distance) / influenceRadius;
          const angle = Math.atan2(dy, dx);
          
          displayX -= Math.cos(angle) * force * 30;
          displayY -= Math.sin(angle) * force * 30;
          
          ctx.globalAlpha = 0.1 + (force * 0.2);
        } else {
          ctx.globalAlpha = 0.08; 
        }

        ctx.beginPath();
        ctx.fillStyle = node.color;
        ctx.arc(displayX, displayY, node.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

export default InteractiveBackground;
