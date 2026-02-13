const API = "http://localhost:3000/cadastro";

export async function criarUsuario(data: any) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function listarUsuarios() {
  const res = await fetch(API);
  return res.json();
}

export async function atualizarUsuario(id: number, data: any) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  return res.json();
}

export async function deletarUsuario(id: number) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE"
  });

  return res.json();
}
