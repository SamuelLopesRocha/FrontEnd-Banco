"use client";

import Link from "next/link";
import { FiDownload, FiUpload } from "react-icons/fi";
import AppLayout from "../components/AppLayout";

export default function TestePage() {
    return (
        <AppLayout
            title="Caixa Eletrônico"
            subtitle="Realize saques e depósitos de forma rápida e segura"
        >
            <div className="">

                {/* CARD PRINCIPAL */}
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#141414] to-[#0A0A0A] p-10">

                    {/* Glow decorativo */}
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#CFAA56]/10 blur-[120px] rounded-full" />

                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold mb-2">
                            Terminal de Autoatendimento
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Escolha a operação que deseja realizar
                        </p>
                    </div>

                    {/* BOTÕES */}
                    <div className="grid md:grid-cols-2 gap-6">

                        {/* SAQUE */}
                        <Link
                            href="/saque"
                            className="group relative flex flex-col items-center justify-center 
                                       gap-4 p-10 rounded-2xl 
                                       bg-[#0A0A0A] border border-white/5 
                                       transition-all duration-300
                                       hover:border-[#CFAA56]/60 
                                       hover:-translate-y-1 
                                       hover:shadow-[0_0_25px_rgba(207,170,86,0.25)]"
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center 
                                            bg-gradient-to-br from-[#CFAA56]/30 to-transparent 
                                            text-[#F4E3B2] text-3xl
                                            group-hover:scale-110 transition">
                                <FiDownload />
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Saque</h3>
                                <p className="text-sm text-gray-400">
                                    Retire dinheiro da sua conta
                                </p>
                            </div>
                        </Link>

                        {/* DEPÓSITO */}
                        <Link
                            href="/deposito"
                            className="group relative flex flex-col items-center justify-center 
                                       gap-4 p-10 rounded-2xl 
                                       bg-[#0A0A0A] border border-white/5 
                                       transition-all duration-300
                                       hover:border-[#CFAA56]/60 
                                       hover:-translate-y-1 
                                       hover:shadow-[0_0_25px_rgba(207,170,86,0.25)]"
                        >
                            <div className="w-16 h-16 rounded-full flex items-center justify-center 
                                            bg-gradient-to-br from-[#CFAA56]/30 to-transparent 
                                            text-[#F4E3B2] text-3xl
                                            group-hover:scale-110 transition">
                                <FiUpload />
                            </div>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold">Depósito</h3>
                                <p className="text-sm text-gray-400">
                                    Adicione dinheiro à sua conta
                                </p>
                            </div>
                        </Link>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}