import axios from "axios";
import type { CadastroRequest, LoginRequest, Usuario } from "../types/auth";
import { mensagemErro } from "./apiError";

type Api = { me(): Promise<Usuario>; login(dados: LoginRequest): Promise<Usuario>; register(dados: CadastroRequest): Promise<Usuario>; logout(): Promise<void> };
type Cache = { save(usuario: Usuario): void; clear(): void };
export function createAuthSession(api: Api, cache: Cache) {
  let estado: { usuario: Usuario | null; carregando: boolean; erroSessao: string } = { usuario: null, carregando: true, erroSessao: "" };
  let versao = 0;
  let ocupada = false;
  let consulta: Promise<void> | null = null;
  const ouvintes = new Set<() => void>();
  function publicar(novo: typeof estado) { estado = novo; ouvintes.forEach(fn => fn()); }
  function guardar(usuario: Usuario | null) { if (usuario) cache.save(usuario); else cache.clear(); }
  async function refresh(): Promise<void> {
    if (ocupada) return;
    if (consulta) return consulta;
    const atual = versao;
    consulta = (async () => {
      try { const usuario = await api.me(); if (atual === versao) { guardar(usuario); publicar({ usuario, carregando: false, erroSessao: "" }); } }
      catch (erro) {
        if (atual !== versao) return;
        if (axios.isAxiosError(erro) && [401, 403].includes(erro.response?.status ?? 0)) { guardar(null); publicar({ usuario: null, carregando: false, erroSessao: "" }); }
        else publicar({ ...estado, carregando: false, erroSessao: mensagemErro(erro) });
      } finally { consulta = null; }
    })();
    return consulta;
  }
  async function autenticar(acao: () => Promise<Usuario>) {
    if (ocupada) throw new Error("Aguarde a operação de sessão em andamento.");
    ocupada = true; versao++; publicar({ ...estado, carregando: true, erroSessao: "" });
    let aceita = false;
    try {
      await acao();
      aceita = true;
      // O servidor precisa reconhecer o cookie antes de liberar a navegação autenticada.
      const usuario = await api.me(); guardar(usuario); publicar({ usuario, carregando: false, erroSessao: "" }); return usuario;
    } catch (erro) {
      if (aceita && axios.isAxiosError(erro) && [401, 403].includes(erro.response?.status ?? 0)) { guardar(null); publicar({ usuario: null, carregando: false, erroSessao: "" }); }
      else publicar({ ...estado, carregando: false });
      throw erro;
    } finally { ocupada = false; }
  }
  return {
    getSnapshot: () => estado,
    subscribe(fn: () => void) { ouvintes.add(fn); return () => { ouvintes.delete(fn); }; },
    refresh,
    login: (dados: LoginRequest) => autenticar(() => api.login(dados)),
    register: (dados: CadastroRequest) => autenticar(() => api.register(dados)),
    async logout() {
      if (ocupada) throw new Error("Aguarde a operação de sessão em andamento.");
      ocupada = true; versao++; publicar({ ...estado, carregando: true, erroSessao: "" });
      try { await api.logout(); guardar(null); publicar({ usuario: null, carregando: false, erroSessao: "" }); }
      catch (erro) { publicar({ ...estado, carregando: false }); throw erro; }
      finally { ocupada = false; }
    },
    atualizarPerfil(perfil: string, perfilId: number, dados: { nome: string; email?: string }) {
      const atual = estado.usuario;
      if (!atual || atual.perfil !== perfil || atual.perfilId !== perfilId) return;
      const usuario = { ...atual, nome: dados.nome, email: dados.email ?? atual.email }; guardar(usuario); publicar({ ...estado, usuario });
    },
  };
}
