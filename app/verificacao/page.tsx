/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { FiMail } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";

function VerificacaoContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [reenviando, setReenviando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    function handleChange(value: string, index: number) {
        if (!/^[0-9]?$/.test(value)) return;

        const novo = [...codigo];
        novo[index] = value;
        setCodigo(novo);

        if (value && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    }

    function handleBackspace(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
        if (e.key === "Backspace" && !codigo[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setMensagem("");

        const otp = codigo.join("");

        if (otp.length < 6) {
            setMensagem("Digite o código completo.");
            setLoading(false);
            return;
        }

        if (!email) {
            setMensagem("E-mail não encontrado. Volte ao login e tente novamente.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("https://api-atlasbank.onrender.com/usuarios/verificar-codigo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, codigo: otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.error || "Falha na verificação");
            } else {
                setMensagem("Conta verificada com sucesso!");
                setTimeout(() => {
                    router.push("/login");
                }, 1500);
            }
        } catch {
            setMensagem("Erro ao conectar com o servidor.");
        } finally {
            setLoading(false);
        }
    }

    async function handleReenviarCodigo() {
        if (!email) {
            setMensagem("E-mail não encontrado. Volte ao login.");
            return;
        }

        setReenviando(true);
        setMensagem("");

        try {
            const response = await fetch("https://api-atlasbank.onrender.com/usuarios/reenviar-codigo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMensagem(data.error || "Erro ao reenviar o código.");
            } else {
                setMensagem("Novo código enviado para seu e-mail!");
                setCodigo(["", "", "", "", "", ""]);
                inputs.current[0]?.focus();
            }
        } catch {
            setMensagem("Erro ao conectar com o servidor.");
        } finally {
            setReenviando(false);
        }
    }

    return (
        <main className="min-h-screen w-full bg-[#030303] text-white flex flex-col md:flex-row">
            {/* LADO ESQUERDO */}
            <div className="hidden md:block sticky top-0 w-[45%] h-screen shrink-0 border-r border-white/5 overflow-hidden">
                <img
                    src="/MulherAB.png"
                    alt="Atlas Member"
                    className="absolute inset-0 w-full h-full object-cover grayscale-[10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-[#030303] via-transparent to-transparent" />
            </div>

            {/* LADO DIREITO */}
            <div className="relative w-full md:w-[55%] min-h-screen flex items-center justify-center p-6 md:p-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CFAA56]/5 blur-[120px] -z-10 pointer-events-none" />

                <div className="w-full max-w-xl animate-in fade-in slide-in-from-right-4 duration-1000">
                    <div className="backdrop-blur-3xl bg-[#0A0A0A]/40 border border-white/[0.05] p-6 md:p-12 rounded-[2.5rem] shadow-2xl">
                        <header className="mb-8">
                            <div className="flex justify-start mb-6">
                                <Link
                                    href="/login"
                                    className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-[#CFAA56]/30 transition-all duration-300"
                                >
                                    <span className="h-[1px] w-4 bg-[#CFAA56] group-hover:w-6 transition-all"></span>
                                    <span className="text-[#CFAA56] text-[10px] font-bold uppercase tracking-[0.3em]">
                                        Atlas Bank
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#CFAA56]" />
                                </Link>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                                Verificação de
                                <br />
                                <span className="bg-gradient-to-r from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
                                    segurança.
                                </span>
                            </h1>

                            <div className="mt-4 flex flex-col gap-1">
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <FiMail className="text-[#CFAA56]" />
                                    Digite o código enviado para:
                                </p>
                                <p className="text-sm font-semibold text-white ml-6">
                                    {email || "seu e-mail"}
                                </p>
                            </div>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* INPUT OTP */}
                            <div className="flex justify-between gap-3">
                                {codigo.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputs.current[index] = el; }}
                                        value={digit}
                                        onChange={(e) => handleChange(e.target.value, index)}
                                        onKeyDown={(e) => handleBackspace(e, index)}
                                        maxLength={1}
                                        className=" w-full h-14 text-center text-xl font-bold rounded-xl bg-[#0A0A0A] border border-white/10 focus:border-[#CFAA56] focus:ring-1 focus:ring-[#CFAA56]/40 outline-none transition"
                                    />
                                ))}
                            </div>

                            {/* BOTÃO */}
                            <button
                                type="submit"
                                disabled={loading || reenviando}
                                className="w-full py-4 rounded-xl font-black bg-[#CFAA56] text-[#030303] text-sm uppercase tracking-widest hover:bg-[#e2bd6b] active:scale-[0.99] transition-all shadow-lg shadow-[#CFAA56]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Verificando..." : "Confirmar código"}
                            </button>

                            {mensagem && (
                                <p className="text-center text-xs text-[#CFAA56] animate-bounce">
                                    {mensagem}
                                </p>
                            )}

                            <p className="text-center text-xs text-gray-500">
                                Não recebeu o código?{" "}
                                <button
                                    type="button"
                                    onClick={handleReenviarCodigo}
                                    disabled={reenviando || loading}
                                    className="text-[#CFAA56] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {reenviando ? "Reenviando..." : "Reenviar código"}
                                </button>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function VerificacaoPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#030303]" />}>
            <VerificacaoContent />
        </Suspense>
    );
}