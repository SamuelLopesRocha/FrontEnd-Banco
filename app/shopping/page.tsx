"Use client";

import AppLayout from "../components/AppLayout";

export default function ShoppingPage() {
    return (
        <AppLayout
            title="Shopping"
            subtitle="Descubra ofertas exclusivas para você"
        >
            <div className="bg-[#0A0A0A] rounded-3xl border border-white/5 p-6 flex flex-col items-center justify-center gap-4 h-64">
                <h2 className="text-xl font-bold">
                    Em breve: funcionalidades de Shopping
                </h2>
                <p className="text-gray-300">
                    Estamos trabalhando para trazer as melhores ofertas e experiências de shopping para você. Fique ligado!
                </p>
            </div>
        </AppLayout>
    );
}