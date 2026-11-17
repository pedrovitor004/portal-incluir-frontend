import { endpoints } from "../config/endpoints";
import type { CadastroRequest, LoginRequest, Usuario, SolicitacaoAcesso } from "../types/auth";
import { http } from "./http";
import type { MensagemAuthResponse, RecuperarSenhaRequest, RedefinirSenhaRequest } from "../types/auth";

export const authService = {
  async recuperarSenha(request: RecuperarSenhaRequest): Promise<MensagemAuthResponse> {
    return (await http.post<MensagemAuthResponse>(endpoints.auth.recuperarSenha, request)).data;
  },
  async redefinirSenha(request: RedefinirSenhaRequest): Promise<MensagemAuthResponse> {
    return (await http.post<MensagemAuthResponse>(endpoints.auth.redefinirSenha, request)).data;
  },
  async me(): Promise<Usuario> { return (await http.get<Usuario>("/auth/me", { background: true })).data; },
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
