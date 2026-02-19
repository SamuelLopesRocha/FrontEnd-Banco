import { ReactNode } from "react";

export interface Cartao {
  id: number;
  nome: string;
  final: string;
  titular: string;
  validade: string;
}

export interface CardActionProps {
  icon: ReactNode;
  label: string;
}