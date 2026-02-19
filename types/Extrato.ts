export interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: "entrada" | "saida";
}