"use client";

import { useState } from "react";
import { Usuario } from "@/types/Usuario";
import styles from "./Cadastro.module.css";

export default function CadastroPage() {

  
  const [form, setForm] = useState<Usuario>({
    nome_completo: "",
    cpf: "",
    data_nascimento: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    cep: "",
    numero: "",
    complemento: "",
    senha: ""
  });

  const [mensagem, setMensagem] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");

    try {
      const response = await fetch("http://localhost:8000/cadastros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await response.json();
      console.log(data);
      
      if (!response.ok) {
        setMensagem(data.error);
      } else {
        setMensagem("Usuário criado com sucesso!");
      }
    } catch {
      setMensagem("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Criar Conta</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input name="nome_completo" placeholder="Nome completo" onChange={handleChange} required className={styles.input} />
          <input name="cpf" placeholder="CPF" onChange={handleChange} required className={styles.input} />
          <input type="date" name="data_nascimento" onChange={handleChange} required className={styles.input} />
          <input name="email" placeholder="Email" onChange={handleChange} required className={styles.input} />
          <input name="telefone" placeholder="Telefone" onChange={handleChange} required className={styles.input} />
          <input name="cidade" placeholder="Cidade" onChange={handleChange} required className={styles.input} />
          <input name="estado" placeholder="Estado" onChange={handleChange} required className={styles.input} />
          <input name="cep" placeholder="CEP" onChange={handleChange} required className={styles.input} />
          <input name="numero" placeholder="Número" onChange={handleChange} required className={styles.input} />
          <input name="complemento" placeholder="Complemento" onChange={handleChange} className={styles.input} />
          <input type="password" name="senha" placeholder="Senha" onChange={handleChange} required className={styles.input} />

          <button type="submit" className={styles.buttonPrimary}>
            Cadastrar
          </button>
          {mensagem && <p className={styles.message}>{mensagem}</p>}

          <button className={styles.buttonSecondary}>
            Já tenho uma conta
          </button>
        </form>

      </div>
    </div>
  );
}
