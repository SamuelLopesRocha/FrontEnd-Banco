"use client";

import { useState } from "react";
import { Usuario } from "@/types/Usuario";

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
      const response = await fetch("http://localhost:3000/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.error);
      } else {
        setMensagem("Usuário criado com sucesso!");
      }
    } catch (error) {
      setMensagem("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      
      {/* Card */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6">
        
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Criar Conta
        </h1>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Grupo 1 */}
          <div className="space-y-3">
            <input
              name="nome_completo"
              placeholder="Nome completo"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              name="cpf"
              placeholder="CPF"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="date"
              name="data_nascimento"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Grupo 2 */}
          <div className="space-y-3">
            <input
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              name="telefone"
              placeholder="Telefone"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Grupo 3 */}
          <div className="space-y-3">
            <input
              name="cidade"
              placeholder="Cidade"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              name="estado"
              placeholder="Estado"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              name="cep"
              placeholder="CEP"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              name="numero"
              placeholder="Número"
              onChange={handleChange}
              required
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              name="complemento"
              placeholder="Complemento (opcional)"
              onChange={handleChange}
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Senha */}
          <input
            type="password"
            name="senha"
            placeholder="Senha"
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Botão principal */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 rounded-xl hover:opacity-90 transition"
          >
            Cadastrar
          </button>
        </form>

        {/* Mensagem */}
        {mensagem && (
          <p className="text-center text-sm text-red-500">
            {mensagem}
          </p>
        )}

        {/* Divisor */}
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="flex-1 h-px bg-gray-200" />
          ou
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Botão secundário */}
        <button className="w-full border border-blue-500 text-blue-500 py-3 rounded-xl hover:bg-blue-50 transition">
          Já tenho uma conta
        </button>

      </div>
    </div>
  );
}
