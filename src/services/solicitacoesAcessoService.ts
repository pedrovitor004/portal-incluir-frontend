import { http } from './http';
import type { SolicitacaoAcesso, Usuario, CadastroRequest } from '../types/auth';
import { canAccess } from '../config/access';
export function podeAnalisarAcesso(usuario: Usuario | null) { return !!usuario && ['COORDENADOR', 'ADMINISTRADOR'].includes(usuario.perfil) && canAccess(usuario, 'usuarios.gerenciar'); }
export const solicitacoesAcessoService = {
  async cadastrar(dados: CadastroRequest) { return (await http.post<SolicitacaoAcesso>('/auth/register', dados)).data; },
  async solicitarAdministracao() { return (await http.post<SolicitacaoAcesso>('/solicitacoes-acesso/administracao')).data; },
  async minhas(signal?: AbortSignal) { return (await http.get<SolicitacaoAcesso[]>('/solicitacoes-acesso/minhas', { signal })).data; },
  async listar(todas = false, signal?: AbortSignal) { return (await http.get<SolicitacaoAcesso[]>('/solicitacoes-acesso', { params: { todas }, signal })).data; },
  async decidir(id: number, aprovar: boolean, motivo?: string) { return (await http.post<SolicitacaoAcesso>(`/solicitacoes-acesso/${id}/decisao`, { aprovar, motivo })).data; },
};
