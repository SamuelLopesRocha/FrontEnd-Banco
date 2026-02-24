"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../components/AppLayout";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta";

import { FiLock, FiSettings, FiPlus, FiTrash, FiX, FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";
import { FaCreditCard } from "react-icons/fa6";
import { CardActionProps, Cartao, CartaoAPI } from "@/types/Cartao";

type DialogConfig = {
    isOpen: boolean;
    type: 'success' | 'confirm' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
};

function mapearCartaoAPI(api: CartaoAPI): Cartao {
    return {
        _id: api._id,
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

    // Estados dos Modais
    const [dialog, setDialog] = useState<DialogConfig>({ isOpen: false, type: 'success', title: '', message: '' });
    
    // Estados do Modal de Limite
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [novoLimite, setNovoLimite] = useState<string | number>("");
    const [isProcessing, setIsProcessing] = useState(false);

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

                const response = await fetch(`https://api-atlasbank.onrender.com/cartoes/meus`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${parsedData.token}`,
                    },
                });

                if (!response.ok) throw new Error("Erro ao buscar cartões");

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

    // ==========================================
    // CRIAR CARTÃO (COM TRAVA DE 5 CARTÕES)
    // ==========================================
    async function novoCartao() {
        // TRAVA: Máximo de 5 cartões
        if (cartoes.length >= 5) {
            setDialog({ 
                isOpen: true, 
                type: 'error', 
                title: 'Limite Atingido', 
                message: 'Você já possui o limite máximo de 5 cartões permitidos em sua conta.' 
            });
            return;
        }

        setIsProcessing(true);
        try {
            const data = localStorage.getItem("data");
            if (!data) return router.push("/login");

            const dataParsed = JSON.parse(data);
            const response = await fetch("https://api-atlasbank.onrender.com/cartoes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dataParsed.token}`,
                },
                body: JSON.stringify({ conta_id: dataParsed.conta.id_conta }),
            });

            if (!response.ok) throw new Error("Não foi possível emitir o cartão no momento.");

            const cartaoCriado = mapearCartaoAPI(await response.json());
            setCartoes(prev => [...prev, cartaoCriado]);
            setSelecionado(cartaoCriado);

            setDialog({ isOpen: true, type: 'success', title: 'Cartão Emitido!', message: 'Seu novo cartão Atlas já está disponível para uso.' });
        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro na emissão', message: error.message });
        } finally {
            setIsProcessing(false);
        }
    }

    // ==========================================
    // DELETAR CARTÃO
    // ==========================================
    function pedirConfirmacaoExclusao() {
        if (!selecionado) return;
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Excluir Cartão?',
            message: `Tem certeza que deseja cancelar o cartão final ${selecionado.numero_cartao.slice(-4)}? Esta ação é irreversível.`,
            onConfirm: () => executarExclusaoCartao(selecionado._id)
        });
    }

    async function executarExclusaoCartao(cartaoId: string) {
        setDialog({ ...dialog, isOpen: false });
        try {
            const data = localStorage.getItem("data");
            if (!data) return;
            const dataParsed = JSON.parse(data);

            const response = await fetch(`https://api-atlasbank.onrender.com/cartoes/${cartaoId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${dataParsed.token}` }
            });

            if (!response.ok) throw new Error("Erro ao excluir o cartão.");

            const novaLista = cartoes.filter(c => c._id !== cartaoId);
            setCartoes(novaLista);
            setSelecionado(novaLista.length > 0 ? novaLista[0] : null);

            setDialog({ isOpen: true, type: 'success', title: 'Cartão Cancelado', message: 'O cartão foi excluído e cancelado permanentemente.' });
        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro', message: error.message });
        }
    }

    // ==========================================
    // ALTERAR LIMITE
    // ==========================================
    function abrirModalLimite() {
        if (!selecionado) return;
        setNovoLimite(selecionado.limite_credito);
        setShowLimitModal(true);
    }

    async function handleAlterarLimite() {
        if (!selecionado || novoLimite === "") return;
        setIsProcessing(true);
        try {
            const data = localStorage.getItem("data");
            if (!data) return;
            const dataParsed = JSON.parse(data);

            const response = await fetch(`https://api-atlasbank.onrender.com/cartoes/${selecionado._id}/limite`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dataParsed.token}`
                },
                body: JSON.stringify({ novoLimite: Number(novoLimite) })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Erro ao alterar o limite.");

            setCartoes(prev => prev.map(c => c._id === selecionado._id ? { ...c, limite_credito: result.limite_total } : c));
            setSelecionado(prev => prev ? { ...prev, limite_credito: result.limite_total } : null);
            setShowLimitModal(false);

            setDialog({ isOpen: true, type: 'success', title: 'Limite Atualizado', message: 'O limite do seu cartão foi ajustado com sucesso.' });
        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Ajuste Negado', message: error.message });
        } finally {
            setIsProcessing(false);
        }
    }

    // ==========================================
    // BLOQUEAR / DESBLOQUEAR
    // ==========================================
    async function alternarBloqueio(cartaoId: string, statusAtual: string) {
        setIsProcessing(true);
        const acao = statusAtual === "ATIVO" ? "bloquear" : "desbloquear";
        
        try {
            const data = localStorage.getItem("data");
            if (!data) return;
            const dataParsed = JSON.parse(data);

            const response = await fetch(`https://api-atlasbank.onrender.com/cartoes/${cartaoId}/${acao}`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${dataParsed.token}` }
            });

            if (!response.ok) throw new Error(`Não foi possível ${acao} o cartão.`);

            const novoStatus = acao === "bloquear" ? "BLOQUEADO" : "ATIVO";

            setCartoes(prev => prev.map(c => c._id === cartaoId ? { ...c, status_cartao: novoStatus } : c));
            setSelecionado(prev => prev ? { ...prev, status_cartao: novoStatus } : null);

            setDialog({ 
                isOpen: true, type: 'success', 
                title: acao === "bloquear" ? 'Cartão Bloqueado' : 'Cartão Desbloqueado', 
                message: `O cartão foi ${acao === "bloquear" ? 'bloqueado temporariamente' : 'desbloqueado e está pronto para uso'}.` 
            });
        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro de Segurança', message: error.message });
        } finally {
            setIsProcessing(false);
        }
    }

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    };

    if (isLoading || !usuario) {
        return (
            <AppLayout title="Cartões" subtitle="Gerencie seus cartões Atlas" user={usuario} conta={conta}>
                <div className="min-h-screen flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout title="Cartões" subtitle="Gerencie seus cartões Atlas" user={usuario} conta={conta}>
            {cartoes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <FaCreditCard className="text-6xl text-[#CFAA56] mb-6 opacity-70" />
                    <h2 className="text-xl font-semibold mb-2">Você ainda não possui cartões</h2>
                    <p className="text-gray-400 mb-6 max-w-md">Crie seu primeiro cartão Atlas para começar a usar todas as funcionalidades.</p>
                    <button onClick={novoCartao} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] text-black font-semibold hover:brightness-110 cursor-pointer transition disabled:opacity-50">
                        <FiPlus /> Emitir Cartão
                    </button>
                </div>
            )}

            {cartoes.length > 0 && selecionado && (
                <>
                    {/* SELETOR */}
                    <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
                        {cartoes.map(cartao => (
                            <button
                                key={cartao.id}
                                onClick={() => setSelecionado(cartao)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border whitespace-nowrap transition cursor-pointer
                                    ${selecionado._id === cartao._id ? "bg-[#CFAA56]/10 border-[#CFAA56]" : "border-white/10 hover:border-white/30"}`}
                            >
                                <FaCreditCard className="text-[#CFAA56]" />
                                <span className="text-sm">{cartao.tipo} • {cartao.numero_cartao.slice(-4)}</span>
                            </button>
                        ))}
                    </div>

                    {/* CARTÃO PRINCIPAL */}
                    <div className="mb-10">
                        <div className="relative rounded-3xl p-8 border border-white/10 bg-gradient-to-br from-[#1b1b1b] via-[#0b0b0b] to-black shadow-xl overflow-hidden">
                            <div className="absolute w-96 h-96 bg-[#CFAA56]/20 blur-[160px] -top-40 -right-32 rounded-full pointer-events-none" />
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <p className="text-gray-400 text-sm">Atlas {selecionado.tipo}</p>
                                    <p className="text-xs text-gray-500 uppercase">{selecionado.bandeira}</p>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium tracking-wide
                                    ${selecionado.status_cartao === "ATIVO" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                    {selecionado.status_cartao}
                                </span>
                            </div>
                            <h2 className="tracking-[0.35em] text-2xl md:text-3xl font-light mb-8 relative z-10">
                                **** **** **** {selecionado.numero_cartao.slice(-4)}
                            </h2>
                            <div className="flex justify-between relative z-10">
                                <span className="uppercase text-sm text-gray-300 tracking-wider">{usuario.nome_completo}</span>
                                <span className="text-gray-400">{selecionado.validade}</span>
                            </div>
                        </div>
                    </div>

                    {/* AÇÕES */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
                        <CardAction
                            icon={<FiLock />}
                            label={selecionado.status_cartao === "ATIVO" ? "Bloquear" : "Desbloquear"}
                            onClick={() => alternarBloqueio(selecionado._id, selecionado.status_cartao)}
                        />
                        <CardAction icon={<FiSettings />} label="Ajustar Limite" onClick={abrirModalLimite} />
                        <CardAction icon={<FiPlus />} label="Novo Cartão" onClick={novoCartao} />
                        <CardAction icon={<FiTrash />} label="Deletar" onClick={pedirConfirmacaoExclusao} />
                    </div>

                    {/* VISUALIZAÇÃO DO LIMITE (Fora do Modal) */}
                    <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6 mb-8">
                        <h3 className="mb-2 text-sm text-gray-400">Limite disponível</h3>
                        <p className="text-3xl font-bold text-[#F4E3B2] mb-4">
                            {formatarMoeda(selecionado.limite_credito - selecionado.limite_utilizado)}
                        </p>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-full bg-gradient-to-r from-[#CFAA56] to-[#9B7C37] transition-all duration-500"
                                style={{ width: `${selecionado.limite_credito === 0 ? 0 : (selecionado.limite_utilizado / selecionado.limite_credito) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-4">
                            <div>
                                <h3 className="text-sm text-gray-400 mb-1">Limite utilizado</h3>
                                <p className="text-lg font-semibold">{formatarMoeda(selecionado.limite_utilizado)}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm text-gray-400 mb-1">Limite Total</h3>
                                <p className="text-lg font-semibold">{formatarMoeda(selecionado.limite_credito)}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL DE AJUSTAR LIMITE (ESTILO NUBANK) */}
            {showLimitModal && selecionado && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Meus limites</h3>
                            <button onClick={() => setShowLimitModal(false)} className="text-gray-400 hover:text-white"><FiX size={24}/></button>
                        </div>
                        
                        {/* Textos de Valor - Estilo Referência */}
                        <div className="text-center mb-8 mt-4">
                            <h2 className="text-4xl font-bold text-white mb-2">
                                {formatarMoeda(Number(novoLimite))}
                            </h2>
                            <p className="text-sm font-semibold text-green-400">
                                {formatarMoeda(Math.max(0, Number(novoLimite) - selecionado.limite_utilizado))} disponível para uso
                            </p>
                        </div>

                        {/* Barra Slider com bolinha */}
                        <div className="mb-6 px-2">
                            <input 
                                type="range" 
                                min={selecionado.limite_utilizado} 
                                max={conta?.limite_credito || 10000} // Maximo baseado na conta ou num fallback
                                step="10"
                                value={novoLimite}
                                onChange={(e) => setNovoLimite(e.target.value)}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#CFAA56]"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-3 font-medium">
                                <span>0</span>
                                <span>{formatarMoeda(conta?.limite_credito || 10000)}</span>
                            </div>
                        </div>

                        {/* Input Numérico Opcional */}
                        <div className="mb-8">
                            <label className="text-xs text-gray-500 mb-2 block font-medium">Ou digite o valor exato:</label>
                            <input 
                                type="number" 
                                value={novoLimite}
                                onChange={(e) => setNovoLimite(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[#CFAA56] text-center font-bold text-lg"
                            />
                        </div>

                        <button 
                            onClick={handleAlterarLimite} 
                            disabled={isProcessing || novoLimite === ""} 
                            className="w-full py-4 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50 text-lg"
                        >
                            {isProcessing ? "Ajustando..." : "Confirmar ajuste"}
                        </button>
                    </div>
                </div>
            )}

            {/* DIÁLOGO CUSTOMIZADO GLOBAL */}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
                        <div className="flex justify-center mb-4">
                            {dialog.type === 'success' && <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center"><FiCheckCircle size={32} /></div>}
                            {dialog.type === 'error' && <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center"><FiAlertTriangle size={32} /></div>}
                            {dialog.type === 'confirm' && <div className="w-16 h-16 rounded-full bg-[#CFAA56]/20 text-[#CFAA56] flex items-center justify-center"><FiInfo size={32} /></div>}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-white">{dialog.title}</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">{dialog.message}</p>
                        <div className="flex gap-3">
                            {dialog.type === 'confirm' ? (
                                <>
                                    <button onClick={() => setDialog({ ...dialog, isOpen: false })} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition">
                                        Cancelar
                                    </button>
                                    <button onClick={dialog.onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-400 transition">
                                        Confirmar
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setDialog({ ...dialog, isOpen: false })} className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">
                                    Entendi
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

function CardAction({ icon, label, onClick }: CardActionProps & { onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 transition-all cursor-pointer">
            <div className="text-xl text-[#CFAA56]">{icon}</div>
            <span className="text-sm text-gray-300">{label}</span>
        </button>
    );
}