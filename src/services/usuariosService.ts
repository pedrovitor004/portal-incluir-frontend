import { http } from "./http";
import type { Usuario } from "../types/auth";
import type { Permission } from "../config/access";
export interface UsuarioGerenciado extends Usuario {
  ativo: boolean;
  cursosAtuacao?: string[];
  dados: Record<string, string | null>;
  permissoesPadrao: Permission[];
  ajustes: Partial<Record<Permission, boolean>>;
  permissoes: Permission[];
}
export const usuariosService = {
  async listar(signal?: AbortSignal) { return (await http.get<UsuarioGerenciado[]>("/usuarios", { signal })).data; },
  async editar(id: number, dados: Record<string, string | null | string[]>) { return (await http.put<UsuarioGerenciado>(`/usuarios/${id}`, dados)).data; },
  async situacao(id: number, ativo: boolean) { return (await http.patch<UsuarioGerenciado>(`/usuarios/${id}/situacao`, { ativo })).data; },
  async excluir(id: number) { await http.delete(`/usuarios/${id}`); },
  async permissoes(id: number, ajustes: UsuarioGerenciado["ajustes"]) { return (await http.put<UsuarioGerenciado>(`/usuarios/${id}/permissoes`, { ajustes })).data; },
};
