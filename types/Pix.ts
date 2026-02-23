import { ReactNode } from "react";

export interface Pix {
    id: number;
    tipo_chave: "CPF" | "EMAIL" | "TELEFONE" | "ALEATORIA";
    valor: string;
    data: string;
    descricao?: string;
    chave?: string;
    numero_conta?: string;
}

export interface PixActionProps {
    icon: ReactNode;
    label: string;
}

export interface PixItemProps {
    name: string;
    value: string;
    type: "entrada" | "saida";
}