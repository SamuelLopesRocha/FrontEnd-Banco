"use client";

import { HistoryItemProps, PagamentosActionProps, PagamentosInputProps } from "@/types/Pagamentos";
import AppLayout from "../components/AppLayout";
import { useState, ChangeEvent } from "react";
import { FiBarChart, FiClock } from "react-icons/fi";
import { FaBarcode, FaCopy } from "react-icons/fa6";

export default function PagamentosPage() {
    const [codigo, setCodigo] = useState("");
    const [valor, setValor] = useState("");

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.name === "codigo") setCodigo(e.target.value);
        if (e.target.name === "valor") setValor(e.target.value);
    }

    function pagar() {
        console.log({ codigo, valor });
    }

    return (
        <AppLayout
            title="Pagamentos"
            subtitle="Pague boletos e contas rapidamente"
        >
            {/* AÇÕES */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">

                <Action icon={<FaBarcode />} label="Pagar boleto" />
                <Action icon={<FaCopy />} label="Copiar código" />
                <Action icon={<FiClock />} label="Agendados" />

            </div>

            {/* FORM + HISTÓRICO */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">

                    <h3 className="text-xl font-bold mb-6">
                        Novo pagamento
                    </h3>

                    <div className="space-y-4">

                        <Input
                            name="codigo"
                            placeholder="Código de barras / linha digitável"
                            value={codigo}
                            onChange={handleChange}
                        />

                        <Input
                            name="valor"
                            placeholder="Valor"
                            value={valor}
                            onChange={handleChange}
                        />

                        <button
                            onClick={pagar}
                            className="w-full py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition cursor-pointer">
                            Confirmar pagamento
                        </button>

                    </div>
                </div>

                {/* HISTÓRICO */}
                <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">

                    <h3 className="text-xl font-bold mb-6">
                        Últimos pagamentos
                    </h3>

                    <div className="space-y-4">

                        <HistoryItem
                            title="Conta de luz"
                            date="Ontem"
                            value="R$ 182,00"
                        />

                        <HistoryItem
                            title="Internet"
                            date="02 Jun"
                            value="R$ 99,90"
                        />

                        <HistoryItem
                            title="Academia"
                            date="28 Mai"
                            value="R$ 75,00"
                        />

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- COMPONENTES ---------- */

function Input({ name, placeholder, value, onChange }: PagamentosInputProps) {
    return (
        <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-sm text-white outline-none focus:border-[#CFAA56]/40 focus:bg-white/[0.04] transition"/>
    );
}

function Action({ icon, label }: PagamentosActionProps) {
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

function HistoryItem({ title, date, value }: HistoryItemProps) {
    return (
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#CFAA56]/20 text-[#CFAA56]">
                    <FiBarChart />
                </div>

                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-gray-500">{date}</p>
                </div>
            </div>

            <span className="font-bold text-red-400">
                {value}
            </span>
        </div>
    );
}
