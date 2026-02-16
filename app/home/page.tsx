"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FeatureProps } from "@/types/Feature";
import Image from "next/image";
import { SplashScreen } from "../components/SplashScreen";
import { FiChevronRight, FiArrowRight, FiMenu, FiX } from "react-icons/fi";
import { SiPix } from "react-icons/si";
import { MdSecurity, MdDevices } from "react-icons/md";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const start = window.scrollY;
    const end =
      el.getBoundingClientRect().top + window.scrollY - 80;

    const duration = 500;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      const percent = Math.min(progress / duration, 1);

      const ease =
        percent < 0.5
          ? 2 * percent * percent
          : 1 - Math.pow(-2 * percent + 2, 2) / 2;

      window.scrollTo(0, start + (end - start) * ease);

      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Sobre", href: "#Sobre" },
    { name: "Benefícios", href: "#Beneficios" },
    { name: "Junte-se a nós", href: "#Cadastro" },
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-slate-50 selection:bg-[#CFAA56]/30 scroll-smooth">
      {isLoading && <SplashScreen finishLoading={() => setIsLoading(false)} />}

      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "backdrop-blur-xl bg-[#0A0A0A]/80 py-4 border-b border-white/[0.08]"
          : "bg-transparent py-6 border-b border-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* GROUP: LOGO + NAV LINKS */}
          <div className="flex items-center gap-12">
            {/* LOGO */}
            <div className="hover:opacity-80 transition-opacity cursor-pointer relative z-50 shrink-0">
              <Image src="/Log2.png" alt="Logo" width={48} height={48} priority className="w-auto h-10" />
            </div>

            {/* DESKTOP NAV */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(link.href.substring(1));
                  }}
                  className="hover:text-[#CFAA56] transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#CFAA56] transition-all group-hover:w-full" />
                </button>
              ))}
            </div>
          </div>

          {/* GROUP: ACTIONS (RIGHT SIDE) */}
          <div className="flex items-center gap-4 relative z-50">
            <Link href="/login" className="hidden sm:block px-6 py-2.5 rounded-full font-bold text-sm bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black hover:shadow-[0_0_20px_rgba(207,170,86,0.4)] transition-all active:scale-95">
              Entrar
            </Link>

            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        <div className={`fixed inset-0 bg-[#0A0A0A] z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}>
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-semibold hover:text-[#CFAA56] transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button className="mt-4 px-10 py-4 rounded-full font-bold bg-white text-black">
            Entrar na conta
          </button>
        </div>
      </nav>

      {/* Sobre */}
      <section id="Sobre" className="relative pt-32 pb-32 px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#CFAA56]/10 blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-[#9B7C37]/10 blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block py-1.5 px-4 rounded-full border border-[#CFAA56]/30 bg-[#CFAA56]/5 text-[#CFAA56] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-8">
            Atlas Bank
          </span>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8">
            O banco que entende <br />
            <span className="bg-gradient-to-b from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
              valor de verdade
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed">
            Abra sua conta em minutos e tenha acesso a investimentos exclusivos,
            cartão black e um ecossistema financeiro de alta performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="group w-full sm:w-auto px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black shadow-2xl shadow-[#CFAA56]/20 hover:translate-y-[-2px] transition-all">
              Começar agora
              <FiChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => scrollTo("Beneficios")}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-white border border-white/10 hover:bg-white/5 transition-all"
            >
              Ver benefícios
            </button>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="Beneficios" className="relative max-w-7xl mx-auto px-6 pb-24 scroll-mt-24">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-20" />

        {/* CONTAS */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-gradient-to-b from-[#141414] to-[#0A0A0A] p-10 md:p-16">

          <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#CFAA56]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-[#9B7C37]/10 blur-[120px] rounded-full" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-[#CFAA56]">
              Uma conta que evolui com você
            </h3>

            <p className="text-gray-400 mt-4">
              Comece com tudo para o dia a dia. Quando quiser guardar dinheiro,
              ative a poupança em segundos — direto pelo app.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-14">
            {/* Corrente */}
            <div className="group p-10 rounded-[2rem] bg-[#121212] border border-white/[0.05] hover:border-[#CFAA56]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500">

              <h4 className="text-xl font-bold text-[#CFAA56] mb-4">
                Conta para o dia a dia
              </h4>

              <ul className="space-y-3 text-gray-400">
                <li>✔ Pix e transferências</li>
                <li>✔ Compras e pagamentos</li>
                <li>✔ Receba salário</li>
                <li>✔ Crédito disponível</li>
              </ul>
            </div>

            {/* Poupança */}
            <div className="group p-10 rounded-[2rem] bg-[#121212] border border-white/[0.05] hover:border-[#CFAA56]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500">

              <h4 className="text-xl font-bold text-[#CFAA56] mb-4">
                Conta para guardar
              </h4>

              <ul className="space-y-3 text-gray-400">
                <li>✔ Separe seu dinheiro</li>
                <li>✔ Rendimento automático</li>
                <li>✔ Metas de longo prazo</li>
                <li>✔ Sem burocracia</li>
              </ul>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

          {/* FEATURES */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            <Feature
              icon={<SiPix size={24} />}
              title="Pix Ilimitado"
              desc="Transferências instantâneas sem taxas ocultas e com limites personalizáveis."
            />

            <Feature
              icon={<MdSecurity size={24} />}
              title="Segurança Biométrica"
              desc="Proteção de dados de nível bancário com criptografia de ponta a ponta."
            />

            <Feature
              icon={<MdDevices size={24} />}
              title="Multidispositivo"
              desc="Gerencie seu patrimônio em qualquer dispositivo com sincronização em tempo real."
            />
          </div>

        </div>
      </section>

      {/* Cadastro */}
      <section id="Cadastro" className="max-w-7xl mx-auto px-6 mb-12 scroll-mt-24">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-gradient-to-b from-[#141414] to-[#0A0A0A]">

          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-[#CFAA56]/10 blur-[140px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-[#9B7C37]/10 blur-[140px] rounded-full" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-12 md:p-20">
            <div>
              <span className="text-[#CFAA56] uppercase tracking-[0.25em] text-xs font-bold">
                Abra sua conta
              </span>

              <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
                Comece agora com o <br />
                <span className="bg-gradient-to-b from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
                  Atlas Bank
                </span>
              </h2>

              <p className="text-gray-400 mb-10 max-w-lg text-lg leading-relaxed">
                Crie sua conta gratuitamente e desbloqueie um ecossistema
                financeiro completo — cartão premium, Pix ilimitado e
                controle total do seu patrimônio.
              </p>

              <Link href="/cadastro" className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black shadow-[0_0_40px_rgba(207,170,86,0.35)] hover:translate-y-[-3px] transition-all">
                Criar conta gratuita
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="relative flex justify-center">

              <div className="absolute inset-0 bg-[#CFAA56]/20 blur-[100px] rounded-full" />

              <Image
                src="/CartaoAtlas.png"
                alt="Cartão Atlas"
                width={520}
                height={340}
                className="relative z-10 rotate-[-6deg] hover:rotate-0 hover:scale-105 transition-all duration-500 drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]"/>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

function Feature({ icon, title, desc }: FeatureProps & { desc?: string }) {
  return (
    <div className="group p-10 rounded-[2rem] bg-[#121212] border border-white/[0.03] hover:border-[#CFAA56]/50 hover:bg-[#161616] transition-all duration-500 cursor-default">
      <div className="flex gap-6 items-center mb-6">
        <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#CFAA56]/20 to-[#9B7C37]/5 text-[#CFAA56] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-2xl text-[#CFAA56] font-bold tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-gray-500 leading-relaxed text-sm">
        {desc}
      </p>
    </div>
  );
}