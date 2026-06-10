"use client";

import React, { useEffect, useState } from "react";

interface Heart {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Generate initial hearts
    const initialHearts = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 20 + 10, // 10px to 30px
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 6, // 6s to 12s
      opacity: Math.random() * 0.4 + 0.1, // 0.1 to 0.5 opacity
    }));
    setHearts(initialHearts);

    // Periodically spawn new hearts to replace old ones
    const interval = setInterval(() => {
      setHearts((prevHearts) => {
        // Keep up to 20 hearts active
        const activeHearts = prevHearts.slice(-15);
        return [
          ...activeHearts,
          {
            id: Date.now() + Math.random(),
            left: Math.random() * 100,
            size: Math.random() * 20 + 10,
            delay: 0,
            duration: Math.random() * 6 + 6,
            opacity: Math.random() * 0.4 + 0.1,
          },
        ];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hearts-container">
      {hearts.map((heart) => (
        <svg
          key={heart.id}
          className="absolute bottom-0 text-romantic-300 fill-current pointer-events-none"
          style={{
            left: `${heart.left}%`,
            width: `${heart.size}px`,
            height: `${heart.size}px`,
            opacity: heart.opacity,
            animation: `float ${heart.duration}s linear infinite`,
            animationDelay: `${heart.delay}s`,
            transform: `translateY(100vh)`,
          }}
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}
