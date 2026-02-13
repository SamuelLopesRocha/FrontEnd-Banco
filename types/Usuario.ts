export interface Usuario {
  usuario_id?: number;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  cep: string;
  numero: string;
  complemento?: string | null;
  senha?: string;
  status_conta?: string;
}
