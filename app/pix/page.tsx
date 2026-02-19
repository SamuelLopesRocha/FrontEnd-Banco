"use client";

import { PixActionProps, PixItemProps } from "@/types/Pix";
import AppLayout from "../components/AppLayout";
import { FaPix, FaQrcode, FaKey } from "react-icons/fa6";
import { FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";

export default function PixPage() {
    return (
        <AppLayout
            title="Pix"
            subtitle="Envie e receba dinheiro instantaneamente"
        >
            {/* SALDO + AÇÕES */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">

                {/* SALDO */}
                <div className="md:col-span-1 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Saldo disponível</p>

                    <h2 className="text-3xl font-bold text-[#CFAA56] mb-6">
                        R$ 2.450,00
                    </h2>

                    <button className="w-full py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition cursor-pointer">
                        Ver extrato
                    </button>
                </div>

                {/* AÇÕES */}
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">

                    <PixAction icon={<FiArrowUpRight />} label="Enviar" />
                    <PixAction icon={<FiArrowDownLeft />} label="Receber" />
                    <PixAction icon={<FaQrcode />} label="QR Code" />
                    <PixAction icon={<FaKey />} label="Minhas Chaves" />

                </div>
            </div>

            {/* HISTÓRICO */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">

                <h3 className="text-xl font-bold mb-6">
                    Últimas movimentações
                </h3>

                <div className="space-y-4">

                    <PixItem
                        name="Mercado Central"
                        type="saida"
                        value="- R$ 120,00"
                    />

                    <PixItem
                        name="João Silva"
                        type="entrada"
                        value="+ R$ 350,00"
                    />

                    <PixItem
                        name="Streaming"
                        type="saida"
                        value="- R$ 29,90"
                    />

                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- COMPONENTES ---------- */

function PixAction({ icon, label }: PixActionProps) {
    return (
        <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 hover:shadow-[0_0_18px_rgba(207,170,86,0.25)] transition-all cursor-pointer">
            <div className="text-2xl text-[#CFAA56]">
                {icon}
            </div>

            <span className="text-sm text-gray-300 font-medium">
                {label}
            </span>
        </button>
    );
}

function PixItem({ name, value, type }: PixItemProps) {
    const positive = type === "entrada";

    return (
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#CFAA56]/20 text-[#CFAA56]">
                    <FaPix />
                </div>

                <p className="font-medium">{name}</p>
            </div>

            <span
                className={`font-bold ${positive ? "text-green-400" : "text-red-400"
                    }`}
            >
                {value}
            </span>
        </div>
    );
}