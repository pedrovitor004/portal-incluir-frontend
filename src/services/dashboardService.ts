import { endpoints } from "../config/endpoints";
import type { DashboardCoordenadorData } from "../types/dashboard";
import { http } from "./http";
import type { PlanoEducacionalResponse } from "../types/planoEducacional";
import type { EstudanteResponse } from "../types/estudante";

export function registrosUnicos<T extends { id: number }>(dados: T[]): T[] {
  if (!Array.isArray(dados)) throw new Error("Resposta inválida ao consultar indicadores.");
  return [...new Map(dados.map(item => [item.id, item])).values()];
}

export const dashboardService = {
  async buscarCoordenador(id: number, signal?: AbortSignal): Promise<DashboardCoordenadorData> {
    const opcoes = { signal, params: { _consulta: Date.now() } };
    const [resumo, estudantes, peis] = await Promise.all([
      http.get<DashboardCoordenadorData>(endpoints.coordenadores.dashboard(id), opcoes),
      http.get<EstudanteResponse[]>("/estudantes", opcoes),
      http.get<PlanoEducacionalResponse[]>(endpoints.documentos.pei, opcoes),
    ]);
    if (!Number.isSafeInteger(resumo.data.professoresAtivos) || resumo.data.professoresAtivos < 0) throw new Error("Total de professores indisponível.");
    const meusPeis = registrosUnicos(peis.data).filter(pei => pei.coordenadorId === id);
    const alunos = registrosUnicos(estudantes.data);
    if (meusPeis.some(pei => typeof pei.arquivado !== "boolean") || alunos.some(e => typeof e.ativo !== "boolean")) throw new Error("Situação dos registros indisponível para calcular os indicadores.");
    return {
      estudantesAtivos: alunos.filter(e => e.ativo).length,
      professoresAtivos: resumo.data.professoresAtivos,
      planosAtivos: meusPeis.filter(pei => pei.arquivado === false).length,
      planosArquivados: meusPeis.filter(pei => pei.arquivado === true).length,
      estudantesRecentes: resumo.data.estudantesRecentes,
    };
  },
};
