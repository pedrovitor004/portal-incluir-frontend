import { acessibilidades, atendimentos, condicoes, necessidades } from "../../config/estudanteFormOptions";
import type { DadosPerfilEstudante } from "../../types/perfilEstudante";
import type { RegistroAuditoria } from "../../types/auditoria";
import { montarLinhaDoTempo } from "../linhaDoTempoEstudante";

export type SecaoHistorico = { titulo: string; campos: [string, string][] };
export type AlteracaoHistorico = { titulo: string; data: string; campos: [string, string, string][]; observacao: string };
export type HistoricoEstudanteDocumento = { nome: string; matricula: string; emitidoEm: string; emitidoPor: string; secoes: SecaoHistorico[]; movimentacoes: [string, string, string][]; alteracoes: AlteracaoHistorico[] };
const rotulos: Record<string, string> = {
  id: "Identificação do registro", estudanteId: "Identificação do estudante", estudanteNome: "Estudante", estudanteMatricula: "Matrícula", estudanteCurso: "Curso",
  nome: "Nome", nomeCompleto: "Nome completo", dataNascimento: "Data de nascimento", curso: "Curso", matricula: "Matrícula", periodoIngresso: "Período de ingresso", telefone: "Telefone", email: "E-mail",
  nomeResponsavel: "Nome do responsável", telefoneResponsavel: "Telefone do responsável", emailResponsavel: "E-mail do responsável", grauParentesco: "Grau de parentesco",
  ativo: "Ativo", concluido: "Concluído", dataConclusao: "Data de conclusão", dataLimiteRetencao: "Dados guardados até", possuiNecessidadeEspecifica: "Possui necessidade específica?", necessidadesEspecificas: "Necessidades específicas", outraNecessidadeEspecifica: "Outra necessidade específica",
  condicoesAssociadas: "Condições associadas", outraCondicaoAssociada: "Outra condição associada", atendimentosCampus: "Atendimentos no campus", acessibilidadesFisicas: "Acessibilidade física", outraAcessibilidadeFisica: "Outra acessibilidade física", possuiOutraNecessidadeAtendimento: "Possui outra necessidade de atendimento?", descricaoOutraNecessidadeAtendimento: "Descrição da necessidade de atendimento",
  status: "Situação", arquivado: "Arquivado", dataCriacao: "Data de registro", dataAtualizacao: "Última atualização", dataAssinatura: "Data de assinatura", periodoLetivo: "Período letivo", semestreAno: "Semestre/ano", coordenadorResponsavelNome: "Coordenação responsável", coordenadorResponsavelId: "Identificação da coordenação responsável", coordenadorNome: "Coordenação responsável",
  possuiComorbidade: "Possui comorbidade?", comorbidades: "Comorbidades informadas", usaMedicacaoContinua: "Usa medicação contínua?", medicacoes: "Medicações informadas", frequentaServicoApoio: "Frequenta serviço de apoio?", servicosApoio: "Serviços de apoio", possuiDocumentosComprobatorios: "Possui documentos comprobatórios?", documentosComprobatorios: "Documentos comprobatórios informados",
  consideracoes: "Considerações", avancosDificuldadesPotencialidades: "Avanços, dificuldades e potencialidades", principaisDemandas: "Principais demandas", propostasIntervencao: "Propostas de intervenção", professorNome: "Professor(a)", professorId: "Identificação do professor", componenteCurricular: "Componente curricular", objetivoGeral: "Objetivo geral", objetivosEspecificos: "Objetivos específicos", conteudosProgramaticos: "Conteúdos programáticos", metodologia: "Metodologia", avaliacao: "Avaliação", bibliografiaBasica: "Bibliografia básica", bibliografiaComplementar: "Bibliografia complementar", historico: "Histórico", conhecimentosHabilidadesInteresses: "Conhecimentos, habilidades e interesses", dificuldadesApresentadas: "Dificuldades apresentadas", propostasAdaptacoesCurriculares: "Propostas de adaptações curriculares", adaptacoesPedagogicas: "Adaptações pedagógicas", versao: "Versão do registro",
};
const nomesValores = Object.fromEntries([...necessidades, ...condicoes, ...atendimentos, ...acessibilidades].filter(o => o.value !== "OUTRA").map(o => [o.value, o.label]));
Object.assign(nomesValores, { RASCUNHO: "Rascunho", ASSINADO: "Assinado", OUTRA: "Outra" });
export function rotuloHistorico(chave: string): string {
  const camel = chave.replace(/_([a-z])/g, (_, letra: string) => letra.toUpperCase());
  const texto = camel.replace(/([a-z])([A-Z])/g, "$1 $2");
  return rotulos[camel] || texto.charAt(0).toUpperCase() + texto.slice(1);
}
export function dataHistorico(value: string | null | undefined): string {
  if (!value) return "Data e horário não informados";
  const data = /^(\d{4})-(\d{2})-(\d{2})(?:T| )(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(value);
  if (data) return `${data[3]}/${data[2]}/${data[1]} ${data[4]}:${data[5]}${data[6] ? ":" + data[6] : ""} (horário registrado)`;
  const dia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dia) return `${dia[3]}/${dia[2]}/${dia[1]} - horário não informado`;
  const instante = new Date(value);
  return Number.isNaN(instante.getTime()) ? value : `${instante.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour12: false })} (Brasília)`;
}
export function valorHistorico(value: unknown): string {
  if (value === undefined) return "Não registrado";
  if (value === null || value === "") return "Sem valor informado";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (Array.isArray(value)) return value.length ? value.map(valorHistorico).join("\n") : "Nenhum item registrado";
  if (typeof value === "object") return Object.entries(value).map(([k, v]) => `${rotuloHistorico(k)}: ${valorHistorico(v)}`).join("\n");
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:$|T| )/.test(value)) return dataHistorico(value);
  return nomesValores[String(value)] || String(value);
}
const nomesOperacoes = { ADD: "Inclusão", MOD: "Alteração", DEL: "Exclusão" };
function nomeArea(tabela: string): string {
  if (tabela === "estudantes_aud") return "Cadastro do estudante";
  if (tabela.includes("adaptacoes")) return "Adaptação pedagógica";
  if (tabela.includes("planos_acao")) return "Plano de Ação";
  if (tabela.includes("plano")) return "Plano Educacional Individualizado";
  if (tabela.includes("necessidades")) return "Necessidades específicas";
  if (tabela.includes("condicoes")) return "Condições associadas";
  if (tabela.includes("atendimentos")) return "Atendimentos no campus";
  if (tabela.includes("acessibilidades")) return "Acessibilidade física";
  return "Dados do acompanhamento";
}
export function montarAlteracao(registro: RegistroAuditoria): AlteracaoHistorico {
  const detalhes = registro.detalhes;
  const chaves = [...new Set([...Object.keys(detalhes?.antes ?? {}), ...Object.keys(detalhes?.depois ?? {}), ...Object.keys(detalhes?.camposAlterados ?? {})])];
  const campos: [string, string, string][] = chaves.map(chave => {
    const mudanca = detalhes?.camposAlterados?.[chave];
    const anterior = detalhes?.antes && Object.hasOwn(detalhes.antes, chave) ? detalhes.antes[chave] : mudanca?.antes;
    const posterior = detalhes?.depois && Object.hasOwn(detalhes.depois, chave) ? detalhes.depois[chave] : mudanca?.depois;
    return [rotuloHistorico(chave) + (mudanca ? " (alterado)" : ""), registro.operacao === "ADD" ? "O registro ainda não existia" : detalhes?.anteriorDisponivel === false ? "Estado anterior não disponível" : valorHistorico(anterior), registro.operacao === "DEL" ? "Registro excluído" : valorHistorico(posterior)];
  });
  const identificacao = Object.entries(registro.identidade).map(([k, v]) => `${rotuloHistorico(k)}: ${valorHistorico(v)}`).join("; ");
  return { titulo: `${nomesOperacoes[registro.operacao]} - ${nomeArea(registro.tabela)} - Revisão ${registro.revisao}`, data: dataHistorico(registro.data), campos, observacao: `${identificacao}. Autoria da movimentação: não registrada.${!detalhes ? " Os valores desta movimentação não estão disponíveis." : detalhes.anteriorDisponivel === false ? " O estado anterior desta movimentação não está disponível." : ""}` };
}
export class HistoricoIncompletoError extends Error {}
export function montarHistoricoEstudante(dados: DadosPerfilEstudante, emitidoEm: string, emitidoPor: string): HistoricoEstudanteDocumento {
  if (Object.keys(dados.falhas).length) throw new HistoricoIncompletoError(`Não foi possível reunir todo o histórico do estudante. ${Object.values(dados.falhas).join(" ")} O documento não foi gerado. Tente novamente após concluir a consulta.`);
  const estudante = dados.estudante;
  const secoes: SecaoHistorico[] = [{ titulo: "1. Dados pessoais, acadêmicos e de contato", campos: Object.entries(estudante).map(([k, v]) => [rotuloHistorico(k), valorHistorico(v)]) }];
  for (const plano of dados.planos) secoes.push({ titulo: `Plano de Ação - ${plano.periodoLetivo || "Período não informado"} - Registro ${plano.id}`, campos: Object.entries(plano).map(([k, v]) => [rotuloHistorico(k), valorHistorico(v)]) });
  for (const doc of dados.documentos.filter(d => d.tipo !== "PLANO_ACAO" || !dados.planos.some(p => p.id === d.id))) secoes.push({ titulo: `${doc.nome} - ${doc.periodo} - Registro ${doc.id}`, campos: [["Situação", doc.status], ["Data de registro", dataHistorico(doc.dataRegistro)], ["Última atualização", dataHistorico(doc.dataAtualizacao)], ...doc.detalhes.map(d => [d.titulo, d.valor] as [string, string])] });
  for (const adaptacao of dados.adaptacoes) secoes.push({ titulo: `Adaptação pedagógica - ${adaptacao.componenteCurricular || "Componente não informado"} - Registro ${adaptacao.id}`, campos: Object.entries(adaptacao).map(([k, v]) => [rotuloHistorico(k), valorHistorico(v)]) });
  secoes.push({ titulo: "Alcance do documento", campos: [["Registros incluídos", "Dados do cadastro, informações da anamnese, Planos de Ação, PEIs, adaptações e alterações disponíveis no Portal Incluir na data da emissão. Registros arquivados e exclusões presentes no histórico também estão incluídos."], ["Datas e horários", "As datas e os horários são apresentados conforme registrados. Horários com indicação de fuso são apresentados no horário de Brasília. Horários não registrados são identificados como não informados."], ["Outros registros", "RAIs, arquivos anexos e atividades realizadas fora do portal não estão disponíveis nesta consulta. A ausência de registro não confirma que uma atividade não foi realizada."]] });
  return { nome: estudante.nomeCompleto, matricula: estudante.matricula, emitidoEm, emitidoPor, secoes, movimentacoes: montarLinhaDoTempo(dados).slice().reverse().map(e => [dataHistorico(e.data), e.titulo, `${e.operacao ? nomesOperacoes[e.operacao] + ". " : ""}${e.descricao}`]), alteracoes: dados.historico.slice().sort((a, b) => a.revisao - b.revisao).map(montarAlteracao) };
}
