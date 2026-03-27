"use client";

import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";

import AppLayout from "../components/AppLayout";
import { HistoryItemProps, PagamentosActionProps, PagamentosInputProps } from "@/types/Pagamentos";
import { UsuarioAPI } from "@/types/Usuario";
import { Conta } from "@/types/Conta"

import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "react-hot-toast";

// 🔥 Ícone FiPlusCircle restaurado no lugar da setinha
import { FiBarChart, FiClock, FiX, FiCamera, FiPlus, FiCopy, FiPlusCircle } from "react-icons/fi";
import { FaBarcode } from "react-icons/fa6";


type BoletoPendente = {
    _id: string;
    valor: number;
    linha_digitavel: string;
    codigo_barras: string;
    vencimento: string;
    createdAt: string;
};

export default function PagamentosPage() {
    const router = useRouter();
    const [codigo, setCodigo] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [usuario, setUsuario] = useState<UsuarioAPI | null>(null);
    const [conta, setConta] = useState<Conta | null>(null);

    // MODAL DE PAGAR
    const [showForm, setShowForm] = useState(false);
    const [boletoDetails, setBoletoDetails] = useState<any | null>(null);
    const [loadingPagamento, setLoadingPagamento] = useState(false);

    // MODAL E LISTA DE RECEBER/CRIAR BOLETO
    const [showReceberMenu, setShowReceberMenu] = useState(false);
    const [boletosPendentes, setBoletosPendentes] = useState<BoletoPendente[]>([]);

    const [showGerarBoletoModal, setShowGerarBoletoModal] = useState(false);
    const [gerarStep, setGerarStep] = useState(1);
    const [valorGerar, setValorGerar] = useState("");
    const [vencimentoGerar, setVencimentoGerar] = useState("");
    const [boletoGeradoVisualizando, setBoletoGeradoVisualizando] = useState<BoletoPendente | null>(null);

    // Câmera
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);

    useEffect(() => {
        async function carregarDados() {
            const data = localStorage.getItem("data");
            if (!data) return router.push("/login");

            try {
                const parsedData = JSON.parse(data);
                const token = parsedData.token;

                if (!token || !parsedData.usuario || !parsedData.conta) {
                    throw new Error("Dados incompletos");
                }
                setUsuario(parsedData.usuario);
                setConta(parsedData.conta);

                // Busca os boletos no BD
                const res = await fetch("https://api-atlasbank.onrender.com/boletos/pendentes", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) setBoletosPendentes(await res.json());

            } catch {
                localStorage.removeItem("data");
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        }
        carregarDados();
    }, [router]);

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.name === "codigo") setCodigo(e.target.value);
    }

    // ==========================================
    // PAGAR BOLETO (API)
    // ==========================================
    async function pagar() {
        if (!codigo) {
            toast.error("Insira ou leia um código de barras.");
            return;
        }

        if (!boletoDetails) {
            // Simula consulta de detalhes antes de pagar
            setBoletoDetails({ sacado: "Boleto Banco Atlas", vencimento: "A vencer", valor: 0 });
            return;
        }

        setLoadingPagamento(true);
        try {
            const token = JSON.parse(localStorage.getItem("data") || "{}").token;
            const response = await fetch("https://api-atlasbank.onrender.com/boletos/pagar", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: codigo })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error);

            toast.success("Boleto pago com sucesso!");
            setShowForm(false);
            setBoletoDetails(null);
            setTimeout(() => window.location.reload(), 1500); // Recarrega para atualizar saldo

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoadingPagamento(false);
        }
    }

    // ==========================================
    // GERAR NOVO BOLETO (API)
    // ==========================================
    async function handleGerarBoleto() {
        if (!valorGerar || !vencimentoGerar) {
            toast.error("Preencha o valor e a data.");
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem("data") || "{}").token;
            const res = await fetch("https://api-atlasbank.onrender.com/boletos", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ valor: Number(valorGerar), vencimento: vencimentoGerar })
            });

            if (res.ok) {
                const novoBoleto = await res.json();
                setBoletosPendentes([novoBoleto, ...boletosPendentes]);
                setBoletoGeradoVisualizando(novoBoleto);
                setGerarStep(2);
                toast.success("Boleto gerado e salvo!");
            }
        } catch (e) {
            toast.error("Erro ao gerar boleto.");
        }
    }

    async function cancelarBoleto(id: string) {
        try {
            const token = JSON.parse(localStorage.getItem("data") || "{}").token;
            await fetch(`https://api-atlasbank.onrender.com/boletos/${id}`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
            });
            setBoletosPendentes(prev => prev.filter(b => b._id !== id));
            toast.success("Boleto cancelado.");
        } catch (e) { }
    }

    function reabrirBoleto(boleto: BoletoPendente) {
        setBoletoGeradoVisualizando(boleto);
        setGerarStep(2);
        setShowGerarBoletoModal(true);
    }

    function copiarLinhaDigitavel(texto: string) {
        navigator.clipboard.writeText(texto);
        toast.success("Linha copiada!");
    }

    // ==========================================
    // CÂMERA SCANNER (LENDO A TELA INTEIRA)
    // ==========================================
    async function startScanner() {
        setIsScanning(true);
        setTimeout(async () => {
            try {
                scannerRef.current = new Html5Qrcode("reader", {
                    experimentalFeatures: {
                        useBarCodeDetectorIfSupported: true
                    },
                    verbose: false 
                });

                await scannerRef.current.start(
                    { facingMode: "environment" },
                    { 
                        fps: 20 
                        // 🔥 REMOVEMOS O QRBOX! 
                        // Agora não tem mais "caixinha", ele vai ler qualquer código que aparecer na tela inteira da câmera.
                    },
                    (decodedText) => {
                        setCodigo(decodedText);
                        stopScanner();
                        toast.success("Código lido com sucesso!");
                    },
                    (errorMessage) => {
                        // Silenciado propositalmente
                    }
                );
            } catch (err) {
                console.error("Erro na câmera:", err);
                toast.error("Erro ao acessar a câmera. Tente digitar o código.");
                stopScanner();
            }
        }, 100);
    }

    async function stopScanner() {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) { }
        }
        setIsScanning(false);
    }

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    if (isLoading || !usuario) return <AppLayout><div className="animate-spin text-[#CFAA56] mx-auto mt-20"></div></AppLayout>;

    return (
        <AppLayout title="Boleto" subtitle="Pague boletos e contas rapidamente" user={usuario} conta={conta}>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-1 bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 flex flex-col justify-center">
                    <p className="text-gray-400 text-sm mb-2">Saldo disponível</p>
                    <h2 className="text-3xl font-bold text-[#CFAA56]">{formatarMoeda(conta?.saldo || 0)}</h2>
                </div>

                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <Action icon={<FaBarcode />} label="Pagar boleto" onClick={() => { setShowReceberMenu(false); setShowForm(true); }} />

                    {/* 🔥 BOTÃO RESTAURADO E APONTANDO PARA O MENU DE LISTA */}
                    <Action icon={<FiPlusCircle />} label="Criar boleto" onClick={() => { setShowForm(false); setShowReceberMenu(!showReceberMenu); }} />

                    <Action icon={<FiClock />} label="Agendados" />
                </div>
            </div>

            {/* ABA RECEBER BOLETOS: LISTA INLINE IGUAL AO PIX */}
            {showReceberMenu && (
                <div className="bg-[#111] border border-[#CFAA56]/30 rounded-3xl p-6 mb-8 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-white">Boletos a receber</h3>
                        <button onClick={() => setShowReceberMenu(false)} className="text-gray-500 hover:text-white"><FiX size={24} /></button>
                    </div>

                    <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                        {boletosPendentes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-6 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center">
                                <FaBarcode className="text-gray-500 mb-2 text-2xl" />
                                <p className="text-gray-400 text-sm">Nenhum boleto pendente.</p>
                            </div>
                        ) : (
                            boletosPendentes.map(b => (
                                <div key={b._id} className="flex justify-between items-center bg-white/[0.02] border border-white/[0.05] p-4 rounded-xl hover:bg-white/[0.04] transition">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#CFAA56]/20 text-[#CFAA56] flex items-center justify-center">
                                            <FaBarcode size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#F4E3B2]">{formatarMoeda(b.valor)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Vence em: {new Date(b.vencimento).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => reabrirBoleto(b)} className="text-xs px-3 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition">Ver Boleto</button>
                                        <button onClick={() => cancelarBoleto(b._id)} className="text-gray-500 hover:text-red-500 p-2 transition"><FiX size={20} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <button onClick={() => { setGerarStep(1); setValorGerar(""); setVencimentoGerar(""); setShowGerarBoletoModal(true); }} className="w-full py-4 rounded-xl border border-[#CFAA56] text-[#CFAA56] font-bold hover:bg-[#CFAA56]/10 transition flex items-center justify-center gap-2 text-lg">
                        <FiPlus size={20} /> Criar novo boleto
                    </button>
                </div>
            )}

            {/* MODAL: CRIAR BOLETO (ETAPAS) */}
            {showGerarBoletoModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                    
                    {/* 🔥 MODAL DINÂMICO: max-w-md na Etapa 1, e max-w-max na Etapa 2 para caber o boleto gigante */}
                    <div className={`bg-[#111] border border-white/10 w-full ${gerarStep === 1 ? 'max-w-md' : 'max-w-[95vw] md:max-w-max'} rounded-3xl p-6 shadow-2xl relative overflow-x-auto transition-all duration-300`}>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-white">Criar Boleto</h3>
                            <button onClick={() => setShowGerarBoletoModal(false)} className="text-gray-400 hover:text-white">
                                <FiX size={24} />
                            </button>
                        </div>

                        {gerarStep === 1 ? (
                            <div className="space-y-4 mb-2 animate-in slide-in-from-right-4 duration-300 w-full sm:min-w-[350px]">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Valor (R$)</label>
                                    <input
                                        type="number" placeholder="0,00" value={valorGerar} onChange={(e) => setValorGerar(e.target.value)}
                                        className="w-full px-4 py-4 text-2xl font-bold rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none focus:border-[#CFAA56]"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block mt-4">Data de Vencimento</label>
                                    <input
                                        type="date" value={vencimentoGerar} onChange={(e) => setVencimentoGerar(e.target.value)}
                                        className="w-full px-4 py-4 rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none focus:border-[#CFAA56] [color-scheme:dark]"
                                    />
                                </div>

                                <button onClick={handleGerarBoleto} disabled={!valorGerar || !vencimentoGerar} className="w-full mt-6 py-4 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition text-lg disabled:opacity-50">
                                    Gerar Boleto
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 mt-2">

                                {/* 🔥 CAIXA BRANCA EXPANSIVA (Sem scrollbar, abraça o tamanho total) */}
                                <div className="bg-white p-6 rounded-xl mb-6 flex justify-center items-center">
                                    {boletoGeradoVisualizando && (
                                        <img 
                                            src={`https://bwipjs-api.metafloor.com/?bcid=interleaved2of5&text=${boletoGeradoVisualizando.codigo_barras}&scale=3&height=18&includetext=false&backgroundcolor=ffffff&padding=10`} 
                                            alt="Código de Barras" 
                                            /* O max-w-none garante que a imagem não seja espremida pelo CSS */
                                            className="h-28 max-w-none object-contain pointer-events-none"
                                        />
                                    )}
                                </div>

                                <p className="text-gray-400 text-sm mb-2 font-medium">Linha Digitável</p>
                                <div className="bg-[#0A0A0A] border border-white/5 w-full p-4 rounded-xl mb-6 flex flex-col items-center">
                                    <p className="text-white font-mono text-xs md:text-sm text-center break-words leading-relaxed">
                                        {boletoGeradoVisualizando?.linha_digitavel}
                                    </p>
                                </div>

                                <button onClick={() => boletoGeradoVisualizando && copiarLinhaDigitavel(boletoGeradoVisualizando.linha_digitavel)} className="w-full flex items-center justify-center gap-2 mb-3 py-4 rounded-xl border border-[#CFAA56]/30 text-[#CFAA56] font-bold hover:bg-[#CFAA56]/10 transition text-lg">
                                    <FiCopy size={20} /> Copiar código
                                </button>

                                <button onClick={() => setShowGerarBoletoModal(false)} className="w-full py-4 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition text-lg">
                                    Concluir e Fechar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL: PAGAR BOLETO (Com Scanner) */}
            {showForm && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative overflow-hidden">

                        {isScanning && (
                            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
                                <h3 className="text-white font-bold mb-4 text-center">Aponte a câmera para as barras</h3>
                                <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden bg-black border border-[#CFAA56]/30"></div>
                                <button onClick={stopScanner} className="mt-6 py-3 px-8 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition">Cancelar</button>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-white">Pagar Boleto</h3>
                            <button onClick={() => { setShowForm(false); setBoletoDetails(null); }} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Código de barras / linha digitável</label>
                                <Input name="codigo" placeholder="Insira o código numérico" value={codigo} onChange={handleChange} />

                                <button onClick={startScanner} className="w-full mt-3 flex items-center justify-center gap-2.5 py-3 rounded-lg bg-black border border-[#CFAA56]/30 text-[#CFAA56] font-medium hover:bg-[#CFAA56]/10 transition text-sm">
                                    <FiCamera size={18} /> Ler boleto com a câmera
                                </button>
                            </div>

                            {boletoDetails && (
                                <div className="p-4 rounded-xl bg-white/[0.03] border border-[#CFAA56]/30 animate-in fade-in">
                                    <p className="text-xs text-[#CFAA56] mb-1 font-bold uppercase">Boleto Encontrado:</p>
                                    <p className="text-white text-sm">Sacado: {boletoDetails.sacado}</p>
                                    <p className="text-white text-sm">Vencimento: {boletoDetails.vencimento}</p>
                                    <p className="text-2xl font-bold text-[#CFAA56] mt-2">{formatarMoeda(boletoDetails.valor || 0)}</p>
                                </div>
                            )}
                        </div>

                        <button onClick={pagar} disabled={loadingPagamento} className="w-full py-4 rounded-xl bg-[#CFAA56] text-black font-bold hover:bg-[#e2bd6b] transition disabled:opacity-50 text-lg">
                            {loadingPagamento ? 'Processando...' : (boletoDetails ? 'Confirmar pagamento' : 'Consultar boleto')}
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl p-6 mt-8">
                <h3 className="text-xl font-bold mb-6">Últimos pagamentos</h3>
                <div className="space-y-4">
                    <HistoryItem title="Conta de luz" date="Ontem" value="R$ 182,00" />
                </div>
            </div>
        </AppLayout>
    );
}

/* ---------- COMPONENTES INTERNOS ---------- */

function Input({ name, placeholder, value, onChange }: PagamentosInputProps) {
    return <input name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-4 py-4 rounded-xl bg-[#0A0A0A] border border-white/5 text-white outline-none focus:border-[#CFAA56]" />;
}

function Action({ icon, label, onClick }: PagamentosActionProps & { onClick?: () => void }) {
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#0A0A0A] border border-white/5 hover:border-[#CFAA56]/60 hover:-translate-y-1 transition-all">
            <div className="text-2xl text-[#CFAA56]">{icon}</div>
            <span className="text-sm text-gray-300 font-medium">{label}</span>
        </button>
    );
}

function HistoryItem({ title, date, value }: HistoryItemProps) {
    return (
        <div className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#CFAA56]/20 text-[#CFAA56]"><FiBarChart /></div>
                <div><p className="font-medium text-white">{title}</p><p className="text-xs text-gray-500">{date}</p></div>
            </div>
            <span className="font-bold text-red-400">{value}</span>
        </div>
    );
}