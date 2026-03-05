"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiDollarSign, FiTrendingUp, FiClock } from "react-icons/fi";
import { SummaryCardProps } from "@/types/Emprestimos";

export default function EmprestimosPage() {
    const router = useRouter();

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

    if (isLoading || !usuario) {
        return (
            <AppLayout
                title="Empréstimos"
                subtitle="Simule e contrate crédito com facilidade"
                user={usuario}
                conta={conta}
            >
                <div className="min-h-screen flex items-center justify-center text-[#CFAA56]">
                    <p>Carregando...</p>
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
            {/* CARDS */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <SummaryCard
                    icon={<FiDollarSign />}
                    title="Limite disponível"
                    value="--"
                />

                <SummaryCard
                    icon={<FiTrendingUp />}
                    title="Taxa estimada"
                    value="--"
                />

                <SummaryCard
                    icon={<FiClock />}
                    title="Prazo máximo"
                    value="--"
                />
            </div>

            {/* AVISO */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-10 text-center">
                <h2 className="text-2xl font-bold mb-3">
                    Empréstimos em breve
                </h2>

                <p className="text-gray-400">
                    Estamos preparando a funcionalidade de empréstimos.
                    Em breve você poderá simular e contratar crédito
                    diretamente pelo aplicativo.
                </p>
            </div>
        </AppLayout>
    );
}

/* COMPONENTE CARD */

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