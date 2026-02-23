"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../components/AppLayout";
import { FiInfo, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

type DialogConfig = {
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
};

export default function DepositoPage() {
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
        const carregarDados = () => {
            const data = localStorage.getItem("data");

            if (!data) {
                router.push("/login");
                return;
            }

            try {
                const parsed = JSON.parse(data);
                setUsuario(parsed.usuario);
                setConta(parsed.conta);
            } catch {
                localStorage.removeItem("data");
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        carregarDados();
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

    const formatarMoeda = (valor: number) =>
        new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(valor);

    async function handleDeposito() {
        if (!valor || Number(valor) <= 0 || !conta) {
            setDialog({
                isOpen: true,
                type: "error",
                title: "Valor inválido",
                message: "Informe um valor válido para depósito.",
            });
            return;
        }

        setLoading(true);

        try {
            const data = localStorage.getItem("data");
            if (!data) return router.push("/login");

            const parsed = JSON.parse(data);

            const response = await fetch(
                "https://api-atlasbank.onrender.com/transacoes/deposito",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${parsed.token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        conta_origem: conta.numero_conta,
                        valor: Number(valor),
                        descricao: descricao || "Depósito simulado",
                    }),
                }
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao realizar depósito");
            }

            setConta(prev =>
                prev ? { ...prev, saldo: (prev.saldo || 0) + Number(valor) } : prev
            );

            setDialog({
                isOpen: true,
                type: "success",
                title: "Depósito realizado!",
                message: "O valor foi creditado com sucesso na sua conta.",
            });

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

    if (isLoading || !usuario) {
        return (
            <AppLayout
                title="Depósito"
                subtitle="Adicione saldo à sua conta"
                user={usuario}
                conta={conta}
            >
                <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                    Carregando dados do usuário...
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Depósito"
            subtitle="Adicione saldo à sua conta"
            user={usuario}
            conta={conta}
        >
            {/* Aviso */}
            <div className="bg-[#111] border border-[#CFAA56]/30 rounded-3xl p-6 mb-8 flex gap-4">
                <div className="text-[#CFAA56] mt-1">
                    <FiInfo size={22} />
                </div>
                <p className="text-base md:text-lg text-gray-300 leading-relaxed">
                    Esta funcionalidade simula uma operação de depósito, onde o valor é creditado na sua conta para fins de teste e demonstração do sistema.
                </p>
            </div>

            {/* Saldo */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 mb-8">
                <p className="text-gray-400 text-sm mb-2">Saldo disponível</p>
                <h2 className="text-3xl font-bold text-[#CFAA56]">
                    {formatarMoeda(conta?.saldo || 0)}
                </h2>
            </div>

            {/* Formulário */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6">
                <h3 className="text-lg font-bold mb-4">Realizar Depósito</h3>

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
                        onClick={handleDeposito}
                        disabled={loading}
                        className="mt-2 py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50"
                    >
                        {loading ? "Processando..." : "Confirmar Depósito"}
                    </button>
                </div>
            </div>

            {/* Modal */}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-3xl p-6 text-center">
                        <div className="flex justify-center mb-4">
                            {dialog.type === "success" ? (
                                <FiCheckCircle size={36} className="text-green-400" />
                            ) : (
                                <FiAlertTriangle size={36} className="text-red-400" />
                            )}
                        </div>

                        <h3 className="text-xl font-bold mb-2">{dialog.title}</h3>
                        <p className="text-gray-400 mb-6">{dialog.message}</p>

                        <button
                            onClick={() =>
                                setDialog(prev => ({ ...prev, isOpen: false }))
                            }
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20"
                        >
                            Entendi
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}