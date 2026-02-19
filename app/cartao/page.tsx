"use client";

import { useState } from "react";
import AppLayout from "../components/AppLayout";
import { FiLock, FiSettings, FiPlus } from "react-icons/fi";
import { FaCreditCard } from "react-icons/fa6";
import { CardActionProps, Cartao } from "@/types/Cartao";

const CARTOES: Cartao[] = [
    {
        id: 1,
        nome: "Atlas Black",
        final: "4821",
        titular: "Matheus",
        validade: "12/30"
    },
    {
        id: 2,
        nome: "Atlas Virtual",
        final: "9123",
        titular: "Matheus",
        validade: "09/28"
    }
];

export default function CartoesPage() {

    const [selecionado, setSelecionado] = useState<Cartao>(CARTOES[0]);

    return (
        <AppLayout
            title="Cartões"
            subtitle="Gerencie seus cartões Atlas"
        >

            {/* SELETOR COMPACTO */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                {CARTOES.map(cartao => (
                    <button
                        key={cartao.id}
                        onClick={() => setSelecionado(cartao)}
                        className={` flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition cursor-pointer
                    ${selecionado.id === cartao.id
                                ? "bg-[#CFAA56]/10 border-[#CFAA56]"
                                : "border-white/10 hover:border-white/30"
                            }
                    `}
                    >
                        <FaCreditCard className="text-[#CFAA56]" />
                        <span className="text-sm">
                            {cartao.nome} • {cartao.final}
                        </span>
                    </button>
                ))}
            </div>

            {/* CARTÃO PRINCIPAL */}
            <div className="mb-10">

                <div className="relative rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-[#1b1b1b] via-[#0b0b0b] to-black overflow-hidden shadow-xl">

                    <div className="absolute w-96 h-96 bg-[#CFAA56]/20 blur-[160px] -top-40 -right-32 rounded-full" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <p className="text-gray-400 text-sm">
                            {selecionado.nome}
                        </p>

                        <FaCreditCard className="text-[#CFAA56] text-2xl" />
                    </div>

                    <h2 className="tracking-[0.35em] text-2xl md:text-3xl font-light mb-8 relative z-10">
                        **** **** **** {selecionado.final}
                    </h2>

                    <div className="flex justify-between relative z-10">
                        <span className="uppercase text-sm tracking-wider text-gray-300">
                            {selecionado.titular}
                        </span>

                        <span className="text-gray-400">
                            {selecionado.validade}
                        </span>
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

                <p className="text-3xl font-bold text-[#F4E3B2] mb-4">R$ 3.820,00</p>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                    <div className="w-2/3 h-full bg-gradient-to-r from-[#CFAA56] to-[#9B7C37]" />
                </div>

                <div className="border-t border-white/5 pt-4">
                    <h3 className="text-sm text-gray-400 mb-1">Fatura atual</h3>
                    <p className="text-xl font-semibold mb-2">R$ 1.180,40</p>
                    <p className="text-xs text-gray-500 mb-4">Vencimento em 12 Out</p>
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black font-semibold hover:brightness-110 transition cursor-pointer">
                        Pagar fatura
                    </button>
                </div>
            </div>

        </AppLayout>
    );
}

/* COMPONENTES */

function CardAction({ icon, label }: CardActionProps) {
    return (<button className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 transition-all cursor-pointer">
        <div className="text-xl text-[#CFAA56]">
            {icon} </div>
        <span className="text-sm text-gray-300">
            {label}
        </span>
    </button>
    );
}
