"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [contador, setContador] = useState<number | null>(null);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        setMensagem(data.error);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);

      setMensagem("Login realizado com sucesso!");
      setContador(3);

    } catch (error) {
      setMensagem("Erro ao conectar com o servidor.");
      setLoading(false);
    }
  }

  // 🔄 Contador regressivo
  useEffect(() => {
    if (contador === null) return;

    if (contador === 0) {
      router.push("/home");
      return;
    }

    const timer = setTimeout(() => {
      setContador((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [contador, router]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Entrar</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="CPF ou Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className={styles.input}
            required
            disabled={loading || contador !== null}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={styles.input}
            required
            disabled={loading || contador !== null}
          />

          <button
            type="submit"
            className={styles.buttonPrimary}
            disabled={loading || contador !== null}
          >
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              "Entrar"
            )}
          </button>

          {mensagem && (
            <p className={styles.message}>
              {mensagem}
              {contador !== null && (
                <span> Redirecionando em {contador}...</span>
              )}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
