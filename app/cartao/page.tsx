"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../components/AppLayout";
import { FiLock, FiSettings, FiPlus, FiLogOut } from "react-icons/fi";
import { FaCreditCard } from "react-icons/fa6";
import { CardActionProps, Cartao } from "@/types/Cartao";

export default function CartoesPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);
    const [selecionado, setSelecionado] = useState<any>(null);

    // ==========================================
    // 1. VERIFICAÇÃO DE LOGIN E BUSCA DE DADOS
    // ==========================================
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            router.push("/login");
            return;
        }

        async function carregarDados() {
            try {
                const response = await fetch("https://api-atlasbank.onrender.com/usuarios/meus-dados", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Sessão inválida.");
                }

                const data = await response.json();
                setUsuario(data);
                
                // Definindo os cartões baseados no titular logado
                const cartoesIniciais = [
                    { id: 1, nome: "Atlas Black", final: "4821", titular: data.nome_completo.split(" ")[0], validade: "12/30" },
                    { id: 2, nome: "Atlas Virtual", final: "9123", titular: data.nome_completo.split(" ")[0], validade: "09/28" }
                ];
                setSelecionado(cartoesIniciais[0]);
            } catch (error) {
                console.error("ERRO EM CARTÕES:", error);
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

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    if (isLoading || !usuario) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#CFAA56]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                <p>Carregando cartões...</p>
            </div>
        );
    }

    // Lista de cartões com o nome do titular dinâmico
    const CARTOES_DINAMICOS = [
        { id: 1, nome: "Atlas Black", final: "4821", titular: usuario.nome_completo, validade: "12/30" },
        { id: 2, nome: "Atlas Virtual", final: "9123", titular: usuario.nome_completo, validade: "09/28" }
    ];

    return (
        <AppLayout
            title="Cartões"
            subtitle="Gerencie seus cartões Atlas"
            user={usuario}
        >
            {/* BOTÃO DE LOGOUT */}
            <div className="flex justify-end mb-6">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                    <FiLogOut /> Sair da conta
                </button>
            </div>

            {/* SELETOR COMPACTO */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                {CARTOES_DINAMICOS.map(cartao => (
                    <button
                        key={cartao.id}
                        onClick={() => setSelecionado(cartao)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition cursor-pointer
                        ${selecionado?.id === cartao.id ? "bg-[#CFAA56]/10 border-[#CFAA56]" : "border-white/10 hover:border-white/30"}`}
                    >
                        <FaCreditCard className="text-[#CFAA56]" />
                        <span className="text-sm">{cartao.nome} • {cartao.final}</span>
                    </button>
                ))}
            </div>

            {/* CARTÃO PRINCIPAL */}
            <div className="mb-10">
                <div className="relative rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-[#1b1b1b] via-[#0b0b0b] to-black overflow-hidden shadow-xl">
                    <div className="absolute w-96 h-96 bg-[#CFAA56]/20 blur-[160px] -top-40 -right-32 rounded-full" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <p className="text-gray-400 text-sm">{selecionado?.nome}</p>
                        <FaCreditCard className="text-[#CFAA56] text-2xl" />
                    </div>
                    <h2 className="tracking-[0.35em] text-2xl md:text-3xl font-light mb-8 relative z-10">
                        **** **** **** {selecionado?.final}
                    </h2>
                    <div className="flex justify-between relative z-10">
                        <span className="uppercase text-sm tracking-wider text-gray-300">
                            {usuario.nome_completo}
                        </span>
                        <span className="text-gray-400">{selecionado?.validade}</span>
                    </div>
                </div>
            </div>

            {/* AÇÕES */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
                <CardAction icon={<FiLock />} label="Bloquear" />
                <CardAction icon={<FiSettings />} label="Configurar" />
                <CardAction icon={<FiPlus />} label="Criar" />
            </div>

            {/* LIMITE + FATURA */}
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6 mb-8">
                <h3 className="mb-2 text-sm text-gray-400">Limite disponível</h3>
                <p className="text-3xl font-bold text-[#F4E3B2] mb-4">
                    {formatarMoeda(usuario.limite_credito || 200)}
                </p>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                    <div className="w-2/3 h-full bg-gradient-to-r from-[#CFAA56] to-[#9B7C37]" />
                </div>
                <div className="border-t border-white/5 pt-4">
                    <h3 className="text-sm text-gray-400 mb-1">Fatura atual</h3>
                    <p className="text-xl font-semibold mb-2">R$ 0,00</p>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black font-semibold hover:brightness-110 transition cursor-pointer">
                        Pagar fatura
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}

function CardAction({ icon, label }: CardActionProps) {
    return (
        <button className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 transition-all cursor-pointer">
            <div className="text-xl text-[#CFAA56]">{icon}</div>
            <span className="text-sm text-gray-300">{label}</span>
        </button>
    );
}