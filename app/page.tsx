"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FloatingHearts from "../components/FloatingHearts";
import { triggerYesConfetti } from "../components/ConfettiEffect";

export default function Home() {
  const router = useRouter();
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Pre-load audio or handle interaction effects
  const playHeartPop = () => {
    // We can use Web Audio API to play a cute synthesized pop sound!
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context block/fail safe
    }
  };

  const moveNoButton = () => {
    // Generate coordinate within viewport bounds, avoiding edges (10% to 80%)
    const randomX = Math.floor(Math.random() * 70) + 10;
    const randomY = Math.floor(Math.random() * 70) + 10;
    
    setNoPos({ x: randomX, y: randomY });
    setHasMoved(true);
    playHeartPop();
  };

  const handleYes = () => {
    triggerYesConfetti();
    setIsRedirecting(true);
    playHeartPop();
    
    // Smooth transition to date selection page
    setTimeout(() => {
      router.push("/date-selection");
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden select-none bg-gradient-to-tr from-rose-100 via-pink-50 to-amber-50">
      {/* Background decoration elements */}
      <FloatingHearts />
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      {/* Main glassmorphism card */}
      <div className="glass rounded-3xl p-6 md:p-8 max-w-md w-full text-center relative z-10 flex flex-col items-center shadow-xl border border-white/40">
        
        {/* Cute letter envelope badge */}
        <div className="bg-rose-50 text-rose-500 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 flex items-center gap-1.5 shadow-sm border border-rose-100">
          <span>💌</span> Dating?
        </div>

        {/* Header Title with serif font */}
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-800 tracking-tight leading-tight mb-2">
          Gửi cậu 💕
        </h1>
        
        {/* Subtitle */}
        <p className="text-slate-500 text-sm md:text-[14px] font-medium max-w-sm mb-6">
          Sao chung mình không thử đi chơi cùng nhau nhỉ? Tớ có một vài ý tưởng hẹn hò siêu dễ thương đang chờ cậu khám phá đấy!
        </p>

        {/* Cute Bear Image */}
        {/* <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden shadow-inner mb-6 border border-white/20">
          <Image
            src="/images/romantic_bear.png"
            alt="Romantic Confession Illustration"
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            priority
          />
        </div> */}

        {/* Confession Question */}
        <h2 className="text-xl md:text-2xl font-bold text-rose-600 font-sans tracking-wide leading-snug px-2 mb-8">
          {isRedirecting 
            ? "Cậu đồng ý rồi! Đợi tí nhé... 🥰" 
            : "Đi chơi nhé? 🥰"}
        </h2>

        {/* Action Buttons */}
        <div className="flex flex-row items-center justify-center gap-5 mt-2 w-full min-h-[50px] relative">
          {!isRedirecting && (
            <>
              {/* YES BUTTON */}
              <button
                type="button"
                onClick={handleYes}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-rose-200 transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse-slow flex items-center gap-2 cursor-pointer z-10"
              >
                <span>Ok nhé! 💖</span>
              </button>

              {/* NO BUTTON */}
              <button
                type="button"
                onMouseEnter={moveNoButton}
                onClick={moveNoButton}
                onTouchStart={(e) => {
                  e.preventDefault();
                  moveNoButton();
                }}
                style={
                  hasMoved
                    ? {
                        position: "fixed",
                        left: `${noPos.x}vw`,
                        top: `${noPos.y}vh`,
                        transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        zIndex: 50,
                      }
                    : { zIndex: 10 }
                }
                className="border-2 border-slate-300 text-slate-500 bg-white/70 hover:bg-slate-100/90 font-semibold py-3 px-8 rounded-full transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Không đi đâu 🥺
              </button>
            </>
          )}

          {isRedirecting && (
            <div className="flex flex-col items-center gap-2 text-rose-500 font-semibold animate-pulse">
              <span>Đang mở quà bí mật cho cậu... 🎁</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-bounce" style={{ animationDelay: "0.4s" }}></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
