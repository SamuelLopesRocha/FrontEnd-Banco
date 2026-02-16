/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { Usuario } from "@/types/Usuario";
import { FiArrowLeft, FiLock, FiMail, FiMapPin, FiUser, FiPhone, FiHash, FiCalendar } from "react-icons/fi";

const TOTAL_STEPS = 3;

export default function CadastroPage() {
  const [step, setStep] = useState(1);
  const [mensagem, setMensagem] = useState("");

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
    senha: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const next = () => step < TOTAL_STEPS && setStep(step + 1);
  const prev = () => step > 1 && setStep(step - 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    try {
      const response = await fetch("http://localhost:8000/cadastros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) setMensagem(data.error);
      else setMensagem("Usuário criado com sucesso!");
    } catch {
      setMensagem("Erro ao conectar com o servidor.");
    }
  }

  const progress = (step / TOTAL_STEPS) * 100;

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

        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-right-4 duration-1000">

          <div className="backdrop-blur-3xl bg-[#0A0A0A]/40 border border-white/[0.05] p-6 md:p-12 rounded-[2.5rem] shadow-2xl">

            <header className="mb-8">
              <div className="flex justify-start mb-6">
                <Link href="/" className="group flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.08] hover:border-[#CFAA56]/30 transition-all duration-300">
                  <span className="h-[1px] w-4 bg-[#CFAA56] group-hover:w-6 transition-all"></span>
                  <span className="text-[#CFAA56] text-[10px] font-bold uppercase tracking-[0.3em] group-hover:text-[#F4E3B2]">
                    Atlas Bank
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#CFAA56] group-hover:scale-150 group-hover:shadow-[0_0_8px_#CFAA56] transition-all" />
                </Link>
              </div>

              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter">
                Sua jornada <br />
                <span className="bg-gradient-to-r from-[#F4E3B2] via-[#CFAA56] to-[#9B7C37] text-transparent bg-clip-text">
                  começa aqui.
                </span>
              </h1>
            </header>

            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-1 font-bold">Passo {step} de {TOTAL_STEPS}</p>
                  <h2 className="text-xl font-bold tracking-tight text-white/90">
                    {step === 1 && "Identificação"}
                    {step === 2 && "Localização"}
                    {step === 3 && "Segurança"}
                  </h2>
                </div>
                <span className="text-[#CFAA56] font-mono text-sm font-bold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#CFAA56] shadow-[0_0_15px_rgba(207,170,86,0.4)] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="md:col-span-2"><Input name="nome_completo" placeholder="Nome Completo" icon={<FiUser />} onChange={handleChange} /></div>
                  <Input name="cpf" placeholder="CPF" icon={<FiHash />} onChange={handleChange} />
                  <Input type="date" name="data_nascimento" icon={<FiCalendar />} onChange={handleChange} />
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="col-span-2 md:col-span-3"><Input name="cidade" placeholder="Cidade" icon={<FiMapPin />} onChange={handleChange} /></div>
                  <div className="col-span-1"><Input name="estado" placeholder="UF" onChange={handleChange} /></div>
                  <div className="col-span-1 md:col-span-2"><Input name="cep" placeholder="CEP" onChange={handleChange} /></div>
                  <div className="col-span-1 md:col-span-2"><Input name="numero" placeholder="Número" onChange={handleChange} /></div>
                  <div className="col-span-2 md:col-span-4"><Input name="complemento" placeholder="Complemento (Opcional)" required={false} onChange={handleChange} /></div>
                  <div className="col-span-2 md:col-span-4"><Input name="telefone" placeholder="WhatsApp" icon={<FiPhone />} onChange={handleChange} /></div>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Input name="email" placeholder="E-mail" type="email" icon={<FiMail />} onChange={handleChange} />
                  <Input type="password" name="senha" placeholder="Senha" icon={<FiLock />} onChange={handleChange} />
                  <p className="text-[10px] text-gray-500 px-2 uppercase tracking-widest font-semibold">Min. 8 caracteres (letras e números).</p>
                </div>
              )}

              <div className="flex gap-4 pt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prev}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/10 text-white hover:bg-white/5 active:scale-95 transition-all text-xs uppercase tracking-widest font-bold"
                  >
                    <FiArrowLeft size={16} /> Voltar
                  </button>
                )}

                <button
                  type={step === TOTAL_STEPS ? "submit" : "button"}
                  onClick={step === TOTAL_STEPS ? undefined : next}
                  className="flex-1 py-4 rounded-xl font-black bg-[#CFAA56] text-[#030303] text-sm uppercase tracking-widest hover:bg-[#e2bd6b] active:scale-[0.99] transition-all shadow-lg shadow-[#CFAA56]/10"
                >
                  {step === TOTAL_STEPS ? "Finalizar Cadastro" : "Continuar"}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500 pt-4">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-[#CFAA56] hover:underline">
                  Entrar
                </Link>
              </p>

              {mensagem && <p className="text-center text-xs text-[#CFAA56] animate-bounce">{mensagem}</p>}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

function Input({ name, placeholder, type = "text", onChange, required = true, icon }: any) {
  return (
    <div className="relative group w-full">
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#CFAA56] transition-colors">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        className={`
          w-full
          ${icon ? 'pl-14' : 'px-6'} py-4 rounded-xl
          bg-white/[0.02] border border-white/[0.06]
          text-white text-sm outline-none
          focus:border-[#CFAA56]/40 focus:bg-white/[0.04]
          transition-all duration-300
        `}
      />
    </div>
  );
}