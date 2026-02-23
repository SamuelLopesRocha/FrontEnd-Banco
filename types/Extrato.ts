export interface Transacao {
    _id: string;
    usuario_id: number;
    conta_origem: string;
    conta_destino: string;
    tipo: "PIX_ENVIO" | "PIX_RECEBIMENTO" | string;
    valor: number;
    saldo_antes: number;
    saldo_depois: number;
    descricao: string;
    chave_pix: string;
    tipo_chave_pix: "CPF" | "EMAIL" | "TELEFONE" | "ALEATORIA" | string;
    status: "CONCLUIDA" | "PENDENTE" | "CANCELADA" | string;
    createdAt: string;
    updatedAt: string;
    id_transacao: number;
}

export interface TransacaoAPI {
    pagina: number;
    limite: number;
    total: number;
    total_paginas: number;
    dados: Transacao[];
}