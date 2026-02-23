"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiLock, FiSettings, FiPlus } from "react-icons/fi";
import { FaCreditCard } from "react-icons/fa6";
import { CardActionProps, Cartao, CartaoAPI } from "@/types/Cartao";

function mapearCartaoAPI(api: CartaoAPI): Cartao {
    return {
        id: api.id_cartao,
        numero_cartao: api.numero_cartao,
        tipo: api.tipo,
        bandeira: api.bandeira,
        status_cartao: api.status_cartao,
        validade: api.validade,
        limite_credito: api.limite_credito ?? 0,
        limite_utilizado: api.limite_utilizado ?? 0
    };
}

export default function CartoesPage() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [cartoes, setCartoes] = useState<Cartao[]>([]);
    const [selecionado, setSelecionado] = useState<Cartao | null>(null);

    useEffect(() => {
        const carregarDados = async () => {
            const data = localStorage.getItem("data");

            if (!data) {
                router.push("/login");
                return;
            }

            try {
                const parsedData = JSON.parse(data);
                setUsuario(parsedData.usuario);
                setConta(parsedData.conta);

                const idConta = parsedData.conta.id_conta;

                const response = await fetch(
                    `https://api-atlasbank.onrender.com/cartoes/conta/${idConta}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${parsedData.token}`,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Erro ao buscar cartões");
                }

                const cartoesAPI = await response.json();
                const cartoesMapeados = cartoesAPI.map(mapearCartaoAPI);
                setCartoes(cartoesMapeados);

                if (cartoesMapeados.length > 0) {
                    setSelecionado(cartoesMapeados[0]);
                }

            } catch (error) {
                console.error("Erro ao carregar cartões:", error);
            } finally {
                setIsLoading(false);
            }
        };

        carregarDados();
    }, [router]);

    async function novoCartao() {
        try {
            const data = localStorage.getItem("data");

            if (!data) return router.push("/login");

            const dataParsed = JSON.parse(data);

            const response = await fetch(
                "https://api-atlasbank.onrender.com/cartoes",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${dataParsed.token}`,
                    },
                    body: JSON.stringify({ conta_id: dataParsed.conta.id_conta }),
                }
            );

            if (!response.ok) throw new Error();

            const cartaoCriado = mapearCartaoAPI(await response.json());

            setCartoes(prev => [...prev, cartaoCriado]);
            setSelecionado(cartaoCriado);

        } catch {
            console.error("Erro ao criar cartão");
        }
    }

    async function bloquearCartao(cartaoId: number) {
        try {
            const data = localStorage.getItem("data");
            if (!data) return router.push("/login");

            const dataParsed = JSON.parse(data);
            const response = await fetch(
                `https://api-atlasbank.onrender.com/cartoes/${cartaoId}/bloquear`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${dataParsed.token}`,
                    },
                }
            );

            if (response.ok) {
                setCartoes(prev =>
                    prev.map(c =>
                        c.id === cartaoId
                            ? { ...c, status_cartao: "BLOQUEADO" }
                            : c
                    )
                );

                setSelecionado(prev =>
                    prev ? { ...prev, status_cartao: "BLOQUEADO" } : prev
                );
            }
        } catch (error) {
            console.error("Erro ao bloquear cartão:", error);
        }

    }

    async function desbloquearCartao(cartaoId: number) {
        try {
            const data = localStorage.getItem("data");
            if (!data) return router.push("/login");

            const dataParsed = JSON.parse(data);
            const response = await fetch(
                `https://api-atlasbank.onrender.com/cartoes/${cartaoId}/desbloquear`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${dataParsed.token}`,
                    },
                }
            );

            if (response.ok) {
                setCartoes(prev =>
                    prev.map(c =>
                        c.id === cartaoId
                            ? { ...c, status_cartao: "ATIVO" }
                            : c
                    )
                );

                setSelecionado(prev =>
                    prev ? { ...prev, status_cartao: "ATIVO" } : prev
                );
            }
        } catch (error) {
            console.error("Erro ao desbloquear cartão:", error);
        }
    }

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(valor);
    };

    if (isLoading || !usuario) {
        return (
            <AppLayout
                title="Cartões"
                subtitle="Gerencie seus cartões Atlas"
                user={usuario}
                conta={conta}
            >
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                    <p>Carregando cartões...</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout
            title="Cartões"
            subtitle="Gerencie seus cartões Atlas"
            user={usuario}
            conta={conta}
        >
            {cartoes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <FaCreditCard className="text-6xl text-[#CFAA56] mb-6 opacity-70" />

                    <h2 className="text-xl font-semibold mb-2">
                        Você ainda não possui cartões
                    </h2>

                    <p className="text-gray-400 mb-6 max-w-md">
                        Crie seu primeiro cartão Atlas para começar a usar todas as funcionalidades.
                    </p>

                    <button
                        onClick={novoCartao}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black font-semibold hover:brightness-110 cursor-pointer transition"
                    >
                        <FiPlus />
                        Criar cartão
                    </button>
                </div>
            )}

            {cartoes.length > 0 && (
                <>
                    {/* SELETOR */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                        {cartoes.map(cartao => (
                            <button
                                key={cartao.id}
                                onClick={() => setSelecionado(cartao)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition
          ${selecionado?.id === cartao.id
                                        ? "bg-[#CFAA56]/10 border-[#CFAA56]"
                                        : "border-white/10 hover:border-white/30"
                                    }`}
                            >
                                <FaCreditCard className="text-[#CFAA56]" />
                                <span className="text-sm">
                                    {cartao.tipo} • {cartao.numero_cartao.slice(-4)}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* CARTÃO PRINCIPAL */}
                    {selecionado && (
                        <div className="mb-10">
                            <div className="relative rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-[#1b1b1b] via-[#0b0b0b] to-black shadow-xl">

                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-gray-400 text-sm">
                                            Atlas {selecionado.tipo}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {selecionado.bandeira}
                                        </p>
                                    </div>

                                    <span className={`text-xs px-3 py-1 rounded-full 
              ${selecionado.status_cartao === "ATIVO"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-red-500/20 text-red-400"
                                        }`}>
                                        {selecionado.status_cartao}
                                    </span>
                                </div>

                                <h2 className="tracking-[0.35em] text-2xl md:text-3xl font-light mb-8">
                                    **** **** **** {selecionado.numero_cartao.slice(-4)}
                                </h2>

                                <div className="flex justify-between">
                                    <span className="uppercase text-sm text-gray-300">
                                        {usuario.nome_completo}
                                    </span>
                                    <span className="text-gray-400">
                                        {selecionado.validade}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AÇÕES */}
                    <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
                        <CardAction
                            icon={<FiLock />}
                            label={selecionado?.status_cartao === "ATIVO" ? "Bloquear" : "Desbloquear"}
                            onClick={() => {
                                if (!selecionado) return;

                                if (selecionado.status_cartao === "ATIVO") {
                                    bloquearCartao(selecionado.id);
                                } else {
                                    desbloquearCartao(selecionado.id);
                                }
                            }}
                        />
                        <CardAction icon={<FiSettings />} label="Configurar" />
                        <CardAction icon={<FiPlus />} label="Criar" />
                    </div>

                    {/* LIMITE REAL DO CARTÃO */}
                    {selecionado && (
                        <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6 mb-8">
                            <h3 className="mb-2 text-sm text-gray-400">
                                Limite disponível
                            </h3>

                            <p className="text-3xl font-bold text-[#F4E3B2] mb-4">
                                {formatarMoeda(
                                    selecionado.limite_credito - selecionado.limite_utilizado
                                )}
                            </p>

                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full bg-gradient-to-r from-[#CFAA56] to-[#9B7C37]"
                                    style={{
                                        width: `${(selecionado.limite_utilizado /
                                            selecionado.limite_credito) *
                                            100}%`
                                    }}
                                />
                            </div>

                            <div className="border-t border-white/5 pt-4">
                                <h3 className="text-sm text-gray-400 mb-1">
                                    Limite utilizado
                                </h3>
                                <p className="text-xl font-semibold">
                                    {formatarMoeda(selecionado.limite_utilizado)}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
}

function CardAction({ icon, label, onClick }: CardActionProps & { onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 transition-all cursor-pointer"
        >
            <div className="text-xl text-[#CFAA56]">{icon}</div>
            <span className="text-sm text-gray-300">{label}</span>
        </button>
    );
}