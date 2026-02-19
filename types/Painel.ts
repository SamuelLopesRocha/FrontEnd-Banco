import { ReactNode } from "react";

export interface SaldoCardProps {
  title: string;
  value: string;
}

export interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  href: string;
  disabled?: boolean;
}

export interface TransactionProps {
  name: string;
  date: string;
  category: string;
  value: string;
}