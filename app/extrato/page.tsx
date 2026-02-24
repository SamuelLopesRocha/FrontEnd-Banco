"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, ChangeEvent, useMemo, useCallback } from "react";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";
import { Transacao, TransacaoAPI } from "@/types/Extrato";

import { FiArrowDownLeft, FiArrowUpRight, FiSearch } from "react-icons/fi";

export default function ExtratoPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);

    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [busca, setBusca] = useState("");
    const [tipo, setTipo] = useState<"todos" | "entrada" | "saida">("todos");
    const [periodo, setPeriodo] = useState("30");

    const buscarTransacoes = useCallback(async (page: number) => {
        const data = localStorage.getItem("data");
        if (!data) {
            router.push("/login");
            return;
        }

        const parsed = JSON.parse(data);

        const response = await fetch(
            `https://api-atlasbank.onrender.com/transacoes?page=${page}&limit=10`,
            {
                headers: {
                    Authorization: `Bearer ${parsed.token}`,
                },
            }
        );

        if (response.status === 401) {
            localStorage.removeItem("data");
            router.push("/login");
            return;
        }

        if (!response.ok) throw new Error("Erro ao buscar transações");

        const result: TransacaoAPI = await response.json();

        setTransacoes(result.dados);
        setPagina(result.pagina);
        setTotalPaginas(result.total_paginas);
    }, [router]);

    useEffect(() => {
        async function init() {
            const data = localStorage.getItem("data");

            if (!data) {
                router.push("/login");
                return;
            }

            try {
                const parsed = JSON.parse(data);

                if (!parsed.token || !parsed.usuario || !parsed.conta) {
                    localStorage.removeItem("data");
                    router.push("/login");
                    return;
                }

                setUsuario(parsed.usuario);
                setConta(parsed.conta);

                await buscarTransacoes(pagina);

            } catch (err) {
                console.error(err);
                router.push("/login");
            } finally {
                setLoading(false);
            }
        }

        init();
    }, [buscarTransacoes, pagina, router]);

    const filtrado = useMemo(() => {
        const hoje = new Date();

        return transacoes.filter((t) => {
            const dataTransacao = new Date(t.createdAt);

            const dentroPeriodo =
                (hoje.getTime() - dataTransacao.getTime()) /
                (1000 * 60 * 60 * 24) <= Number(periodo);

            const ehEntrada =
                t.tipo === "DEPOSITO" || t.tipo === "PIX_RECEBIMENTO";

            const ehSaida = !ehEntrada;

            const tipoOk =
                tipo === "todos" ||
                (tipo === "entrada" && ehEntrada) ||
                (tipo === "saida" && ehSaida);

            const buscaOk =
                t.descricao.toLowerCase().includes(busca.toLowerCase());

            return dentroPeriodo && tipoOk && buscaOk;
        });
    }, [transacoes, busca, tipo, periodo]);

    if (loading || !usuario || !conta) {
        return (
            <AppLayout
                title="Extrato"
                subtitle="Acompanhe suas movimentações"
                user={usuario}
                conta={conta}
            >
                <div className="min-h-screen flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                    <p>Carregando seu extrato...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            user={usuario}
            conta={conta}
            title="Extrato"
            subtitle="Acompanhe suas movimentações"
        >
            {/* FILTROS */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-5 mb-6">
                <div className="grid md:grid-cols-3 gap-4">

                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            placeholder="Buscar transação"
                            value={busca}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm outline-none"
                        />
                    </div>

                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as "todos" | "entrada" | "saida")}
                        className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm"
                    >
                        <option className="bg-[#050505]" value="todos">Todos</option>
                        <option className="bg-[#050505]" value="entrada">Entradas</option>
                        <option className="bg-[#050505]" value="saida">Saídas</option>
                    </select>

                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm"
                    >
                        <option className="bg-[#050505]" value="7">7 dias</option>
                        <option className="bg-[#050505]" value="30">30 dias</option>
                        <option className="bg-[#050505]" value="90">90 dias</option>
                        <option className="bg-[#050505]" value="365">1 ano</option>
                    </select>
                </div>
            </div>

            {/* LISTA */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">
                {filtrado.length === 0 ? (
                    <p className="text-center py-12 text-gray-500">
                        Nenhuma transação encontrada
                    </p>
                ) : (
                    filtrado.map((t) => (
                        <TransacaoItem key={t.id_transacao} t={t} />
                    ))
                )}
            </div>

            {/* PAGINAÇÃO */}
            <div className="flex justify-center items-center gap-4 py-6">
                <button
                    onClick={() => setPagina((prev) => Math.max(prev - 1, 1))}
                    disabled={pagina === 1}
                    className="px-4 py-2 rounded-xl bg-[#141414] border border-white/10 disabled:opacity-40"
                >
                    Anterior
                </button>

                <span className="text-sm text-gray-400">
                    Página {pagina} de {totalPaginas}
                </span>

                <button
                    onClick={() => setPagina((prev) => Math.min(prev + 1, totalPaginas))}
                    disabled={pagina === totalPaginas}
                    className="px-4 py-2 rounded-xl bg-[#141414] border border-white/10 disabled:opacity-40"
                >
                    Próxima
                </button>
            </div>
        </AppLayout>
    );
}

/* ---------- COMPONENTES ---------- */

function TransacaoItem({ t }: { t: Transacao }) {
    const positivo = t.tipo === "DEPOSITO" || t.tipo === "PIX_RECEBIMENTO";

    return (
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition">

            <div className="flex items-center gap-4">
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center
                    ${positivo
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                >
                    {positivo ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                </div>

                <div>
                    <p className="font-medium">{t.descricao}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            </div>

            <span className={`font-bold ${positivo ? "text-green-400" : "text-red-400"}`}>
                {positivo ? "+" : "-"} R$ {Math.abs(t.valor).toFixed(2)}
            </span>

        </div>
    );
}