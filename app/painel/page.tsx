"use client";

import AppLayout from "../components/AppLayout";
import Link from "next/link";

import { FiDollarSign, FiCreditCard, FiShoppingBag } from "react-icons/fi";
import { FaPix, FaChartLine, FaPlus } from "react-icons/fa6";
import { ActionButtonProps, SaldoCardProps, TransactionProps } from "@/types/Painel";

export default function PainelPage() {
    return (
        <AppLayout
            title="Bem-vindo de volta"
            subtitle="Aqui está o resumo da sua conta"
        >
            {/* SALDOS */}
            <div className="grid gap-4 md:grid-cols-2 mb-6 md:mb-10">

                <SaldoCard
                    title="Saldo disponível"
                    value="R$ 12.458,90"
                />

                <SaldoCard
                    title="Poupança"
                    value="R$ 4.220,11"
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

                    <Transaction
                        name="Supermercado"
                        date="Hoje • 14:32"
                        category="Alimentação"
                        value="-230,00"
                    />

                    <Transaction
                        name="Salário"
                        date="Ontem"
                        category="Receita"
                        value="+3500,00"
                    />

                    <Transaction
                        name="Netflix"
                        date="12 Mai"
                        category="Assinaturas"
                        value="-39,90"
                    />

                </div>
            </div>

        </AppLayout>
    );
}

/* ---------- COMPONENTES ---------- */

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
    const positive = value.includes("+");

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
                className={`font-semibold text-sm ${positive ? "text-green-400" : "text-red-400"
                    }`}
            >
                {positive ? "+" : "-"} R$ {value.replace(/[+-]/, "")}
            </span>

        </div>
    );
}
