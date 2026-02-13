"use client";

import { useEffect, useState } from "react";
import { Usuario } from "@/types/Usuario";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/cadastro")
      .then(res => res.json())
      .then(data => setUsuarios(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Lista de Usuários</h1>

      <ul>
        {usuarios.map(user => (
          <li key={user.usuario_id}>
            {user.nome_completo} - {user.email} - {user.status_conta}
          </li>
        ))}
      </ul>
    </div>
  );
}
