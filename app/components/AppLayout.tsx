/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { NavItemProps, MobileNavProps } from "@/types/Layout";

import { FiHome, FiDollarSign, FiCreditCard, FiLogOut, FiShoppingBag, FiMenu, FiX } from "react-icons/fi";
import { FaRobot, FaChartLine, FaPix } from "react-icons/fa6";
import { PiHandCoinsBold } from "react-icons/pi";
import { Conta } from "@/types/Conta";

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

    function logout() {
        localStorage.removeItem("data");
        router.push("/login");
    }

    return (
        <div className="min-h-screen bg-[#030303] text-white flex">

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

                <button
                    onClick={logout}
                    className="m-4 flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/20"
                >
                    <FiLogOut />
                    Sair
                </button>

            </aside>

            {/* MAIN */}
            <main className="flex-1 p-5 md:p-10 pb-28 md:pb-10">

                {/* HEADER */}
                <header className="flex justify-between items-center mb-8">

                    <button
                        onClick={() => setMenuOpen(true)}
                        className="md:hidden p-2 rounded-lg bg-white/5"
                    >
                        <FiMenu size={22} />
                    </button>

                    <div className="hidden md:block">
                        {title && <h1 className="text-3xl font-bold">{title}</h1>}
                        {subtitle && (
                            <p className="text-gray-400 text-sm">{subtitle}</p>
                        )}
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

                        {/* 5. Avatar com inicial dinâmica */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CFAA56] to-[#9B7C37] flex items-center justify-center text-black font-bold">
                            {user?.nome_completo ? user.nome_completo[0] : "?"}
                        </div>
                    </div>

                </header>

                {/* CONTEÚDO */}
                {children}

            </main>

            {/* MOBILE MENU */}
            <div
                className={`fixed inset-0 z-50 md:hidden ${menuOpen ? "visible" : "invisible"
                    }`}
            >
                <div
                    onClick={() => setMenuOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <div
                    className={`absolute left-0 top-0 h-full w-72 bg-[#0A0A0A] border-r border-white/5 p-6 flex flex-col justify-between transform transition-transform ${menuOpen ? "translate-x-0" : "-translate-x-full"
                        }`}
                >
                    <div>

                        <div className="flex justify-between items-center mb-8">
                            <Image
                                src="/AtlasLogo.svg"
                                alt=""
                                width={120}
                                height={32}
                            />
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

                    <button
                        onClick={logout}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/20 cursor-pointer"
                    >
                        <FiLogOut />
                        Sair
                    </button>

                </div>
            </div>

            {/* BOTTOM NAV MOBILE */}
            <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[#0A0A0A] border-t border-white/5 px-2 py-2 flex justify-around">

                <MobileNav icon={<FiHome />} label="Home" href="/painel" active={pathname === "/painel"} />
                <MobileNav icon={<FaPix />} label="Pix" href="/pix" active={pathname === "/pix"} />
                <MobileNav icon={<FiCreditCard />} label="Cartões" href="/cartao" active={pathname === "/cartao"} />
                <MobileNav icon={<FaRobot />} label="Teste" href="/teste" active={pathname === "/teste"} />

            </div>

        </div>
    );
}

/* COMPONENTES */

function NavItem({ icon, label, href, active }: NavItemProps) {
    return (
        <Link href={href}>
            <div
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition
          ${active
                        ? "bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black font-bold"
                        : "hover:bg-white/5"}
        `}
            >
                {icon}
                {label}
            </div>
        </Link>
    );
}

function MobileNav({ icon, label, href, active }: MobileNavProps) {
    return (
        <Link href={href}>
            <button
                className={`flex flex-col items-center text-xs transition
          ${active ? "text-[#CFAA56]" : "text-gray-400"}
        `}
            >
                <div className="text-lg">{icon}</div>
                {label}
            </button>
        </Link>
    );
}