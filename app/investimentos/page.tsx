"use client";

import AppLayout from "../components/AppLayout";

export default function InvestimentosPage() {
    return (
        <AppLayout
            title="Investimentos"
            subtitle="Invista e faça seu dinheiro render mais"
        >
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6 flex flex-col items-center justify-center gap-4 h-64">
                <h2 className="text-xl font-bold">
                    Em breve: funcionalidades de Investimentos
                </h2>
                <p className="text-gray-300">
                    Estamos trabalhando para trazer as melhores experiências de Investimentos para você. Fique ligado!
                </p>
            </div>
        </AppLayout>
    );
}