import { accessProfiles } from "./access";
import type { Usuario } from "../types/auth";

export const routes = {
  login: "/login",
  register: "/register",
  home: "/",
  lgpd: "/recursos/lgpd",
  legislacao: "/recursos/legislacao",
  dashboardProfessor: "/professor/dashboard",
  dashboardEquipeMultidisciplinar: "/equipe/dashboard",
  dashboardCoordenador: "/coordenador/dashboard",
  estudantesCoordenador: "/coordenador/estudantes",
  anamneseCoordenador: "/coordenador/anamnese",
  perfilEstudante: "/coordenador/estudantes/:id",
  relatoriosCoordenador: "/coordenador/relatorios",
  documentosCoordenador: "/coordenador/documentos",
} as const;

export function destinoUsuario(usuario: Usuario) {
  return `${accessProfiles[usuario.perfil].basePath}/dashboard`;
}
