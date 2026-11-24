import type { EstudanteRequest } from "../types/estudante";
import type { PlanoAcaoRequest } from "../types/planoAcao";
import type { EtapaFluxo } from "./fluxoEstudanteService";
import type { Permission } from "../config/access";

export const nomesEtapas: Record<EtapaFluxo, string> = { ANAMNESE: "Anamnese", PLANO_ACAO: "Plano de ação", PEI: "PEI" };
export const permissoesEtapa: Record<EtapaFluxo, Permission[]> = {
  ANAMNESE: ["estudantes.consultar", "anamnese", "sensivel.consultar"],
  PLANO_ACAO: ["estudantes.consultar", "planos.gerar", "sensivel.consultar"],
  PEI: ["estudantes.consultar", "pei.consultar", "pei.editar", "sensivel.consultar"],
};
export function pendenciasAnamnese(dados: EstudanteRequest): string[] {
  const campos = [["nomeCompleto", "Nome completo"], ["dataNascimento", "Data de nascimento"], ["curso", "Curso"], ["matricula", "Matrícula"], ["periodoIngresso", "Período de ingresso"]] as const;
  return [...campos.filter(([campo]) => !dados[campo]?.trim()).map(([, nome]) => nome), ...(dados.possuiNecessidadeEspecifica === null ? ["Informar se possui necessidade específica"] : [])];
}
export function pendenciasPlano(dados: Omit<PlanoAcaoRequest, "estudanteId" | "coordenadorResponsavelId">): string[] {
  const campos = [["periodoLetivo", "Período letivo"], ["nomeResponsavel", "Nome do responsável"], ["grauParentesco", "Grau de parentesco"], ["telefoneResponsavel", "Telefone do responsável"], ["emailResponsavel", "E-mail do responsável"], ["necessidadesEspecificas", "Necessidades específicas"], ["consideracoes", "Considerações"], ["avancosDificuldadesPotencialidades", "Avanços, dificuldades e potencialidades"], ["principaisDemandas", "Principais demandas"], ["propostasIntervencao", "Propostas de intervenção"]] as const;
  const condicionais = [["possuiComorbidade", "comorbidades", "Descrição das comorbidades"], ["usaMedicacaoContinua", "medicacoes", "Medicações"], ["frequentaServicoApoio", "servicosApoio", "Serviços de apoio"], ["possuiDocumentosComprobatorios", "documentosComprobatorios", "Documentos comprobatórios"]] as const;
  return [...campos.filter(([campo]) => !dados[campo]?.trim()).map(([, nome]) => nome), ...condicionais.filter(([condicao, campo]) => dados[condicao] && !dados[campo]?.trim()).map(([, , nome]) => nome)];
}
