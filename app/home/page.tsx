"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { SplashScreen } from '../components/SplashScreen'; // Caminho corrigido

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    // O GRADIENTE FICA AQUI (NO FUNDO DO SITE)
    // Ele fica fixo e visível o tempo todo. A Splash Screen apenas o cobre.
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#9B7C37] via-[#CFAA56] to-[#F2D892]">
      
      {/* A Splash Screen (Cobre tudo enquanto isLoading for true) */}
      {isLoading && (
        <SplashScreen finishLoading={() => setIsLoading(false)} />
      )}

      {/* Conteúdo do Site (Logo, Textos, etc) */}
      {/* Adicionei uma transição aqui também para o conteúdo surgir suavemente */}
      <div 
        className={`transition-all duration-1000 ease-in-out transform ${
          isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
          <Image 
              src="/Log.png" 
              alt="Logo do sistema"
              width={500}
              height={300}
              className="rounded-lg shadow-2xl" // Aumentei a sombra para destaque
              priority 
          />
      </div>

    </main>
  );
}