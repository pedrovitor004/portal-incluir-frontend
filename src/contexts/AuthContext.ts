import { createContext } from "react";
import type { CadastroRequest, LoginRequest, PerfilUsuario, Usuario } from "../types/auth";

export interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  erroSessao: string;
  atualizarSessao(): Promise<void>;
  login(request: LoginRequest): Promise<Usuario>;
  register(request: CadastroRequest): Promise<Usuario>;
  logout(): Promise<boolean>;
  atualizarDadosPerfil(perfil: PerfilUsuario, perfilId: number, dados: { nome: string; email?: string }): void;
}
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
