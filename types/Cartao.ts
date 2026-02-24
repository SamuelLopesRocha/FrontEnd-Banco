import { ReactNode } from "react";

export type Cartao = {
    _id: string;
  id: number;
  numero_cartao: string;
  validade: string;
  tipo: string;
  bandeira: string;
  limite_credito: number;
  limite_utilizado: number;
  status_cartao: string;
};

export type CartaoAPI = {
    _id: string;
    id_cartao: number;
    numero_cartao: string;
    tipo: string;
    bandeira: string;
    status_cartao: string;
    validade: string;
    limite_credito: number;
    limite_utilizado: number;
};

export interface CardActionProps {
  icon: ReactNode;
  label: string;
}