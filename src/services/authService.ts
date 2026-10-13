import { endpoints } from "../config/endpoints";
import type { CadastroRequest, LoginRequest, Usuario } from "../types/auth";
import { http } from "./http";

export const authService = {
  async login(request: LoginRequest): Promise<Usuario> {
    const { data } = await http.post<Usuario>(endpoints.auth.login, request);
    return data;
  },
  async register(request: CadastroRequest): Promise<Usuario> {
    const { data } = await http.post<Usuario>(endpoints.auth.register, request);
    return data;
  },
};
