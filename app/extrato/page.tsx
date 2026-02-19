"use client";

import { Transacao } from "@/types/Extrato";
import AppLayout from "../components/AppLayout";
import { useState, ChangeEvent, useMemo } from "react";
import { FiArrowDown, FiArrowUp, FiSearch } from "react-icons/fi";

const DATA: Transacao[] = [
    { id: 1, descricao: "Pix Recebido", valor: 820, data: "2026-02-10", tipo: "entrada" },
    { id: 2, descricao: "Mercado", valor: -120, data: "2026-02-09", tipo: "saida" },
    { id: 3, descricao: "Salário", valor: 4200, data: "2026-02-05", tipo: "entrada" },
    { id: 4, descricao: "Netflix", valor: -39, data: "2026-01-28", tipo: "saida" },
];

export default function ExtratoPage() {
    const [busca, setBusca] = useState("");
    const [tipo, setTipo] = useState<"todos" | "entrada" | "saida">("todos");
    const [periodo, setPeriodo] = useState("30");

    const filtrado = useMemo(() => {
        const hoje = new Date();

        return DATA.filter((t) => {
            const dataTransacao = new Date(t.data);

            const dentroPeriodo =
                (hoje.getTime() - dataTransacao.getTime()) / (1000 * 60 * 60 * 24)
                <= Number(periodo);

            const tipoOk = tipo === "todos" || t.tipo === tipo;

            const buscaOk =
                t.descricao.toLowerCase().includes(busca.toLowerCase());

            return dentroPeriodo && tipoOk && buscaOk;
        });
    }, [busca, tipo, periodo]);

    return (
        <AppLayout
            title="Extrato"
            subtitle="Acompanhe suas movimentações"
        >

            {/* FILTROS */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-5 mb-6">

                <div className="grid md:grid-cols-3 gap-4">

                    {/* BUSCA */}
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

                        <input
                            placeholder="Buscar transação"
                            value={busca}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white outline-none" />
                    </div>

                    {/* TIPO */}
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value as "todos" | "entrada" | "saida")}
                        className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm">
                        <option className="bg-[#0A0A0A]" value="todos">Todos</option>
                        <option className="bg-[#0A0A0A]" value="entrada">Entradas</option>
                        <option className="bg-[#0A0A0A]" value="saida">Saídas</option>
                    </select>

                    {/* PERIODO */}
                    <select
                        value={periodo}
                        onChange={(e) => setPeriodo(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm">
                        <option className="bg-[#0A0A0A]" value="7">7 dias</option>
                        <option className="bg-[#0A0A0A]" value="30">30 dias</option>
                        <option className="bg-[#0A0A0A]" value="90">90 dias</option>
                        <option className="bg-[#0A0A0A]" value="365">1 ano</option>
                    </select>

                </div>
            </div>


            {/* LISTA */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden">

                {filtrado.length === 0 && (
                    <p className="text-center py-12 text-gray-500">
                        Nenhuma transação encontrada
                    </p>
                )}

                {filtrado.map((t) => (
                    <TransacaoItem key={t.id} t={t} />
                ))}

            </div>

        </AppLayout>
    );
}

/* ---------- COMPONENTES ---------- */

function TransacaoItem({ t }: { t: Transacao }) {
    const positivo = t.valor > 0;

    return (
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/[0.03] hover:bg-white/[0.02] transition">

            <div className="flex items-center gap-4">

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center
          ${positivo
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-400"}
        `}>
                    {positivo ? <FiArrowDown /> : <FiArrowUp />}
                </div>

                <div>
                    <p className="font-medium">{t.descricao}</p>
                    <p className="text-xs text-gray-500">
                        {new Date(t.data).toLocaleDateString()}
                    </p>
                </div>

            </div>

            <span className={`font-bold ${positivo ? "text-green-400" : "text-red-400"}`}>
                {positivo ? "+" : "-"} R$ {Math.abs(t.valor).toFixed(2)}
            </span>

        </div>
    );
}
