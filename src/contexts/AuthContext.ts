import { createContext } from "react";
import type { CadastroRequest, LoginRequest, Usuario } from "../types/auth";

export interface AuthContextValue {
  usuario: Usuario | null;
  login(request: LoginRequest): Promise<Usuario>;
  register(request: CadastroRequest): Promise<Usuario>;
  logout(): void;
}
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
