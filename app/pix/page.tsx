/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pix, PixActionProps, PixItemProps } from "@/types/Pix";
import AppLayout from "../components/AppLayout";
import { FaKey, FaTrash } from "react-icons/fa6";
import { FiArrowUpRight, FiArrowDownLeft, FiX, FiPlus, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowUp, FiArrowDown, FiCopy, FiClock } from "react-icons/fi";
import { Conta } from "@/types/Conta";
import { UsuarioAPI } from "@/types/Usuario";
import { ApiError } from "@/types/Error";
import { Transacao, TransacaoAPI } from "@/types/Extrato";

type DialogConfig = {
    isOpen: boolean;
    type: 'success' | 'confirm' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
};

type PagamentoPendente = {
    _id: string;
    valor: number;
    codigo_pix: string;
    createdAt: string;
    tipo: "unico" | "recorrente";
    status?: string;
};

export default function PixPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);

    const [dialog, setDialog] = useState<DialogConfig>({
        isOpen: false, type: 'success', title: '', message: ''
    });

    const [minhasChaves, setMinhasChaves] = useState<Pix[]>([]);
    const [showChavesModal, setShowChavesModal] = useState(false);
    const [loadingChave, setLoadingChave] = useState(false);
    const [nomesPix, setNomesPix] = useState<Record<string, string>>({});

    const [showForm, setShowForm] = useState(false);
    const [chaveDestino, setChaveDestino] = useState("");
    const [valorPix, setValorPix] = useState("");
    const [loadingPix, setLoadingPix] = useState(false);
    const [isPixCopiaECola, setIsPixCopiaECola] = useState(false);

    const [showReceberMenu, setShowReceberMenu] = useState(false);
    const [pagamentosPendentes, setPagamentosPendentes] = useState<PagamentoPendente[]>([]);
    const [showGerarPagamentoModal, setShowGerarPagamentoModal] = useState(false);

    const [receberStep, setReceberStep] = useState(1);
    const [valorReceber, setValorReceber] = useState("");
    const [tipoRecebimento, setTipoRecebimento] = useState<"unico" | "recorrente">("unico");
    const [codigoPixGerado, setCodigoPixGerado] = useState("");
    const [visualizandoPendente, setVisualizandoPendente] = useState(false);

    useEffect(() => {
        async function carregarDados() {
            const data = localStorage.getItem("data");
            if (!data) return router.push("/login");

            try {
                const parsedData = JSON.parse(data);
                const token = parsedData.token;
                const usuario: UsuarioAPI = parsedData.usuario;
                const conta: Conta = parsedData.conta;

                if (!token || !usuario || !conta) {
                    localStorage.removeItem("data");
                    return router.push("/login");
                }

                setUsuario(usuario);
                setConta(conta);

                const resTrans = await fetch(`https://api-atlasbank.onrender.com/transacoes`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resTrans.ok) {
                    const result: TransacaoAPI = await resTrans.json();
                    const apenasPix = result.dados.filter((t: Transacao) => t.tipo === "PIX_ENVIO" || t.tipo === "PIX_RECEBIMENTO");
                    setTransacoes(apenasPix);
                }

                const resChaves = await fetch("https://api-atlasbank.onrender.com/chaves-pix", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resChaves.ok) setMinhasChaves(await resChaves.json());

                // 🔥 Busca as Cobranças Pendentes no BD e filtra APENAS as que estão "PENDENTE"
                const resCobrancas = await fetch("https://api-atlasbank.onrender.com/cobrancas", { headers: { "Authorization": `Bearer ${token}` } });
                if (resCobrancas.ok) {
                    const cobrancasRaw = await resCobrancas.json();
                    setPagamentosPendentes(cobrancasRaw.filter((c: PagamentoPendente) => c.status === 'PENDENTE'));
                }

            } catch (error) {
                console.error("ERRO NO PIX:", error);
                localStorage.removeItem("token");
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        }
        carregarDados();
    }, [router]);

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    function handleChaveDestinoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setChaveDestino(val);

        if (val.startsWith("000201") && val.length > 30) {
            setIsPixCopiaECola(true);

            const marker = "530398654";
            const indexMarker = val.indexOf(marker);

            if (indexMarker !== -1) {
                const index54 = indexMarker + 7;
                const tamanhoValorStr = val.substring(index54 + 2, index54 + 4);
                const tamanhoValor = parseInt(tamanhoValorStr, 10);

                const valorReal = val.substring(index54 + 4, index54 + 4 + tamanhoValor);
                setValorPix(valorReal);
            }
        } else {
            setIsPixCopiaECola(false);
        }
    }

    async function prepararEnvioPix() {
        if (!chaveDestino || !valorPix) {
            setDialog({ isOpen: true, type: 'error', title: 'Atenção', message: "Por favor, preencha a chave Pix e o valor antes de avançar." });
            return;
        }
        setLoadingPix(true);

        let chaveParaConsultar = chaveDestino;

        if (isPixCopiaECola) {
            const indexPix01 = chaveDestino.indexOf("pix01");
            if (indexPix01 !== -1) {
                const tamanhoChaveStr = chaveDestino.substring(indexPix01 + 5, indexPix01 + 7);
                const tamanhoChave = parseInt(tamanhoChaveStr, 10);
                chaveParaConsultar = chaveDestino.substring(indexPix01 + 7, indexPix01 + 7 + tamanhoChave);
            } else {
                setDialog({ isOpen: true, type: 'error', title: 'Código Inválido', message: "O código Copia e Cola informado não parece ser válido." });
                setLoadingPix(false);
                return;
            }
        }

        try {
            const data = localStorage.getItem("data");
            const parsed = data ? JSON.parse(data) : null;
            const token = parsed?.token;

            const resChave = await fetch(`https://api-atlasbank.onrender.com/chaves-pix/consultar/${chaveParaConsultar}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const dataChave = await resChave.json();

            if (!resChave.ok) throw new Error(dataChave.error || "A chave contida neste QR Code não foi encontrada no banco de dados.");

            if (String(dataChave.numero_conta_destino) === String(conta?.numero_conta)) {
                throw new Error("Você não pode enviar um Pix para a sua própria conta.");
            }

            setDialog({
                isOpen: true,
                type: 'confirm',
                title: 'Confirmar Transferência',
                message: `Você está prestes a transferir ${formatarMoeda(Number(valorPix))} para ${dataChave.nome_recebedor}. Deseja confirmar?`,
                onConfirm: () => executarEnvioPix(chaveParaConsultar, isPixCopiaECola ? chaveDestino : undefined)
            });

        } catch (error: unknown) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro na consulta', message: (error as ApiError)?.message || "Erro desconhecido." });
        } finally {
            setLoadingPix(false);
        }
    }

    async function executarEnvioPix(chaveFinal: string, codigoOriginal?: string) {
        setDialog({ ...dialog, isOpen: false });
        setLoadingPix(true);
        try {
            const data = localStorage.getItem("data");
            const parsed = data ? JSON.parse(data) : null;
            const token = parsed?.token;

            const valorFinalFormatado = parseFloat(Number(valorPix).toFixed(2));

            const response = await fetch("https://api-atlasbank.onrender.com/transacoes/pix", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario_id: usuario?.usuario_id,
                    chave: chaveFinal,
                    valor: valorFinalFormatado,
                    descricao: isPixCopiaECola ? `Pagamento via QR Code` : `Pix para a chave: ${chaveFinal}`,
                    codigo_pix: codigoOriginal || null
                })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao enviar Pix.");
            }

            setDialog({
                isOpen: true, type: 'success', title: 'Transferência Concluída!',
                message: 'O Pix foi enviado com sucesso e já está na conta do recebedor.',
                onConfirm: () => window.location.reload()
            });

        } catch (error: unknown) {
            setDialog({ isOpen: true, type: 'error', title: 'Falha na transferência', message: (error as ApiError)?.message || "Erro desconhecido." });
        } finally {
            setLoadingPix(false);
        }
    }

    async function gerarCobrancaReceber() {
        if (minhasChaves.length === 0) {
            setDialog({
                isOpen: true, type: 'error',
                title: 'Chave Obrigatória',
                message: 'Vincule pelo menos uma Chave Pix no botão "Chaves" antes de gerar cobranças.'
            });
            setShowGerarPagamentoModal(false);
            return;
        }

        const valorStr = Number(valorReceber).toFixed(2);
        const tamValor = valorStr.length.toString().padStart(2, '0');

        const chaveUsuario = minhasChaves[0]?.chave;
        if (!chaveUsuario) {
            setDialog({
                isOpen: true, type: 'error',
                title: 'Chave Inválida',
                message: 'A chave Pix selecionada é inválida.'
            });
            return;
        }
        const tamChave = chaveUsuario.length.toString().padStart(2, '0');

        const payloadTag26 = `0014br.gov.bcb.pix01${tamChave}${chaveUsuario}`;
        const tamTag26 = payloadTag26.length.toString().padStart(2, '0');

        const payloadRealista = `00020101021126${tamTag26}${payloadTag26}52040000530398654${tamValor}${valorStr}5802BR5913ATLAS BANK6009SAO PAULO62070503***6304D12A`;

        setCodigoPixGerado(payloadRealista);
        setReceberStep(3);

        if (!visualizandoPendente) {
            try {
                const token = JSON.parse(localStorage.getItem("data") || "{}").token;
                const resCob = await fetch("https://api-atlasbank.onrender.com/cobrancas", {
                    method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ valor: Number(valorReceber), codigo_pix: payloadRealista, tipo: tipoRecebimento })
                });

                if (resCob.ok) {
                    const novaCobranca = await resCob.json();
                    setPagamentosPendentes(prev => [novaCobranca, ...prev]);
                }
            } catch (e) { console.error("Erro ao salvar cobrança", e); }
        }
    }

    function reabrirPendente(pagamento: PagamentoPendente) {
        setValorReceber(pagamento.valor.toString());
        setCodigoPixGerado(pagamento.codigo_pix);
        setTipoRecebimento(pagamento.tipo);
        setVisualizandoPendente(true);
        setReceberStep(3);
        setShowGerarPagamentoModal(true);
    }

    async function cancelarPendente(id: string) {
        setPagamentosPendentes(prev => prev.filter(p => p._id !== id));
        try {
            const token = JSON.parse(localStorage.getItem("data") || "{}").token;
            await fetch(`https://api-atlasbank.onrender.com/cobrancas/${id}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
            });
        } catch (e) { console.error(e); }
    }

    function copiarCodigoPix() {
        navigator.clipboard.writeText(codigoPixGerado);
        setDialog({ isOpen: true, type: 'success', title: 'Código Copiado!', message: 'O código Pix Copia e Cola foi copiado. Envie para quem vai te pagar.' });
    }

    async function verSaldo() {
        const data = localStorage.getItem("data");
        if (!data) return;
        const parsed = JSON.parse(data);
        try {
            const response = await fetch(`https://api-atlasbank.onrender.com/contas/${parsed.usuario.usuario_id}`, { headers: { Authorization: `Bearer ${parsed.token}` } });
            if (!response.ok) throw new Error();
            const result = await response.json();
            const saldoAPI = result?.contas?.[0]?.saldo;
            if (saldoAPI !== undefined) setConta(prev => prev ? { ...prev, saldo: saldoAPI } : prev);
        } catch (error: unknown) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro ao atualizar saldo', message: (error as ApiError)?.message || "Não foi possível atualizar o saldo." });
        }
    }

    async function buscarNomePorChave(chave: string) {
        try {
            const data = localStorage.getItem("data");
            const parsed = data ? JSON.parse(data) : null;
            const response = await fetch(`https://api-atlasbank.onrender.com/chaves-pix/consultar/${chave}`, {
                method: "GET", headers: { "Authorization": `Bearer ${parsed?.token}` }
            });
            const result = await response.json();
            setNomesPix(prev => ({ ...prev, [chave]: result.nome_recebedor }));
        } catch (error: unknown) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro ao buscar nome', message: (error as ApiError)?.message || "Não foi possível buscar o nome associado a esta chave." });
        }
    }

    useEffect(() => {
        const chavesUnicas = Array.from(new Set(transacoes.filter(t => t.chave_pix).map(t => t.chave_pix)));
        chavesUnicas.forEach(chave => { if (!nomesPix[chave]) buscarNomePorChave(chave); });
    }, [transacoes, nomesPix]);

    function pedirConfirmacaoExclusao(chave: string) {
        setDialog({
            isOpen: true, type: 'confirm', title: 'Excluir chave?',
            message: `Você tem certeza que deseja remover a chave ${chave}? Essa ação não pode ser desfeita.`,
            onConfirm: () => executarExclusaoChave(chave)
        });
    }

    async function executarExclusaoChave(chave: string) {
        setDialog({ ...dialog, isOpen: false });
        try {
            const data = localStorage.getItem("data");
            const parsed = data ? JSON.parse(data) : null;
            const response = await fetch(`https://api-atlasbank.onrender.com/chaves-pix/${chave}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${parsed?.token}` }
            });
            if (!response.ok) throw new Error("Erro ao excluir chave.");
            setMinhasChaves(minhasChaves.filter(c => c.chave !== chave));
            setDialog({ isOpen: true, type: 'success', title: 'Chave removida', message: 'Sua chave Pix foi excluída.' });
        } catch (error: unknown) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro', message: (error as ApiError)?.message || "Erro desconhecido." });
        }
    }

    async function handleVincularChave(tipo: string, valorChave: string) {
        setLoadingChave(true);
        try {
            const data = localStorage.getItem("data");
            const parsed = data ? JSON.parse(data) : null;
            const token = parsed?.token;
            const response = await fetch("https://api-atlasbank.onrender.com/chaves-pix", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ chave: valorChave, tipo_chave: tipo })
            });

            if (!response.ok) throw new Error("Erro ao cadastrar chave.");
            setDialog({ isOpen: true, type: 'success', title: 'Chave vinculada!', message: `Sua chave ${tipo} foi vinculada.` });

            const resChaves = await fetch("https://api-atlasbank.onrender.com/chaves-pix", { headers: { "Authorization": `Bearer ${token}` } });
            if (resChaves.ok) setMinhasChaves(await resChaves.json());

        } catch (error: unknown) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro', message: (error as ApiError)?.message || "Erro." });
        } finally {
            setLoadingChave(false);
        }
    }

    function gerarChaveAleatoria() { return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); }

    useEffect(() => { if (!isLoading) verSaldo(); }, [isLoading]);

    if (isLoading || !usuario || !conta) {
        return (
            <AppLayout title="Pix" subtitle="Envie e receba dinheiro instantaneamente via Pix" user={usuario} conta={conta}>
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-[#CFAA56]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CFAA56] mb-4"></div>
                </div>
            </AppLayout>
        );
    }

    const possuiCPF = minhasChaves.some(c => c.tipo_chave === 'CPF');
    const possuiEmail = minhasChaves.some(c => c.tipo_chave === 'EMAIL');
    const possuiTelefone = minhasChaves.some(c => c.tipo_chave === 'TELEFONE');

    return (
        <AppLayout title="Pix" subtitle="Envie e receba dinheiro instantaneamente via Pix" user={usuario} conta={conta}>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-2">Saldo disponível</p>
                    <h2 className="text-3xl font-bold text-[#CFAA56]">{formatarMoeda(conta?.saldo || 0)}</h2>
                </div>

                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <PixAction icon={<FiArrowUpRight />} label="Enviar" onClick={() => { setShowReceberMenu(false); setShowForm(!showForm); setIsPixCopiaECola(false); setChaveDestino(""); setValorPix(""); }} />
                    <PixAction icon={<FiArrowDownLeft />} label="Receber" onClick={() => { setShowForm(false); setShowReceberMenu(!showReceberMenu); }} />
                    <PixAction icon={<FaKey />} label="Chaves" onClick={() => setShowChavesModal(true)} />
                </div>
            </div>

            {/* MODAL DE ENVIAR PIX */}
            {showForm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-white">Enviar Pix</h3>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Chave Pix ou Copia e Cola</label>
                                <input
                                    type="text"
                                    placeholder=""
                                    value={chaveDestino}
                                    onChange={handleChaveDestinoChange}
                                    className="w-full px-4 py-4 rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none focus:border-[#CFAA56] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Valor (R$)</label>
                                <input
                                    type="number"
                                    placeholder="0,00"
                                    value={valorPix}
                                    onChange={(e) => !isPixCopiaECola && setValorPix(e.target.value)}
                                    disabled={isPixCopiaECola}
                                    className={`w-full px-4 py-4 rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none transition-all ${isPixCopiaECola ? 'opacity-50 cursor-not-allowed' : 'focus:border-[#CFAA56]'}`}
                                />
                            </div>

                            {isPixCopiaECola && (
                                <p className="text-xs text-green-400 flex items-center gap-1">
                                    <FiCheckCircle /> Valor detectado automaticamente pelo código Pix.
                                </p>
                            )}
                        </div>

                        <button
                            onClick={prepararEnvioPix}
                            disabled={loadingPix}
                            className="w-full py-4 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50 text-lg"
                        >
                            {loadingPix ? "Consultando..." : "Avançar"}
                        </button>
                    </div>
                </div>
            )}

            {/* ABA RECEBER: LISTA DE PENDENTES */}
            {showReceberMenu && (
                <div className="bg-[#111] border border-[#CFAA56]/30 rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-white">Pagamentos a receber</h3>
                        <button onClick={() => setShowReceberMenu(false)} className="text-gray-500 hover:text-white"><FiX size={24} /></button>
                    </div>

                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                        {pagamentosPendentes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
                                <FiClock className="text-gray-500 mb-2 text-2xl" />
                                <p className="text-gray-400 text-sm">Nenhuma cobrança pendente no momento.</p>
                            </div>
                        ) : (
                            pagamentosPendentes.map(p => (
                                <div key={p._id} className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl hover:bg-white/[0.04] transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center">
                                            <FiClock size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#F4E3B2]">{formatarMoeda(p.valor)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{p.tipo} • {new Date(p.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => reabrirPendente(p)} className="text-xs px-3 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition">QR Code</button>
                                        <button onClick={() => cancelarPendente(p._id)} className="text-gray-500 hover:text-red-500 p-2 transition"><FiX size={20} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button onClick={() => { setVisualizandoPendente(false); setReceberStep(1); setValorReceber(""); setShowGerarPagamentoModal(true); }} className="w-full py-4 rounded-xl border border-[#CFAA56] text-[#CFAA56] font-bold hover:bg-[#CFAA56]/10 transition flex items-center justify-center gap-2 text-lg">
                        <FiPlus size={20} /> Gerar cobrança
                    </button>
                </div>
            )}

            {/* MODAL DE GERAR COBRANÇA */}
            {showGerarPagamentoModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl">

                        {receberStep === 1 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-white">Valor a receber</h3>
                                    <button onClick={() => setShowGerarPagamentoModal(false)} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                                </div>
                                <input type="number" placeholder="R$ 0,00" value={valorReceber} onChange={(e) => setValorReceber(e.target.value)} className="w-full text-center text-4xl font-bold px-4 py-8 rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none focus:border-[#CFAA56] mb-6" />
                                <button onClick={() => setReceberStep(2)} disabled={!valorReceber || Number(valorReceber) <= 0} className="w-full py-4 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50 text-lg">Continuar</button>
                            </div>
                        )}

                        {receberStep === 2 && (
                            <div className="animate-in slide-in-from-right-4 duration-300">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-xl text-white">Forma de receber</h3>
                                    <button onClick={() => setShowGerarPagamentoModal(false)} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                                </div>
                                <div className="flex flex-col gap-4 mb-8">
                                    <button onClick={() => setTipoRecebimento("unico")} className={`text-left p-5 rounded-2xl border transition-all ${tipoRecebimento === 'unico' ? 'border-[#CFAA56] bg-[#CFAA56]/10' : 'border-white/10 hover:border-white/30 bg-[#0A0A0A]'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${tipoRecebimento === 'unico' ? 'border-[#CFAA56]' : 'border-gray-500'}`}>{tipoRecebimento === 'unico' && <div className="w-2.5 h-2.5 bg-[#CFAA56] rounded-full"></div>}</div>
                                            <p className="font-bold text-lg text-white">Receber uma vez</p>
                                        </div>
                                    </button>
                                    <button onClick={() => setTipoRecebimento("recorrente")} className={`text-left p-5 rounded-2xl border transition-all ${tipoRecebimento === 'recorrente' ? 'border-[#CFAA56] bg-[#CFAA56]/10' : 'border-white/10 hover:border-white/30 bg-[#0A0A0A]'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${tipoRecebimento === 'recorrente' ? 'border-[#CFAA56]' : 'border-gray-500'}`}>{tipoRecebimento === 'recorrente' && <div className="w-2.5 h-2.5 bg-[#CFAA56] rounded-full"></div>}</div>
                                            <div>
                                                <p className="font-bold text-lg text-white">Receber recorrente</p>
                                                <p className="text-sm text-gray-400 mt-1">Para pagamentos frequentes.</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setReceberStep(1)} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition text-base">Voltar</button>
                                    <button onClick={gerarCobrancaReceber} className="flex-1 py-4 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition text-base">Gerar QR</button>
                                </div>
                            </div>
                        )}

                        {receberStep === 3 && (
                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
                                <div className="w-full flex justify-between items-center mb-6">
                                    {!visualizandoPendente ? (
                                        <button onClick={() => setReceberStep(2)} className="text-gray-400 hover:text-white font-medium">← Voltar</button>
                                    ) : (
                                        <span className="text-[#CFAA56] font-bold text-sm">Visualização</span>
                                    )}
                                    <button onClick={() => setShowGerarPagamentoModal(false)} className="text-gray-500 hover:text-white"><FiX size={24} /></button>
                                </div>

                                <div className="bg-white p-3 rounded-2xl mb-4 shadow-[0_0_30px_rgba(207,170,86,0.15)]">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${codigoPixGerado}&margin=0`} alt="QR Code Pix" className="w-48 h-48 md:w-52 md:h-52" />
                                </div>

                                <h2 className="text-4xl font-bold text-[#CFAA56] mb-8">{formatarMoeda(Number(valorReceber))}</h2>

                                <div className="w-full bg-[#0A0A0A] border border-white/5 p-4 rounded-2xl mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-white text-sm">Pix Copia e Cola</p>
                                        <button onClick={copiarCodigoPix} className="text-[#CFAA56] hover:text-white transition flex items-center gap-1.5 bg-[#CFAA56]/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase"><FiCopy /> Copiar</button>
                                    </div>
                                    <p className="text-xs text-gray-500 break-all">{codigoPixGerado.substring(0, 50)}...</p>
                                </div>

                                <button onClick={() => setShowGerarPagamentoModal(false)} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition text-lg">
                                    Concluir e fechar
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* MODAL DE MINHAS CHAVES E OUTROS ELEMENTOS */}
            {showChavesModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-lg rounded-3xl p-6 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold">Minhas Chaves Pix</h3>
                            <button onClick={() => setShowChavesModal(false)} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                        </div>
                        <div className="mb-6 overflow-y-auto pr-2 flex-1">
                            <p className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wider">Cadastradas</p>
                            {minhasChaves.length === 0 ? (
                                <p className="text-sm text-gray-400 bg-white/5 p-4 rounded-xl text-center">Nenhuma chave vinculada.</p>
                            ) : (
                                <div className="space-y-3">
                                    {minhasChaves.map((chave) => (
                                        <div key={chave.id} className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                                            <div>
                                                <p className="font-bold text-[#CFAA56] truncate max-w-[200px]">{chave.chave}</p>
                                                <p className="text-xs text-gray-500 uppercase">{chave.tipo_chave}</p>
                                            </div>
                                            <button onClick={() => chave.chave && pedirConfirmacaoExclusao(chave.chave)} className="text-red-500/50 hover:text-red-500 transition p-2"><FaTrash /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wider">Vincular nova chave</p>
                            <div className="grid grid-cols-2 gap-3">
                                {!possuiCPF && <VincularBotao label="Vincular CPF" onClick={() => handleVincularChave('CPF', usuario.cpf)} disabled={loadingChave} />}
                                {!possuiEmail && <VincularBotao label="Vincular E-mail" onClick={() => handleVincularChave('EMAIL', usuario.email)} disabled={loadingChave} />}
                                {!possuiTelefone && <VincularBotao label="Vincular Celular" onClick={() => handleVincularChave('TELEFONE', usuario.telefone)} disabled={loadingChave} />}
                                <VincularBotao label="Chave Aleatória" onClick={() => handleVincularChave('ALEATORIA', gerarChaveAleatoria())} disabled={loadingChave} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
                                    <button onClick={() => setDialog({ ...dialog, isOpen: false })} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition">Cancelar</button>
                                    <button onClick={dialog.onConfirm} className="flex-1 py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition">Confirmar</button>
                                </>
                            ) : (
                                <button onClick={() => { setDialog({ ...dialog, isOpen: false }); if (dialog.onConfirm) dialog.onConfirm(); }} className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">Entendi</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 mt-8">
                <h3 className="text-xl font-bold mb-6">Últimas movimentações</h3>
                <div className="space-y-4">
                    {transacoes.length > 0 ? (
                        transacoes.map((t: Transacao) => {
                            const isSaida = String(t.conta_origem) === String(conta?.numero_conta);
                            const formattedDate = t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                            const nomeViaChave = t.chave_pix ? nomesPix[t.chave_pix] : null;
                            const nomePessoa = nomeViaChave ? nomeViaChave : isSaida ? `Conta ${t.conta_destino}` : `Conta ${t.conta_origem}`;
                            const titulo = isSaida ? "Pix Enviado" : "Pix Recebido";
                            const descricao = isSaida ? `Para: ${nomePessoa}` : `De: ${nomePessoa}`;

                            return (
                                <PixItem key={t.id_transacao} name={titulo} description={descricao} date={formattedDate} type={isSaida ? "saida" : "entrada"} value={formatarMoeda(t.valor)} />
                            );
                        })
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">Nenhuma transação encontrada.</p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function PixAction({ icon, label, onClick }: PixActionProps & { onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 transition-all">
            <div className="text-2xl text-[#CFAA56]">{icon}</div>
            <span className="text-sm text-gray-300 font-medium">{label}</span>
        </button>
    );
}

function VincularBotao({ label, onClick, disabled }: { label: string, onClick: () => void, disabled: boolean }) {
    return (
        <button onClick={onClick} disabled={disabled} className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition disabled:opacity-50">
            <FiPlus className="text-[#CFAA56]" />
            {label}
        </button>
    );
}

function PixItem({ name, value, type, date, description }: PixItemProps & { date?: string, description?: string }) {
    const positive = type === "entrada";
    return (
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-4">
                <div className={`min-w-[40px] h-10 rounded-lg flex items-center justify-center ${positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {positive ? <FiArrowUp size={20} /> : <FiArrowDown size={20} />}
                </div>
                <div>
                    <p className="font-bold text-sm text-white">{name}</p>
                    {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
                    {date && <p className="text-[10px] text-gray-500 mt-1">{date}</p>}
                </div>
            </div>
            <span className={`font-bold text-sm ${positive ? "text-green-400" : "text-red-400"}`}>
                {positive ? "+ " : "- "}{value}
            </span>
        </div>
    );
}