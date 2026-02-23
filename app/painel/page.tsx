"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";
import { Transacao, TransacaoAPI } from "@/types/Extrato";

import { FiDollarSign, FiCreditCard, FiShoppingBag } from "react-icons/fi";
import { FaPix, FaChartLine, FaPlus } from "react-icons/fa6";
import { ActionButtonProps, SaldoCardProps, TransactionProps } from "@/types/Painel";

export default function PainelPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);

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

    async function verSaldo() {
        const data = localStorage.getItem("data");
        if (!data) return;

        const parsed = JSON.parse(data);

        try {
            const response = await fetch(
                `https://api-atlasbank.onrender.com/contas/${parsed.usuario.usuario_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${parsed.token}`,
                    },
                }
            );

            if (!response.ok) throw new Error();

            const result = await response.json();

            const saldoAPI = result?.contas?.[0]?.saldo;

            if (saldoAPI !== undefined) {
                setConta(prev =>
                    prev ? { ...prev, saldo: saldoAPI } : prev
                );
            }

        } catch (err) {
            console.error("Erro ao atualizar saldo:", err);
        }
    }

    async function verTransacoes() {
        const data = localStorage.getItem("data");
        if (!data) return;

        const parsed = JSON.parse(data);

        try {
            const response = await fetch(
                `https://api-atlasbank.onrender.com/transacoes`,
                {
                    headers: {
                        Authorization: `Bearer ${parsed.token}`,
                    },
                }
            );

            if (!response.ok) throw new Error();

            const result: TransacaoAPI = await response.json();
            setTransacoes(result.dados);

        } catch (err) {
            console.error("Erro ao buscar transações:", err);
        }
    }

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    useEffect(() => {
        if (!isLoading) {
            verSaldo();
            verTransacoes();
        }
    }, [isLoading]);

    if (isLoading || !usuario) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#CFAA56]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                <p>Carregando seus dados...</p>
            </div>
        );
    }

    return (
        <AppLayout
            user={usuario}
            conta={conta}
            title="Bem-vindo de volta"
            subtitle="Aqui está o resumo da sua conta"
        >

            {/* SALDOS */}
            <div className="grid gap-4 md:grid-cols-2 mb-6 md:mb-10">
                <SaldoCard
                    title="Saldo disponível"
                    value={formatarMoeda(conta?.saldo || 0)}
                />

            </div>

            {/* AÇÕES */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
                <ActionButton icon={<FaPix />} label="Pix" href="/pix" />
                <ActionButton icon={<FiDollarSign />} label="Pagar" href="/pagamentos" />
                <ActionButton icon={<FiCreditCard />} label="Cartões" href="/cartao" />
                <ActionButton icon={<FaChartLine />} label="Investimentos" href="/investimentos" />
                <ActionButton icon={<FiShoppingBag />} label="Shopping" href="/shopping" />
                <ActionButton icon={<FaPlus />} label="Personalizar" href="/personalizar" disabled={true} />
            </div>

            {/* EXTRATO */}
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-4 md:p-6">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                    <h2 className="font-bold text-lg md:text-xl">
                        Últimas movimentações
                    </h2>
                    <Link
                        href="/extrato"
                        className="text-xs md:text-sm px-4 py-2 rounded-xl border border-[#CFAA56]/40 text-[#F4E3B2] hover:bg-[#CFAA56]/10 transition"
                    >
                        Ver extrato completo →
                    </Link>
                </div>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {transacoes.length > 0 ? (
                        transacoes.map((mov, index) => (
                            <Transaction
                                key={index}
                                name={mov.tipo}
                                date={new Date(mov.createdAt).toLocaleDateString("pt-BR")}
                                category={mov.descricao}
                                value={
                                    mov.tipo === "DEPOSITO"
                                        ? `+${mov.valor}`
                                        : `-${mov.valor}`
                                }
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4 text-sm">Nenhuma movimentação recente.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- COMPONENTES (MANTIDOS IGUAIS) ---------- */

function SaldoCard({ title, value }: SaldoCardProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#141414] to-[#0A0A0A] p-8">
            <div className="absolute w-40 h-40 bg-[#CFAA56]/10 blur-[100px] rounded-full" />
            <p className="text-gray-400 text-sm mb-2">{title}</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
                {value}
            </h3>
        </div>
    );
}

function ActionButton({ icon, label, href, disabled = false }: ActionButtonProps) {
    const baseStyle = `flex flex-col items-center justify-center gap-2 p-5 md:p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 transition-all
    ${disabled
            ? "opacity-50 cursor-not-allowed"
            : "hover:border-[#CFAA56]/60 hover:-translate-y-1 hover:shadow-[0_0_18px_rgba(207,170,86,0.25)]"
        }
  `;

    if (disabled) {
        return (
            <div className={baseStyle}>
                <div className="text-xl md:text-2xl text-[#CFAA56]">
                    {icon}
                </div>
                <span className="text-sm font-medium text-gray-300">
                    {label}
                </span>
            </div>
        );
    }

    return (
        <Link href={href} className={baseStyle}>
            <div className="text-xl md:text-2xl text-[#CFAA56]">
                {icon}
            </div>
            <span className="text-sm font-medium text-gray-300">
                {label}
            </span>
        </Link>
    );
}

function Transaction({ name, date, category, value }: TransactionProps) {
    const valueString = String(value);
    const positivo = valueString.includes("+");

    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-[#CFAA56]/30 to-transparent text-[#F4E3B2] font-bold">
                    {name[0]}
                </div>
                <div>
                    <p className="font-medium text-sm">{name}</p>
                    <p className="text-xs text-gray-400">
                        {category} • {date}
                    </p>
                </div>
            </div>
            <span
                className={`font-semibold text-sm ${positivo ? "text-green-400" : "text-red-400"
                    }`}
            >
                {positivo ? "+" : "-"} R$ {Math.abs(Number(valueString)).toFixed(2)}
            </span>
        </div>
    );
}

