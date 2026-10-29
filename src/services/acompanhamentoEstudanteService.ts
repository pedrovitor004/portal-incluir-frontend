import { http } from "./http";
import type { EstudanteResponse } from "../types/estudante";
import { fluxoEstudanteService, type FluxoEstudante } from "./fluxoEstudanteService";

export type EtapaEstudante = { id: string; titulo: string; estado: "registrado" | "pendente" | "revisar" | "indisponivel"; resumo: string; destino?: "cadastro" | "perfil" };
type Plano = { estudanteId: number; arquivado: boolean; status?: string };
export function montarEtapas(estudante: EstudanteResponse, planos: Plano[] | null, peis: Plano[] | null, fluxo?: FluxoEstudante | null): EtapaEstudante[] {
  function documento(id: string, titulo: string, dados: Plano[] | null): EtapaEstudante {
    if (dados === null) return { id, titulo, estado: "indisponivel", resumo: "Não foi possível consultar os registros. Tente atualizar o acompanhamento." };
    const registros = dados.filter(d => d.estudanteId === estudante.id);
    const ativos = registros.filter(d => !d.arquivado);
    const assinado = ativos.some(d => d.status === "ASSINADO");
    return { id, titulo, estado: ativos.length ? id === "plano" && !assinado ? "revisar" : "registrado" : "pendente", resumo: ativos.length ? id === "plano" ? assinado ? "Há plano de ação assinado e não arquivado." : "Há plano em rascunho. Falta revisar e assinar." : `${ativos.length} PEI(s) não arquivado(s) registrado(s). A existência do documento não confirma sua revisão.` : registros.length ? "Existem apenas registros arquivados. Verifique a necessidade de um novo documento." : "Nenhum documento registrado para este estudante.", destino: "perfil" };
  }
  return [
    { id: "anamnese", titulo: "Anamnese e cadastro inicial", estado: !fluxo ? "indisponivel" : fluxo.anamneseStatus === "CONCLUIDA" ? "registrado" : fluxo.anamneseStatus === "RASCUNHO" ? "revisar" : "pendente", resumo: !fluxo ? "Não foi possível consultar a situação da anamnese." : fluxo.anamneseStatus === "CONCLUIDA" ? "Anamnese marcada como concluída." : fluxo.anamneseStatus === "RASCUNHO" ? "Cadastro salvo em rascunho. Continue o preenchimento quando desejar." : "Revise o cadastro inicial e preencha a anamnese.", destino: "cadastro" },
    documento("plano", "Plano de Ação", planos),
    documento("pei", "Plano Educacional Individualizado (PEI)", peis),
    { id: "rai", titulo: "Relatório de Acompanhamento Individual (RAI)", estado: "revisar", resumo: "Emita pelo perfil o relatório acumulativo dos dados e documentos registrados até a emissão.", destino: "perfil" },
  ];
}
export const acompanhamentoEstudanteService = {
  async consultar(id: number, signal: AbortSignal) {
    const respostas = await Promise.allSettled([
      http.get<EstudanteResponse>(`/estudantes/${id}`, { signal }),
      http.get<Plano[]>("/planos-acao", { signal }),
      http.get<Plano[]>(`/planos-educacionais/estudante/${id}`, { signal }),
      fluxoEstudanteService.consultar(id, signal),
    ] as const);
    if (respostas[0].status === "rejected") throw respostas[0].reason;
    const estudante = respostas[0].value.data;
    return { estudante, etapas: montarEtapas(estudante, respostas[1].status === "fulfilled" ? respostas[1].value.data : null, respostas[2].status === "fulfilled" ? respostas[2].value.data : null, respostas[3].status === "fulfilled" ? respostas[3].value : null) };
  },
};
