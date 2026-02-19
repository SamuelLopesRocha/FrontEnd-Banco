/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  finishLoading: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ finishLoading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let value = 0;

    const interval = setInterval(() => {
      value += Math.random() * 12; 

      if (value >= 100) {
        value = 100;
        clearInterval(interval);
        setTimeout(() => finishLoading(), 300);
      }

      setProgress(value);
    }, 70);

    return () => clearInterval(interval);
  }, [finishLoading]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030303] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(207,170,86,0.35)_0%,rgba(207,170,86,0.15)_25%,rgba(3,3,3,1)_70%)]"/>
      <div className="absolute w-[600px] h-[600px] bg-[#CFAA56]/20 blur-[180px] rounded-full" />

      <div className="relative flex flex-col items-center">
        <img
          src="/AtlasLogo.svg"
          alt="Atlas Bank Logo"
          className="w-[260px] mb-8 opacity-0 animate-[fadeIn_1.2s_forwards]"
        />

        <div className="w-56 h-[10px] rounded-full bg-white/5 overflow-hidden border border-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#9B7C37] via-[#F4E3B2] to-[#CFAA56] shadow-[0_0_18px_rgba(207,170,86,0.8)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="mt-3 text-[11px] tracking-[0.25em] uppercase font-bold text-[#F4E3B2]">
          Carregando {Math.floor(progress)}%
        </span>

      </div>
    </div>
  );
};
