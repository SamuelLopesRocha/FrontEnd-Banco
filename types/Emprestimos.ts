import { ReactNode } from "react";

export type EmprestimosInputProps = {
    name: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export interface SummaryCardProps {
    icon: ReactNode;
    title: string;
    value: string;
}

export interface LoanItemProps {
    title: string;
    status: string;
    value: string;
}