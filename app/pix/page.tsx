"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PixActionProps, PixItemProps } from "@/types/Pix";
import AppLayout from "../components/AppLayout";
import { FaPix, FaKey, FaTrash } from "react-icons/fa6";
import { FiArrowUpRight, FiLogOut, FiX, FiPlus, FiCheckCircle, FiAlertTriangle, FiInfo, FiArrowUp, FiArrowDown } from "react-icons/fi";

// Tipagem para o nosso novo Modal de Diálogo Customizado
type DialogConfig = {
    isOpen: boolean;
    type: 'success' | 'confirm' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
};

export default function PixPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);
    const [transacoes, setTransacoes] = useState<any[]>([]);

    // Estado do Modal Customizado (Alerta/Confirmação)
    const [dialog, setDialog] = useState<DialogConfig>({
        isOpen: false, type: 'success', title: '', message: ''
    });

    // Estados das Chaves Pix
    const [minhasChaves, setMinhasChaves] = useState<any[]>([]);
    const [showChavesModal, setShowChavesModal] = useState(false);
    const [loadingChave, setLoadingChave] = useState(false);

    // Estados do Formulário de Envio
    const [showForm, setShowForm] = useState(false);
    const [chaveDestino, setChaveDestino] = useState("");
    const [valorPix, setValorPix] = useState("");
    const [loadingPix, setLoadingPix] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        async function carregarDados() {
            try {
                const resUser = await fetch("https://api-atlasbank.onrender.com/usuarios/meus-dados", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!resUser.ok) throw new Error("Sessão expirada.");
                const dataUser = await resUser.json();
                setUsuario(dataUser);

                if (dataUser.numero_conta) {
                    const resTrans = await fetch(`https://api-atlasbank.onrender.com/transacoes/${dataUser.numero_conta}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (resTrans.ok) setTransacoes(await resTrans.json());
                }

                const resChaves = await fetch("https://api-atlasbank.onrender.com/chaves-pix", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (resChaves.ok) setMinhasChaves(await resChaves.json());

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

    function handleLogout() {
        localStorage.removeItem("token");
        router.push("/login");
    }

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    // ==========================================
    // CADASTRAR NOVA CHAVE PIX
    // ==========================================
    async function handleVincularChave(tipo: string, valorChave: string) {
        setLoadingChave(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://api-atlasbank.onrender.com/chaves-pix", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ chave: valorChave, tipo_chave: tipo })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Erro ao cadastrar chave.");

            // TROCAMOS O ALERT PELO NOSSO MODAL
            setDialog({
                isOpen: true,
                type: 'success',
                title: 'Chave vinculada!',
                message: `Tudo certo! Sua chave ${tipo} foi vinculada à sua conta e já está pronta para uso.`
            });

            const resChaves = await fetch("https://api-atlasbank.onrender.com/chaves-pix", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resChaves.ok) setMinhasChaves(await resChaves.json());

        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Ops, algo deu errado', message: error.message });
        } finally {
            setLoadingChave(false);
        }
    }

    // ==========================================
    // EXCLUIR CHAVE PIX (Dividido em 2 partes)
    // ==========================================
    function pedirConfirmacaoExclusao(chave: string) {
        setDialog({
            isOpen: true,
            type: 'confirm',
            title: 'Excluir chave?',
            message: `Você tem certeza que deseja remover a chave ${chave}? Essa ação não pode ser desfeita.`,
            onConfirm: () => executarExclusaoChave(chave) // Executa isso se clicar em "Sim"
        });
    }

    async function executarExclusaoChave(chave: string) {
        setDialog({ ...dialog, isOpen: false }); // Fecha o modal de confirmação
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`https://api-atlasbank.onrender.com/chaves-pix/${chave}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Erro ao excluir chave.");

            setMinhasChaves(minhasChaves.filter(c => c.chave !== chave));

            // Aviso de sucesso simpático
            setDialog({
                isOpen: true,
                type: 'success',
                title: 'Chave removida',
                message: 'Sua chave Pix foi excluída com sucesso da sua conta.'
            });
        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro', message: error.message });
        }
    }

    // ==========================================
    // ENVIO DE PIX (Dividido em 2 partes)
    // ==========================================
    async function prepararEnvioPix() {
        if (!chaveDestino || !valorPix) {
            setDialog({ isOpen: true, type: 'error', title: 'Atenção', message: "Por favor, preencha a chave Pix e o valor antes de avançar." });
            return;
        }
        setLoadingPix(true);
        try {
            const token = localStorage.getItem("token");
            const resChave = await fetch(`https://api-atlasbank.onrender.com/chaves-pix/consultar/${chaveDestino}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const dataChave = await resChave.json();
            if (!resChave.ok) throw new Error(dataChave.error || "Chave não encontrada.");

            // Em vez de window.confirm, chamamos nosso modal customizado
            setDialog({
                isOpen: true,
                type: 'confirm',
                title: 'Confirmar Transferência',
                message: `Você está prestes a transferir ${formatarMoeda(Number(valorPix))} para ${dataChave.nome_recebedor}. Deseja confirmar esta operação?`,
                onConfirm: () => executarEnvioPix(dataChave.numero_conta_destino)
            });

        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Erro na consulta', message: error.message });
        } finally {
            setLoadingPix(false);
        }
    }

    async function executarEnvioPix(numeroContaDestino: string) {
        setDialog({ ...dialog, isOpen: false });
        setLoadingPix(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("https://api-atlasbank.onrender.com/transacoes/pix", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    conta_origem: usuario.numero_conta,
                    conta_destino: numeroContaDestino,
                    valor: Number(valorPix),
                    descricao: `Pix para a chave: ${chaveDestino}`
                })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Erro ao enviar Pix.");
            }

            setDialog({
                isOpen: true,
                type: 'success',
                title: 'Transferência Concluída!',
                message: 'O Pix foi enviado com sucesso e já está na conta do recebedor.',
                onConfirm: () => window.location.reload() // Recarrega ao fechar o sucesso
            });

        } catch (error: any) {
            setDialog({ isOpen: true, type: 'error', title: 'Falha na transferência', message: error.message });
        } finally {
            setLoadingPix(false);
        }
    }

    function gerarChaveAleatoria() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    if (isLoading || !usuario) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-[#CFAA56]">Carregando...</div>;

    const possuiCPF = minhasChaves.some(c => c.tipo_chave === 'CPF');
    const possuiEmail = minhasChaves.some(c => c.tipo_chave === 'EMAIL');
    const possuiTelefone = minhasChaves.some(c => c.tipo_chave === 'TELEFONE');

    return (
        <AppLayout title="Pix" subtitle="Envie dinheiro instantaneamente via Chave Pix" user={usuario}>
            <div className="flex justify-end mb-6">
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                    <FiLogOut /> Sair da conta
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-2">Saldo disponível</p>
                    <h2 className="text-3xl font-bold text-[#CFAA56]">
                        {formatarMoeda(usuario.saldo_disponivel || 0)}
                    </h2>
                </div>

                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <PixAction icon={<FiArrowUpRight />} label="Enviar Pix" onClick={() => setShowForm(!showForm)} />
                    <PixAction icon={<FaKey />} label="Minhas Chaves" onClick={() => setShowChavesModal(true)} />
                </div>
            </div>

            {/* FORMULÁRIO DE ENVIO DE PIX */}
            {showForm && (
                <div className="bg-[#111] border border-[#CFAA56]/30 rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Enviar Pix</h3>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><FiX size={24} /></button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Chave Pix de destino" value={chaveDestino} onChange={(e) => setChaveDestino(e.target.value)} className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[#CFAA56]" />
                        <input type="number" placeholder="Valor (R$)" value={valorPix} onChange={(e) => setValorPix(e.target.value)} className="px-4 py-3 rounded-xl bg-black border border-white/10 text-white outline-none focus:border-[#CFAA56]" />
                    </div>
                    <button onClick={prepararEnvioPix} disabled={loadingPix} className="mt-4 w-full py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50">
                        {loadingPix ? "Consultando..." : "Avançar"}
                    </button>
                </div>
            )}

            {/* MODAL DE MINHAS CHAVES */}
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
                                        <div key={chave._id} className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl">
                                            <div>
                                                <p className="font-bold text-[#CFAA56]">{chave.chave}</p>
                                                <p className="text-xs text-gray-500 uppercase">{chave.tipo_chave}</p>
                                            </div>
                                            <button onClick={() => pedirConfirmacaoExclusao(chave.chave)} className="text-red-500/50 hover:text-red-500 transition p-2">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 mb-3 font-medium uppercase tracking-wider">Vincular nova chave</p>
                            <div className="grid grid-cols-2 gap-3">
                                {!possuiCPF && (
                                    <VincularBotao label="Vincular CPF" onClick={() => handleVincularChave('CPF', usuario.cpf)} disabled={loadingChave} />
                                )}
                                {!possuiEmail && (
                                    <VincularBotao label="Vincular E-mail" onClick={() => handleVincularChave('EMAIL', usuario.email)} disabled={loadingChave} />
                                )}
                                {!possuiTelefone && (
                                    <VincularBotao label="Vincular Celular" onClick={() => handleVincularChave('TELEFONE', usuario.telefone)} disabled={loadingChave} />
                                )}
                                <VincularBotao label="Chave Aleatória" onClick={() => handleVincularChave('ALEATORIA', gerarChaveAleatoria())} disabled={loadingChave} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* O NOVO DIÁLOGO CUSTOMIZADO GLOBAL DA PÁGINA */}
            {dialog.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#0A0A0A] border border-white/10 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">

                        {/* Ícone dinâmico */}
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
                                    <button
                                        onClick={() => setDialog({ ...dialog, isOpen: false })}
                                        className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={dialog.onConfirm}
                                        className="flex-1 py-3 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition"
                                    >
                                        Confirmar
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => {
                                        setDialog({ ...dialog, isOpen: false });
                                        if (dialog.onConfirm) dialog.onConfirm();
                                    }}
                                    className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
                                >
                                    Entendi
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}


            {/* HISTÓRICO */}
            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 mt-8">
                <h3 className="text-xl font-bold mb-6">Últimas movimentações</h3>
                <div className="space-y-4">
                    {transacoes.length > 0 ? (
                        transacoes.map((t: any) => {
                            // Descobre se a conta logada foi a origem da transferência
                            const isSaida = String(t.conta_origem) === String(usuario.numero_conta);

                            // Formata a data bonitinha (se não tiver data, não quebra)
                            const rawDate = t.data_transacao || t.createdAt;
                            const formattedDate = rawDate ? new Date(rawDate).toLocaleString('pt-BR', {
                                day: '2-digit', month: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            }) : '';

                            // O Back-end envia o 'nome_envolvido'. Se não enviar, mostramos o número da conta como fallback.
                            const nomePessoa = t.nome_envolvido ? t.nome_envolvido : (isSaida ? `Conta ${t.conta_destino}` : `Conta ${t.conta_origem}`);

                            // Textos dinâmicos!
                            const titulo = isSaida ? "Pix Enviado" : "Pix Recebido";
                            const descricao = isSaida ? `Para: ${nomePessoa}` : `De: ${nomePessoa}`;

                            return (
                                <PixItem
                                    key={t._id}
                                    name={titulo}
                                    description={descricao}
                                    date={formattedDate}
                                    type={isSaida ? "saida" : "entrada"}
                                    value={formatarMoeda(t.valor)}
                                />
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

/* ---------- COMPONENTES INTERNOS ---------- */

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
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition disabled:opacity-50"
        >
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

                {/* CAIXA DO ÍCONE COM AS SETAS E CORES DINÂMICAS */}
                <div className={`min-w-[40px] h-10 rounded-lg flex items-center justify-center ${positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {positive ? <FiArrowUp size={20} /> : <FiArrowDown size={20} />}
                </div>

                {/* TEXTOS (NOME, DESCRIÇÃO E DATA) */}
                <div>
                    <p className="font-bold text-sm text-white">{name}</p>
                    {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
                    {date && <p className="text-[10px] text-gray-500 mt-1">{date}</p>}
                </div>
            </div>

            {/* VALOR */}
            <span className={`font-bold text-sm ${positive ? "text-green-400" : "text-red-400"}`}>
                {positive ? "+ " : "- "}{value}
            </span>
        </div>
    );
}