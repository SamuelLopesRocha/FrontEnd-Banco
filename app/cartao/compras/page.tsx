"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import AppLayout from "../../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiArrowLeft, FiShoppingCart } from "react-icons/fi";

const API = "https://api-atlasbank.onrender.com";

const MONGO_OBJECT_ID = /^[a-f\d]{24}$/i;

type CompraRow = {
    id_compra: number;
    cartao_id: string | { toString(): string };
    valor_total: unknown;
    quantidade_parcelas?: number;
    descricao: string;
    data_compra: string;
    status_compra: string;
};

function parseValorTotal(v: unknown): number {
    if (v == null) return 0;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
    }
    if (typeof v === "object" && v !== null && "$numberDecimal" in v) {
        const s = String((v as { $numberDecimal: string }).$numberDecimal);
        const n = parseFloat(s);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

function normalizeCartaoId(id: CompraRow["cartao_id"]): string {
    if (id == null) return "";
    if (typeof id === "string") return id;
    if (typeof id === "object") {
        const o = id as Record<string, unknown>;
        if (typeof o.$oid === "string") return o.$oid;
        if ("toString" in id && typeof (id as { toString(): string }).toString === "function") {
            return String((id as { toString(): string }).toString());
        }
    }
    return String(id);
}

function ComprasContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cartaoMongoId = searchParams.get("cartao");

    const [loading, setLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [compras, setCompras] = useState<CompraRow[]>([]);
    const [erro, setErro] = useState<string | null>(null);

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
            setErro("Link inválido. Abra as compras a partir da tela de cartões.");
            setCompras([]);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API}/compras-cartao`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${parsed.token}`,
                },
            });

            if (res.status === 401) {
                localStorage.removeItem("data");
                router.push("/login");
                return;
            }

            if (!res.ok) {
                setErro("Não foi possível carregar as compras.");
                setCompras([]);
                return;
            }

            const json = (await res.json()) as CompraRow[];
            const lista = Array.isArray(json) ? json : [];
            const filtradas = lista.filter((c) => normalizeCartaoId(c.cartao_id) === cartaoMongoId);
            setCompras(filtradas);
        } catch {
            setErro("Erro de rede ao buscar compras.");
            setCompras([]);
        } finally {
            setLoading(false);
        }
    }, [cartaoMongoId, router]);

    useEffect(() => {
        void carregar();
    }, [carregar]);

    if (loading || !usuario) {
        return (
            <AppLayout title="Compras no cartão" subtitle="Histórico de compras" user={usuario} conta={conta}>
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Compras no cartão" subtitle="Por cartão selecionado" user={usuario} conta={conta}>
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

            {!erro && compras.length === 0 && (
                <div className="rounded-3xl border border-white/10 bg-[#0A0A0A] p-10 text-center text-gray-400">
                    <FiShoppingCart className="mx-auto text-4xl text-[#CFAA56]/60 mb-4" />
                    <p>Nenhuma compra encontrada para este cartão.</p>
                </div>
            )}

            {compras.length > 0 && (
                <div className="space-y-3">
                    {compras.map((c) => (
                        <div
                            key={c.id_compra}
                            className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{c.descricao}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(c.data_compra).toLocaleString("pt-BR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                    {c.quantidade_parcelas != null && c.quantidade_parcelas > 1
                                        ? ` · ${c.quantidade_parcelas}x`
                                        : ""}
                                </p>
                            </div>
                            <div className="text-left sm:text-right shrink-0">
                                <p className="text-lg font-bold text-[#F4E3B2]">
                                    {formatarMoeda(parseValorTotal(c.valor_total))}
                                </p>
                                <span
                                    className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                                        c.status_compra === "ATIVA"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-white/10 text-gray-400"
                                    }`}
                                >
                                    {c.status_compra}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}

export default function ComprasCartaoPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#030303] flex items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56]" />
                </div>
            }
        >
            <ComprasContent />
        </Suspense>
    );
}
