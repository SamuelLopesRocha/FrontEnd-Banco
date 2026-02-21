"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { FeatureProps } from "@/types/Feature";
import Image from "next/image";
import { SplashScreen } from "../components/SplashScreen";
import { FiChevronRight, FiArrowRight, FiMenu, FiX, FiLogOut } from "react-icons/fi";
import { SiPix } from "react-icons/si";
import { MdSecurity, MdDevices } from "react-icons/md";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [usuario, setUsuario] = useState<any>(null); // Estado para guardar os dados do banco

  // ==========================================
  // 1. VERIFICAÇÃO DE LOGIN E BUSCA DE DADOS
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");

    // Se não tiver token, manda pro login na hora
    if (!token) {
      router.push("/login");
      return;
    }

    // Se tiver token, busca os dados no Back-End
    async function carregarDados() {
      try {
        const response = await fetch("http://localhost:8000/meus-dados", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Sessão inválida ou expirada.");
        }

        const data = await response.json();
        setUsuario(data); // Salva os dados do usuário logado
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    carregarDados();
  }, [router]);

  // ==========================================
  // 2. FUNÇÃO DE LOGOUT
  // ==========================================
  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  // Efeitos visuais de scroll
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const start = window.scrollY;
    const end = el.getBoundingClientRect().top + window.scrollY - 80;
    const duration = 500;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      const percent = Math.min(progress / duration, 1);
      const ease = percent < 0.5 ? 2 * percent * percent : 1 - Math.pow(-2 * percent + 2, 2) / 2;
      window.scrollTo(0, start + (end - start) * ease);
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isMenuOpen]);

  // Links ajustados para um usuário que JÁ ESTÁ logado
  const navLinks = [
    { name: "Meu Painel", href: "#Sobre" },
    { name: "Meus Benefícios", href: "#Beneficios" },
    { name: "Cartão", href: "#Cadastro" },
  ];

  // Mostra a tela de loading enquanto não tivermos os dados do usuário
  if (isLoading || !usuario) {
    return <SplashScreen finishLoading={() => {}} />;
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-slate-50 selection:bg-[#CFAA56]/30 scroll-smooth">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur-xl bg-[#0A0A0A]/80 py-4 border-b border-white/[0.08]" : "bg-transparent py-6 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="hover:opacity-80 transition-opacity cursor-pointer relative z-50 shrink-0">
              <Image src="/AtlasLogo.svg" alt="Logo" width={64} height={64} priority className="w-auto h-10" />
            </div>

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

          <div className="flex items-center gap-4 relative z-50">
            {/* Botão de Sair (Substituiu o de Entrar) */}
            <button 
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-[#CFAA56] transition-all active:scale-95"
            >
              <FiLogOut /> Sair
            </button>

            <button
              className="md:hidden p-2 text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-[#0A0A0A] z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 md:hidden
            ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
           `}
      >
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            onClick={() => {
              setIsMenuOpen(false);
              scrollTo(link.href.substring(1));
            }}
            className="text-2xl font-semibold hover:text-[#CFAA56] transition-colors"
          >
            {link.name}
          </a>
        ))}
        <button
          onClick={handleLogout}
          className="mt-4 px-10 py-4 rounded-full font-bold bg-white text-black flex items-center gap-2"
        >
          <FiLogOut /> Sair da conta
        </button>
      </div>

      {/* HERO SECTION COM DADOS DINÂMICOS */}
      <section id="Sobre" className="relative pt-32 pb-32 px-6 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#CFAA56]/10 blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-[#9B7C37]/10 blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block py-1.5 px-4 rounded-full border border-[#CFAA56]/30 bg-[#CFAA56]/5 text-[#CFAA56] text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-8">
            Painel do Cliente
          </span>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8">
            Bem-vindo de volta, <br />
            <span className="bg-gradient-to-b from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
              {usuario.nome_completo.split(" ")[0]} {/* Exibe o primeiro nome dinamicamente */}
            </span>
          </h1>

          <p className="text-gray-400 max-w-2xl mx-auto mb-12 text-lg md:text-xl leading-relaxed">
            Sua conta está <strong className="text-green-500">{usuario.status_conta}</strong>. 
            Aqui você gerencia seu patrimônio, cartões e investimentos exclusivos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => scrollTo("Beneficios")} className="group w-full sm:w-auto px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black shadow-2xl shadow-[#CFAA56]/20 hover:translate-y-[-2px] transition-all">
              Ver Meus Benefícios
              <FiChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="Beneficios" className="relative max-w-7xl mx-auto px-6 pb-24 scroll-mt-24">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-20" />

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-gradient-to-b from-[#141414] to-[#0A0A0A] p-10 md:p-16">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#CFAA56]/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-40px] right-[-40px] w-80 h-80 bg-[#9B7C37]/10 blur-[120px] rounded-full" />

          <div className="relative z-10 text-center max-w-3xl mx-auto mb-14">
            <h3 className="text-2xl md:text-3xl font-bold text-[#CFAA56]">
              Seus Benefícios Ativos
            </h3>
            <p className="text-gray-400 mt-4">
              Aproveite tudo o que a sua conta tem a oferecer para a região de {usuario.cidade} - {usuario.estado}.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-14">
            <div className="group p-10 rounded-[2rem] bg-[#121212] border border-white/[0.05] hover:border-[#CFAA56]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500">
              <h4 className="text-xl font-bold text-[#CFAA56] mb-4">Conta para o dia a dia</h4>
              <ul className="space-y-3 text-gray-400">
                <li>✔ Pix e transferências</li>
                <li>✔ Compras e pagamentos</li>
                <li>✔ Receba salário</li>
                <li>✔ Crédito disponível</li>
              </ul>
            </div>

            <div className="group p-10 rounded-[2rem] bg-[#121212] border border-white/[0.05] hover:border-[#CFAA56]/50 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500">
              <h4 className="text-xl font-bold text-[#CFAA56] mb-4">Conta para guardar</h4>
              <ul className="space-y-3 text-gray-400">
                <li>✔ Separe seu dinheiro</li>
                <li>✔ Rendimento automático</li>
                <li>✔ Metas de longo prazo</li>
                <li>✔ Sem burocracia</li>
              </ul>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <Feature icon={<SiPix size={24} />} title="Pix Ilimitado" desc="Transferências instantâneas sem taxas." />
            <Feature icon={<MdSecurity size={24} />} title="Segurança Biométrica" desc="Proteção de dados de nível bancário." />
            <Feature icon={<MdDevices size={24} />} title="Multidispositivo" desc="Gerencie seu patrimônio em qualquer lugar." />
          </div>
        </div>
      </section>

      {/* Cartão Section (Antigo Cadastro) */}
      <section id="Cadastro" className="max-w-7xl mx-auto px-6 mb-12 scroll-mt-24">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/[0.05] bg-gradient-to-b from-[#141414] to-[#0A0A0A]">
          <div className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-[#CFAA56]/10 blur-[140px] rounded-full" />
          <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] bg-[#9B7C37]/10 blur-[140px] rounded-full" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-12 md:p-20">
            <div>
              <span className="text-[#CFAA56] uppercase tracking-[0.25em] text-xs font-bold">
                Seu Cartão Exclusivo
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
                Eleve sua experiência <br />
                <span className="bg-gradient-to-b from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
                  Atlas Black
                </span>
              </h2>
              <p className="text-gray-400 mb-10 max-w-lg text-lg leading-relaxed">
                Acesse salas VIP, tenha limite flexível e acumule pontos que não expiram.
                Tudo sob o seu controle no aplicativo.
              </p>
              <button className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black shadow-[0_0_40px_rgba(207,170,86,0.35)] hover:translate-y-[-3px] transition-all">
                Solicitar Cartão
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-[#CFAA56]/20 blur-[100px] rounded-full" />
              <Image
                src="/CartaoAtlas.png"
                alt="Cartão Atlas"
                width={520}
                height={340}
                className="relative z-10 rotate-[-6deg] hover:rotate-0 hover:scale-105 transition-all duration-500 drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]" 
              />
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

function Feature({ icon, title, desc }: FeatureProps & { desc?: string }) {
  return (
    <div className="group p-5 sm:p-7 md:p-10 rounded-2xl md:rounded-[2rem] bg-[#121212] border border-white/[0.03] hover:border-[#CFAA56]/50 hover:bg-[#161616] transition-all duration-500">
      <div className="flex items-start sm:items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center bg-gradient-to-br from-[#CFAA56]/20 to-[#9B7C37]/5 text-[#CFAA56] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl text-[#CFAA56] font-bold leading-tight">
          {title}
        </h3>
      </div>
      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
        {desc}
      </p>
    </div>
  );
}