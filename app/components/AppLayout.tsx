/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NavItemProps, MobileNavProps } from "@/types/Layout";
import { Conta } from "@/types/Conta";

// Importações do Tempo Real
import { io } from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";

import { FiHome, FiDollarSign, FiCreditCard, FiLogOut, FiShoppingBag, FiMenu, FiX, FiArrowDownLeft } from "react-icons/fi";
import { FaRobot, FaChartLine, FaPix } from "react-icons/fa6";
import { PiHandCoinsBold } from "react-icons/pi";

type Props = {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    user?: {
        nome_completo: string;
    } | null;
    conta?: Conta | null;
};

export default function AppLayout({ children, title, subtitle, user, conta }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    // ==========================================
    // MÁGICA DO TEMPO REAL (SOCKET.IO)
    // ==========================================
    useEffect(() => {
        const data = localStorage.getItem("data");
        if (!data) return;

        const parsedData = JSON.parse(data);
        const usuarioId = parsedData.usuario?.usuario_id;

        if (!usuarioId) return;

        // Conecta ao túnel do servidor (Aponte para a URL do seu back-end no Render)
        const socket = io("https://api-atlasbank.onrender.com");

        socket.on("connect", () => {
            console.log("🟢 Conectado ao servidor de tempo real!");
            // Avisa ao servidor quem somos nós, para ele nos colocar na sala correta
            socket.emit("entrarNaConta", usuarioId);
        });

        // Ouve ativamente por mensagens chamadas 'pixRecebido'
        socket.on("pixRecebido", (dados: { mensagem: string; valor: number }) => {
            try { new Audio('/notificacao.mp3').play(); } catch (e) { console.log("Erro ao reproduzir som:", (e as Error).message) }

            // Exibe o Toast Dourado e Bonitão
            toast.custom(
                (t) => (
                    <div
                        className={`${t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-[#0A0A0A] border border-[#CFAA56] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                    >
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                                        <FiArrowDownLeft size={24} />
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-white">
                                        Pix Recebido!
                                    </p>
                                    <p className="mt-1 text-xs text-gray-400">
                                        {dados.mensagem}
                                    </p>
                                    <p className="mt-1 font-mono text-lg font-bold text-[#F4E3B2]">
                                        + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dados.valor)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-white/10">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-500 hover:text-white focus:outline-none"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                ),
                { duration: 8000, position: 'top-right' } // Fica 8 segundos na tela
            );

            // Opcional: Se estiver na tela Home ou Pix, manda recarregar a tela após 2 segundos pra atualizar o saldo visualmente.
            setTimeout(() => {
                if (pathname === '/painel' || pathname === '/pix') {
                    window.location.reload();
                }
            }, 2500);
        });

        // Limpa a conexão quando o componente for desmontado
        return () => {
            socket.disconnect();
        };
    }, [pathname]);

    function logout() {
        localStorage.removeItem("data");
        router.push("/login");
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white flex relative">

            {/* INJEÇÃO DO TOASTER (Onde as notificações vão flutuar) */}
            <Toaster />

            {/* SIDEBAR DESKTOP */}
            <aside className="hidden md:flex w-64 bg-[#0A0A0A] border-r border-white/5 flex-col justify-between">
                <div>
                    <div className="p-6 border-b border-white/5">
                        <img src="/AtlasLogo.svg" className="w-32" />
                    </div>

                    <nav className="p-4 gap-2 flex flex-col">
                        <NavItem icon={<FiHome />} label="Home" href="/painel" active={pathname === "/painel"} />
                        <NavItem icon={<FaPix />} label="Pix" href="/pix" active={pathname === "/pix"} />
                        <NavItem icon={<FiDollarSign />} label="Pagamentos" href="/pagamentos" active={pathname === "/pagamentos"} />
                        <NavItem icon={<FiCreditCard />} label="Cartões" href="/cartao" active={pathname === "/cartao"} />
                        <NavItem icon={<PiHandCoinsBold />} label="Empréstimos" href="/emprestimos" active={pathname === "/emprestimos"} />
                        <NavItem icon={<FaChartLine />} label="Investimentos" href="/investimentos" active={pathname === "/investimentos"} />
                        <NavItem icon={<FiShoppingBag />} label="Shopping" href="/shopping" active={pathname === "/shopping"} />
                        <NavItem icon={<FaRobot />} label="Teste Físico" href="/teste" active={pathname === "/teste"} />
                    </nav>
                </div>

                <button onClick={logout} className="m-4 flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors">
                    <FiLogOut /> Sair
                </button>
            </aside>

            {/* MAIN */}
            <main className="flex-1 p-5 md:p-10 pb-28 md:pb-10 relative">

                {/* HEADER */}
                <header className="flex justify-between items-center mb-8">
                    <button onClick={() => setMenuOpen(true)} className="md:hidden p-2 rounded-lg bg-white/5">
                        <FiMenu size={22} />
                    </button>

                    <div className="hidden md:block">
                        {title && <h1 className="text-3xl font-bold">{title}</h1>}
                        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
                    </div>

                    {/* PERFIL */}
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">
                                {user?.nome_completo ? user.nome_completo.split(" ")[0] : "Carregando..."}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                Conta {conta?.tipo_conta?.toLowerCase() || "Conta Corrente"}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CFAA56] to-[#9B7C37] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(207,170,86,0.3)]">
                            {user?.nome_completo ? user.nome_completo[0] : "?"}
                        </div>
                    </div>
                </header>

                {/* CONTEÚDO */}
                {children}
            </main>

            {/* MOBILE MENU */}
            <div className={`fixed inset-0 z-50 md:hidden ${menuOpen ? "visible" : "invisible"}`}>
                <div onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <div className={`absolute left-0 top-0 h-full w-72 bg-[#0A0A0A] border-r border-white/5 p-6 flex flex-col justify-between transform transition-transform ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <Image src="/AtlasLogo.svg" alt="Atlas" width={120} height={32} />
                            <button onClick={() => setMenuOpen(false)}>
                                <FiX size={22} />
                            </button>
                        </div>

                        <nav className="space-y-2">
                            <NavItem icon={<FiHome />} label="Home" href="/painel" active={pathname === "/painel"} />
                            <NavItem icon={<FaPix />} label="Pix" href="/pix" active={pathname === "/pix"} />
                            <NavItem icon={<FiDollarSign />} label="Pagamentos" href="/pagamentos" active={pathname === "/pagamentos"} />
                            <NavItem icon={<FiCreditCard />} label="Cartões" href="/cartao" active={pathname === "/cartao"} />
                            <NavItem icon={<PiHandCoinsBold />} label="Empréstimos" href="/emprestimos" active={pathname === "/emprestimos"} />
                            <NavItem icon={<FaChartLine />} label="Investimentos" href="/investimentos" active={pathname === "/investimentos"} />
                            <NavItem icon={<FiShoppingBag />} label="Shopping" href="/shopping" active={pathname === "/shopping"} />
                            <NavItem icon={<FaRobot />} label="Teste Físico" href="/teste" active={pathname === "/teste"} />
                        </nav>
                    </div>

                    <button onClick={logout} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/20 transition-colors">
                        <FiLogOut /> Sair
                    </button>
                </div>
            </div>

            {/* BOTTOM NAV MOBILE */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#0A0A0A] border-t border-white/5 px-2 py-2 flex justify-around z-40">
                <MobileNav icon={<FiHome />} label="Home" href="/painel" active={pathname === "/painel"} />
                <MobileNav icon={<FaPix />} label="Pix" href="/pix" active={pathname === "/pix"} />
                <MobileNav icon={<FiCreditCard />} label="Cartões" href="/cartao" active={pathname === "/cartao"} />
                <MobileNav icon={<FaRobot />} label="Teste" href="/teste" active={pathname === "/teste"} />
            </div>

        </div>
    );
}

/* COMPONENTES MANTIDOS IGUAIS */

function NavItem({ icon, label, href, active }: NavItemProps) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${active ? "bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black font-bold" : "hover:bg-white/5"}`}>
                {icon}
                {label}
            </div>
        </Link>
    );
}

function MobileNav({ icon, label, href, active }: MobileNavProps) {
    return (
        <Link href={href}>
            <button className={`flex flex-col items-center text-xs transition ${active ? "text-[#CFAA56]" : "text-gray-400"}`}>
                <div className="text-lg">{icon}</div>
                {label}
            </button>
        </Link>
    );
}