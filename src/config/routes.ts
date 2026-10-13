import type { Usuario } from "../types/auth";

export const routes = {
  login: "/",
  register: "/register",
  home: "/home",
  dashboardCoordenador: "/coordenador/dashboard",
} as const;

export function destinoUsuario(usuario: Usuario) {
  return usuario.perfil === "COORDENADOR" ? routes.dashboardCoordenador : routes.home;
}
