import { http } from './http';
import type { SolicitacaoAcesso, Usuario } from '../types/auth';
import { canAccess } from '../config/access';
export function podeAnalisarAcesso(usuario: Usuario | null) { return !!usuario && (usuario.root === true || usuario.administracaoAprovada === true) && ['COORDENADOR', 'ADMINISTRADOR'].includes(usuario.perfil) && canAccess(usuario, 'usuarios.gerenciar'); }
export function podeDecidirAcesso(usuario: Usuario | null, pedido: SolicitacaoAcesso) {
  return podeAnalisarAcesso(usuario) && pedido.status === 'PENDENTE' && (pedido.tipo === 'CADASTRO' || usuario?.root === true);
}
export const solicitacoesAcessoService = {
  async solicitarAdministracao() { return (await http.post<SolicitacaoAcesso>('/solicitacoes-acesso/administracao')).data; },
  async minhas(signal?: AbortSignal) { return (await http.get<SolicitacaoAcesso[]>('/solicitacoes-acesso/minhas', { signal })).data; },
  async listar(todas = false, signal?: AbortSignal) { return (await http.get<SolicitacaoAcesso[]>('/solicitacoes-acesso', { params: { todas }, signal })).data; },
  async decidir(id: number, aprovar: boolean, motivo?: string) { return (await http.post<SolicitacaoAcesso>(`/solicitacoes-acesso/${id}/decisao`, { aprovar, motivo })).data; },
};
