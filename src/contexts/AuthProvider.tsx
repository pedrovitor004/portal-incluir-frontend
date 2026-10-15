import { notificationService } from "../services/notificationService";
import { mensagemErro } from "../services/apiError";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "../services/authService";
import { userSession } from "../services/sessionStorage";
import { connectSessionTabs } from "../services/sessionTabs";
import type { CadastroRequest, LoginRequest, Usuario } from "../types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => userSession.read());
  const sessionTabs = useRef<ReturnType<typeof connectSessionTabs> | null>(null);

  useEffect(() => {
    const sourceTab = new URL(window.location.href).searchParams.get("fromTab") ?? undefined;
    const bridge = connectSessionTabs(() => userSession.read(), conta => {
      if (conta) userSession.save(conta);
      else userSession.clear();
      setUsuario(conta);
    }, sourceTab);
    sessionTabs.current = bridge;
    return () => { bridge.close(); sessionTabs.current = null; };
  }, []);

  function atualizarSessao(conta: Usuario) {
    userSession.save(conta);
    setUsuario(conta);
    return conta;
  }
  async function login(request: LoginRequest) {
    try {
      const conta = atualizarSessao(await authService.login(request));
      notificationService.success("Login realizado com sucesso!");
      return conta;
    } catch (error) {
      notificationService.error(mensagemErro(error));
      throw error;
    }
  }
  async function register(request: CadastroRequest) {
    try {
      const conta = atualizarSessao(await authService.register(request));
      notificationService.success("Conta criada com sucesso!");
      return conta;
    } catch (error) {
      notificationService.error(mensagemErro(error));
      throw error;
    }
  }
  function logout() {
    const userId = userSession.read()?.id;
    userSession.clear();
    if (userId !== undefined) sessionTabs.current?.logout(userId);
    setUsuario(null);
    notificationService.info("Você saiu da sua conta.");
  }

  function atualizarDadosPerfil(perfil: PerfilUsuario, perfilId: number, dados: { nome: string; email?: string }) {
    setUsuario(atual => {
      if (!atual || atual.perfil !== perfil || atual.perfilId !== perfilId) return atual;
      const atualizado = { ...atual, nome: dados.nome, email: dados.email ?? atual.email };
      userSession.save(atualizado);
      return atualizado;
    });
  }

  return <AuthContext.Provider value={{ usuario, login, register, logout, atualizarDadosPerfil }}>{children}</AuthContext.Provider>;
}
