import { ReactNode } from "react";

export interface PixActionProps {
    icon: ReactNode;
    label: string;
}

export interface PixItemProps {
    name: string;
    value: string;
    type: "entrada" | "saida";
}