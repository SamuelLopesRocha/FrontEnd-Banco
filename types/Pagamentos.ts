import { ReactNode } from "react";

export type PagamentosInputProps = {
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export interface PagamentosActionProps {
    icon: ReactNode;
    label: string;
}

export interface HistoryItemProps {
    title: string;
    date: string;
    value: string;
}