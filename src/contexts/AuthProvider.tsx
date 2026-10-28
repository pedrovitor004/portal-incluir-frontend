import { notificationService } from "../services/notificationService";
import { mensagemErro } from "../services/apiError";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { authService } from "../services/authService";
import { userSession } from "../services/sessionStorage";
import { connectSessionTabs } from "../services/sessionTabs";
import { createAuthSession } from "../services/authSession";
import type { CadastroRequest, LoginRequest } from "../types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao] = useState(() => createAuthSession(authService, userSession));
  const estado = useSyncExternalStore(sessao.subscribe, sessao.getSnapshot);
  const abas = useRef<ReturnType<typeof connectSessionTabs> | null>(null);
  useEffect(() => {
    const conferir = () => { void sessao.refresh(); };
    abas.current = connectSessionTabs(conferir);
    conferir();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible" && sessao.getSnapshot().usuario) conferir(); }, 30000);
    window.addEventListener("focus", conferir);
    window.addEventListener("portal:session-check", conferir);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", conferir); window.removeEventListener("portal:session-check", conferir); abas.current?.close(); abas.current = null; };
  }, [sessao]);
  async function login(request: LoginRequest) {
    try { const usuario = await sessao.login(request); abas.current?.changed(); notificationService.success("Login realizado com sucesso!"); return usuario; }
    catch (erro) { notificationService.error(mensagemErro(erro)); throw erro; }
  }
  async function register(request: CadastroRequest) {
    try { const pedido = await sessao.register(request); notificationService.success("Solicitação enviada à coordenação. Aguarde a análise para acessar o sistema."); return pedido; }
    catch (erro) { notificationService.error(mensagemErro(erro)); throw erro; }
  }
  async function logout() {
    try { await sessao.logout(); abas.current?.changed(); notificationService.info("Você saiu da sua conta."); return true; }
    catch { notificationService.error("Não foi possível encerrar a sessão no servidor. Tente novamente."); return false; }
  }
  return <AuthContext.Provider value={{ ...estado, login, register, logout, atualizarSessao: sessao.refresh, atualizarDadosPerfil: sessao.atualizarPerfil }}>{children}</AuthContext.Provider>;
}
