"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import AppLayout from "../../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiArrowLeft, FiFileText } from "react-icons/fi";

import type { CartaoAPI } from "@/types/Cartao";

const API = "https://api-atlasbank.onrender.com";

const MONGO_OBJECT_ID = /^[a-f\d]{24}$/i;

type FaturaRow = {
    id_fatura: number;
    cartao_id: number;
    mes_referencia: string;
    valor_total: number;
    data_fechamento: string;
    data_vencimento: string;
    status_fatura: string;
};

function FaturasContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cartaoMongoId = searchParams.get("cartao");

    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [faturas, setFaturas] = useState<FaturaRow[]>([]);
    const [erro, setErro] = useState<string | null>(null);
    const [rotuloCartao, setRotuloCartao] = useState<string>("");

    const formatarMoeda = (valor: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

    const carregar = useCallback(async () => {
        setErro(null);
        setLoading(true);

        const data = localStorage.getItem("data");
        if (!data) {
            router.push("/login");
            return;
        }

        let parsed: { token?: string; usuario?: UsuarioAPI; conta?: Conta };
        try {
            parsed = JSON.parse(data);
        } catch {
            localStorage.removeItem("data");
            router.push("/login");
            return;
        }

        if (!parsed.token || !parsed.usuario || !parsed.conta) {
            localStorage.removeItem("data");
            router.push("/login");
            return;
        }

        setUsuario(parsed.usuario);
        setConta(parsed.conta);

        if (!cartaoMongoId || !MONGO_OBJECT_ID.test(cartaoMongoId)) {
            setErro("Link inválido. Abra as faturas a partir da tela de cartões.");
            setRotuloCartao("");
            setFaturas([]);
            setLoading(false);
            return;
        }

        try {
            const resCartoes = await fetch(`${API}/cartoes/meus`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${parsed.token}`,
                },
            });

            if (resCartoes.status === 401) {
                localStorage.removeItem("data");
                router.push("/login");
                return;
            }

            if (!resCartoes.ok) {
                setErro("Não foi possível validar o cartão.");
                setFaturas([]);
                return;
            }

            const cartoes = (await resCartoes.json()) as CartaoAPI[];
            const lista = Array.isArray(cartoes) ? cartoes : [];
            const cartao = lista.find((c) => c._id === cartaoMongoId);

            if (!cartao) {
                setErro("Cartão não encontrado ou não pertence à sua conta.");
                setRotuloCartao("");
                setFaturas([]);
                return;
            }

            const ultimos = cartao.numero_cartao?.slice(-4) ?? "••••";
            setRotuloCartao(`${cartao.tipo} •••• ${ultimos}`);

            const res = await fetch(`${API}/faturas/cartao/${cartao.id_cartao}`, {
                headers: { Accept: "application/json" },
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setErro((body as { erro?: string }).erro || "Não foi possível carregar as faturas.");
                setFaturas([]);
                return;
            }

            const json = (await res.json()) as FaturaRow[];
            setFaturas(Array.isArray(json) ? json : []);
        } catch {
            setErro("Erro de rede ao buscar faturas.");
            setFaturas([]);
        } finally {
            setLoading(false);
        }
    }, [cartaoMongoId, router]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    if (loading || !usuario) {
        return (
            <AppLayout title="Faturas" subtitle="Histórico do cartão" user={usuario} conta={conta}>
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Faturas" subtitle={rotuloCartao || "Cartão selecionado"} user={usuario} conta={conta}>
            <Link
                href="/cartao"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#CFAA56] mb-6 transition-colors"
            >
                <FiArrowLeft /> Voltar aos cartões
            </Link>

            {erro && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 mb-6">
                    {erro}
                </div>
            )}

            {!erro && faturas.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-10 text-center text-gray-400">
                    <FiFileText className="mx-auto text-4xl text-[#CFAA56]/60 mb-4" />
                    <p>Nenhuma fatura encontrada para este cartão.</p>
                </div>
            )}

            {faturas.length > 0 && (
                <div className="space-y-3">
                    {faturas.map((f) => (
                        <div
                            key={f.id_fatura}
                            className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Referência</p>
                                <p className="font-semibold text-white">{f.mes_referencia}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Venc.{" "}
                                    {new Date(f.data_vencimento).toLocaleDateString("pt-BR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Total</p>
                                <p className="text-xl font-bold text-[#F4E3B2]">{formatarMoeda(Number(f.valor_total) || 0)}</p>
                                <span
                                    className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                                        f.status_fatura === "PAGA"
                                            ? "bg-green-500/20 text-green-400"
                                            : f.status_fatura === "FECHADA"
                                              ? "bg-amber-500/20 text-amber-300"
                                              : f.status_fatura === "ATRASADA"
                                                ? "bg-red-500/20 text-red-400"
                                                : "bg-white/10 text-gray-300"
                                    }`}
                                >
                                    {f.status_fatura}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}

export default function FaturasCartaoPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#030303] flex items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56]" />
                </div>
            }
        >
            <FaturasContent />
        </Suspense>
    );
}
