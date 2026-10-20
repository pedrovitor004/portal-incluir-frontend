import { accessProfiles } from "./access";
import type { Usuario } from "../types/auth";

export const routes = {
  login: "/",
  register: "/register",
  home: "/home",
  lgpd: "/recursos/lgpd",
  legislacao: "/recursos/legislacao",
  dashboardCoordenador: "/coordenador/dashboard",
  estudantesCoordenador: "/coordenador/estudantes",
  anamneseCoordenador: "/coordenador/anamnese",
} as const;

export function destinoUsuario(usuario: Usuario) {
  return `${accessProfiles[usuario.perfil].basePath}/dashboard`;
}
