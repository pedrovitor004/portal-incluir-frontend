import { http } from "./http";
export interface ProfissionalEstudante {
  usuarioId: number | null;
  perfilId: number;
  nome: string;
  perfil: "PROFESSOR" | "EQUIPE_MULTIDISCIPLINAR";
  areaAtuacao: string;
  disciplina: string | null;
  setor: string;
  cursosAtuacao: string[];
  mesmoCurso: boolean;
  ativo: boolean;
  vinculado: boolean;
}
export interface VinculoEstudante {
  id: number;
  versao: number;
  profissional: ProfissionalEstudante;
  ativo: boolean;
  motivo: string;
  motivoEncerramento: string | null;
  dataInicio: string;
  dataEncerramento: string | null;
}
export const vinculosEstudanteService = {
  async listar(id: number, signal?: AbortSignal) { return (await http.get<VinculoEstudante[]>(`/estudantes/${id}/profissionais`, { signal })).data; },
  async candidatos(id: number, signal?: AbortSignal) { return (await http.get<ProfissionalEstudante[]>(`/estudantes/${id}/profissionais/disponiveis`, { signal })).data; },
  async associar(id: number, profissionalId: number, motivo: string) { return (await http.post<VinculoEstudante>(`/estudantes/${id}/profissionais`, { profissionalId, motivo })).data; },
  async encerrar(id: number, vinculo: VinculoEstudante, motivo: string) { return (await http.post<VinculoEstudante>(`/estudantes/${id}/profissionais/${vinculo.id}/encerrar`, { versao: vinculo.versao, motivo })).data; },
};
