import { endpoints } from "../config/endpoints";
import type { CadastroRequest, LoginRequest, Usuario, SolicitacaoAcesso } from "../types/auth";
import { http } from "./http";

export const authService = {
  async me(): Promise<Usuario> { return (await http.get<Usuario>("/auth/me")).data; },
  async login(request: LoginRequest): Promise<Usuario> {
    const { data } = await http.post<Usuario>(endpoints.auth.login, request, { withCredentials: true });
    return data;
  },
  async logout() {
    await http.post("/auth/logout", undefined, { withCredentials: true });
  },
  async register(request: CadastroRequest): Promise<SolicitacaoAcesso> {
    const { data } = await http.post<SolicitacaoAcesso>(endpoints.auth.register, request);
    return data;
  },
};
