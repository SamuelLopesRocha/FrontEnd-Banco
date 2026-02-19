/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";
import Input from "../components/Input";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.error || "Falha no login");
      } else {
        localStorage.setItem("token", data.access_token);
        setMensagem("Login realizado com sucesso!");
      }
    } catch {
      setMensagem("Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#030303] text-white flex flex-col md:flex-row">

      {/* LADO ESQUERDO */}
      <div className="hidden md:block sticky top-0 w-[45%] h-screen shrink-0 border-r border-white/5 overflow-hidden">
        <img
          src="/MulherAB.png"
          alt="Atlas Member"
          className="absolute inset-0 w-full h-full object-cover grayscale-[10%]"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#030303] via-transparent to-transparent" />
      </div>

      {/* LADO DIREITO */}
      <div className="relative w-full md:w-[55%] min-h-screen flex items-center justify-center p-6 md:p-12">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CFAA56]/5 blur-[120px] -z-10 pointer-events-none" />

        <div className="w-full max-w-xl animate-in fade-in slide-in-from-right-4 duration-1000">
          <div className="backdrop-blur-3xl bg-[#0A0A0A]/40 border border-white/[0.05] p-6 md:p-12 rounded-[2.5rem] shadow-2xl">

            <header className="mb-8">
              <div className="flex justify-start mb-6">
                <Link
                  href="/"
                  className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-[#CFAA56]/30 transition-all duration-300"
                >
                  <span className="h-[1px] w-4 bg-[#CFAA56] group-hover:w-6 transition-all"></span>
                  <span className="text-[#CFAA56] text-[10px] font-bold uppercase tracking-[0.3em]">
                    Atlas Bank
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CFAA56]" />
                </Link>
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                Bem-vindo de volta
                <br />
                <span className="bg-gradient-to-r from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
                  faça seu login.
                </span>
              </h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-5">

              <Input
                name="email"
                type="email"
                placeholder="E-mail"
                icon={<FiMail />}
                onChange={handleChange}
              />

              <Input
                name="senha"
                type="password"
                placeholder="Senha"
                icon={<FiLock />}
                onChange={handleChange}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-black bg-[#CFAA56] text-[#030303] text-sm uppercase tracking-widest hover:bg-[#e2bd6b] active:scale-[0.99] transition-all shadow-lg shadow-[#CFAA56]/10"
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>

              {mensagem && (
                <p className="text-center text-xs text-[#CFAA56] animate-bounce">
                  {mensagem}
                </p>
              )}

              <p className="text-center text-xs text-gray-500 pt-4">
                Não tem conta?{" "}
                <Link href="/cadastro" className="text-[#CFAA56] hover:underline">
                  Criar agora
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
