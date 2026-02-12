"use client";
import React, { useEffect } from "react";
import "./SplashScreen.css";

interface SplashScreenProps {
  finishLoading: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ finishLoading }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      finishLoading();
    }, 2800); // tempo total da animação

    return () => clearTimeout(timer);
  }, [finishLoading]);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <img
          src="/Log.png"
          alt="AB Bank Logo"
          className="splash-logo"
        />

        <div className="loading-bar-container">
          <div className="loading-bar" />
        </div>
      </div>
    </div>
  );
};
