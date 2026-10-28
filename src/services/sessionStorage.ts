import type { Usuario } from "../types/auth";

const key = "portal.usuario";
const perfis = ["COORDENADOR", "PROFESSOR", "ADMINISTRADOR", "EQUIPE_MULTIDISCIPLINAR"];

export function isUsuario(value: unknown): value is Usuario {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<Usuario>;
  return Number.isInteger(user.id) && Number.isInteger(user.perfilId)
    && typeof user.nome === "string" && typeof user.email === "string"
    && typeof user.perfil === "string" && perfis.includes(user.perfil);
}

// Identificação local para navegação. Não é uma sessão autenticada no servidor.
export const userSession = {
  read(): Usuario | null {
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || "null");
      return isUsuario(value) ? value : null;
    } catch { return null; }
  },
  save(usuario: Usuario) { try { sessionStorage.setItem(key, JSON.stringify(usuario)); } catch { /* O servidor mantém a sessão mesmo sem armazenamento local. */ } },
  clear() { try { sessionStorage.removeItem(key); } catch { /* O cache é opcional. */ } },
};
