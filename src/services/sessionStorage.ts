import type { Usuario } from "../types/auth";

const key = "portal.usuario";
const perfis = ["COORDENADOR", "PROFESSOR", "ADMINISTRADOR", "EQUIPE_MULTIDISCIPLINAR"];

// Identificação local para navegação. Não é uma sessão autenticada no servidor.
export const userSession = {
  read(): Usuario | null {
    try {
      const value = JSON.parse(sessionStorage.getItem(key) || "null");
      return value && Number.isInteger(value.id) && Number.isInteger(value.perfilId)
        && typeof value.nome === "string" && typeof value.email === "string"
        && perfis.includes(value.perfil) ? value : null;
    } catch { return null; }
  },
  save(usuario: Usuario) { sessionStorage.setItem(key, JSON.stringify(usuario)); },
  clear() { sessionStorage.removeItem(key); },
};
