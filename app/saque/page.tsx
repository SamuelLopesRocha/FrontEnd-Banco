"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiInfo, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

type DialogConfig = {
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
};

export default function SaquePage() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [valor, setValor] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [dialog, setDialog] = useState<DialogConfig>({
        isOpen: false,
        type: "success",
        title: "",
        message: "",
    });

    useEffect(() => {
        const data = localStorage.getItem("data");

        if (!data) {
            router.push("/login");
            return;
        }

        try {
            const parsedData = JSON.parse(data);
            setUsuario(parsedData.usuario);
            setConta(parsedData.conta);
        } catch (err) {
            console.error(err);
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

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(valor);
    };

    async function handleSaque() {
        if (!valor || Number(valor) <= 0) {
            setDialog({
                isOpen: true,
                type: "error",
                title: "Valor inválido",
                message: "Informe um valor válido para saque.",
            });
            return;
        }

        if (!conta || Number(valor) > conta.saldo) {
            setDialog({
                isOpen: true,
                type: "error",
                title: "Saldo insuficiente",
                message: "Você não possui saldo suficiente para realizar esse saque.",
            });
            return;
        }

        setLoading(true);

        try {
            const data = localStorage.getItem("data");
            const parsed = data ? JSON.parse(data) : null;
            const token = parsed?.token;

            const response = await fetch(
                "https://api-atlasbank.onrender.com/transacoes/saque",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        usuario_id: usuario?.usuario_id,
                        valor: Number(valor),
                        descricao: descricao || "Saque realizado",
                    }),
                }
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao realizar saque");
            }

            setDialog({
                isOpen: true,
                type: "success",
                title: "Saque realizado!",
                message: "O valor foi debitado com sucesso da sua conta.",
            });

            await verSaldo();

            setValor("");
            setDescricao("");

        } catch (error: unknown) {
            setDialog({
                isOpen: true,
                type: "error",
                title: "Erro",
                message: error instanceof Error ? error.message : "Erro desconhecido",
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (usuario) {
            verSaldo();
        }
    }, [usuario]);

    if (isLoading || !usuario)
        return (
            <AppLayout
                title="Saque"
                subtitle="Retire saldo da sua conta"
                user={usuario}
                conta={conta}
            >
                <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                    Carregando dados do usuário...
                </div>
            </AppLayout>
        );

    return (
        <AppLayout
            title="Saque"
            subtitle="Retire saldo da sua conta"
            user={usuario}
            conta={conta}
        >
            {/* Aviso */}
            <div className="bg-[#111] border border-[#CFAA56]/30 rounded-3xl p-6 mb-8 flex gap-4">
                <div className="text-[#CFAA56] mt-1">
                    <FiInfo size={22} />
                </div>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                    Esta funcionalidade simula uma operação de saque,
                    representando a saída de saldo da conta do cliente
                    para fins de teste e demonstração do sistema.
                </p>
            </div>

            {/* Saldo */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 mb-8">
                <p className="text-gray-400 text-sm mb-2">
                    Saldo disponível
                </p>
                <h2 className="text-3xl font-bold text-[#CFAA56]">
                    {formatarMoeda(conta?.saldo || 0)}
                </h2>
            </div>

            {/* Formulário */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4">
                    Realizar Saque
                </h3>

                <div className="grid gap-4">
                    <input
                        type="number"
                        placeholder="Valor (R$)"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[#CFAA56]"
                    />

                    <input
                        type="text"
                        placeholder="Descrição (opcional)"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[#CFAA56]"
                    />

                    <button
                        onClick={handleSaque}
                        disabled={loading}
                        className="mt-2 py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50"
                    >
                        {loading ? "Processando..." : "Confirmar Saque"}
                    </button>
                </div>
            </div>

            {/* Modal */}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-3xl p-6 text-center">
                        <div className="flex justify-center mb-4">
                            {dialog.type === "success" ? (
                                <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                                    <FiCheckCircle size={32} />
                                </div>
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                                    <FiAlertTriangle size={32} />
                                </div>
                            )}
                        </div>

                        <h3 className="text-xl font-bold mb-2 text-white">
                            {dialog.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            {dialog.message}
                        </p>

                        <button
                            onClick={() => {
                                setDialog(prev => ({ ...prev, isOpen: false }));
                            }}
                            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}