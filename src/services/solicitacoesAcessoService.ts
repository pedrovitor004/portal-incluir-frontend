import { http } from './http';
import type { SolicitacaoAcesso, Usuario } from '../types/auth';
import { canAccess } from '../config/access';
export function podeAnalisarAcesso(usuario: Usuario | null) { return !!usuario && (usuario.root !== undefined || usuario.administracaoAprovada !== undefined) && ['COORDENADOR', 'ADMINISTRADOR'].includes(usuario.perfil) && canAccess(usuario, 'usuarios.gerenciar'); }
export const solicitacoesAcessoService = {
  async solicitarAdministracao() { return (await http.post<SolicitacaoAcesso>('/solicitacoes-acesso/administracao')).data; },
  async minhas(signal?: AbortSignal) { return (await http.get<SolicitacaoAcesso[]>('/solicitacoes-acesso/minhas', { signal })).data; },
  async listar(todas = false, signal?: AbortSignal) { return (await http.get<SolicitacaoAcesso[]>('/solicitacoes-acesso', { params: { todas }, signal })).data; },
  async decidir(id: number, aprovar: boolean, motivo?: string) { return (await http.post<SolicitacaoAcesso>(`/solicitacoes-acesso/${id}/decisao`, { aprovar, motivo })).data; },
};
