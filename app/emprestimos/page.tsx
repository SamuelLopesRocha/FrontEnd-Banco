"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiDollarSign, FiTrendingUp, FiClock, FiCheckCircle } from "react-icons/fi";
import { EmprestimosInputProps, LoanItemProps, SummaryCardProps } from "@/types/Emprestimos";


export default function EmprestimosPage() {
    const router = useRouter();
    const [valor, setValor] = useState("");
    const [parcelas, setParcelas] = useState("12");
    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);

    useEffect(() => {
        const data = localStorage.getItem("data");

        if (!data) {
            router.push("/login");
            return;
        }

        try {
            const parsedData = JSON.parse(data);

            const token = parsedData.token;
            const usuario: UsuarioAPI = parsedData.usuario;
            const conta: Conta = parsedData.conta;

            if (!token || !usuario || !conta) {
                localStorage.removeItem("data");
                router.push("/login");
                return;
            }

            setUsuario(usuario);
            setConta(conta);
        } catch {
            localStorage.removeItem("data");
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    // Função auxiliar para formatar moeda
    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        if (e.target.name === "valor") setValor(e.target.value);
        if (e.target.name === "parcelas") setParcelas(e.target.value);
    }

    function solicitar() {
        console.log({ valor, parcelas });
    }

    // Tela de loading
    if (isLoading || !usuario) {
        return (
            <AppLayout
                title="Empréstimos"
                subtitle="Simule e contrate crédito com facilidade"
                user={usuario}
                conta={conta}
            >
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                    <p>Analisando propostas de crédito...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Empréstimos"
            subtitle="Simule e contrate crédito com facilidade"
            user={usuario}
            conta={conta}
        >
            {/* RESUMO DINÂMICO */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                    icon={<FiDollarSign />}
                    title="Limite disponível"
                    /* Usando o limite de crédito do usuário que vem do banco */
                    value={formatarMoeda(usuario.limite_credito || 12000)}
                />

                <SummaryCard
                    icon={<FiTrendingUp />}
                    title="Taxa estimada"
                    value="1,9% a.m."
                />

                <SummaryCard
                    icon={<FiClock />}
                    title="Prazo máximo"
                    value="48 meses"
                />
            </div>

            {/* SIMULADOR + HISTÓRICO */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* SIMULADOR */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-6">Simular empréstimo</h3>
                    <div className="space-y-4">
                        <Input
                            name="valor"
                            placeholder="Valor desejado"
                            value={valor}
                            onChange={handleChange}
                        />

                        <select
                            name="parcelas"
                            value={parcelas}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white outline-none focus:border-[#CFAA56]/40 transition"
                        >
                            <option className="bg-[#0a0a0a]" value="6">6 parcelas</option>
                            <option className="bg-[#0a0a0a]" value="12">12 parcelas</option>
                            <option className="bg-[#0a0a0a]" value="24">24 parcelas</option>
                            <option className="bg-[#0a0a0a]" value="36">36 parcelas</option>
                            <option className="bg-[#0a0a0a]" value="48">48 parcelas</option>
                        </select>

                        {/* RESULTADO DINÂMICO (Simulação básica) */}
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <p className="text-sm text-gray-400 mb-1">Parcela estimada</p>
                            <p className="text-2xl font-bold text-[#CFAA56]">
                                {valor ? formatarMoeda((Number(valor) * 1.2) / Number(parcelas)) : "R$ 0,00"}
                            </p>
                        </div>

                        <button
                            onClick={solicitar}
                            className="w-full py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition cursor-pointer"
                        >
                            Solicitar empréstimo
                        </button>
                    </div>
                </div>

                {/* HISTÓRICO */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                    <h3 className="text-xl font-bold mb-6">Seus empréstimos</h3>
                    <div className="space-y-4">
                        <LoanItem
                            title="Crédito pessoal"
                            status="Em andamento"
                            value="R$ 5.000,00"
                        />
                        <LoanItem
                            title="Compra emergencial"
                            status="Quitado"
                            value="R$ 1.200,00"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- COMPONENTES INTERNOS ---------- */

function Input({ name, placeholder, value, onChange }: EmprestimosInputProps) {
    return (
        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white outline-none focus:border-[#CFAA56]/40 focus:bg-white/[0.04] transition"
        />
    );
}

function SummaryCard({ icon, title, value }: SummaryCardProps) {
    return (
        <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/5 flex items-center gap-4">
            <div className="text-2xl text-[#CFAA56]">
                {icon}
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="font-bold text-lg">{value}</p>
            </div>
        </div>
    );
}

function LoanItem({ title, status, value }: LoanItemProps) {
    return (
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#CFAA56]/20 text-[#CFAA56]">
                    <FiCheckCircle />
                </div>
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-gray-500">{status}</p>
                </div>
            </div>
            <span className="font-bold">{value}</span>
        </div>
    );
}