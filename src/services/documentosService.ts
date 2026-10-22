import { userSession } from "./sessionStorage";
import { canAccess } from "../config/access";
import { acaoPermitida, type AcaoDocumento } from "../config/documentActions";
import { endpoints } from "../config/endpoints";
import type { ConsultaDocumentos, Documento } from "../types/documento";
import { mensagemErro } from "./apiError";
import { http } from "./http";

export interface PlanoResponse {
  adaptacoesPedagogicas?: {
    componenteCurricular?: string;
    professorNome?: string;
    objetivoGeral?: string;
    objetivosEspecificos?: string;
    conteudosProgramaticos?: string;
    metodologia?: string;
    avaliacao?: string;
    bibliografiaBasica?: string;
    bibliografiaComplementar?: string;
  }[];
  id: number;
  estudanteId: number;
  estudanteNome: string;
  estudanteMatricula: string;
  estudanteCurso: string;
  coordenadorNome?: string;
  coordenadorResponsavelNome?: string;
  semestreAno?: string;
  periodoLetivo?: string;
  arquivado: boolean;
  status?: "RASCUNHO" | "ASSINADO";
  dataCriacao?: string;
  dataAtualizacao?: string;
  historico?: string;
  necessidadesEspecificas?: string;
  conhecimentosHabilidadesInteresses?: string;
  dificuldadesApresentadas?: string;
  propostasAdaptacoesCurriculares?: string;
  consideracoes?: string;
  avancosDificuldadesPotencialidades?: string;
  principaisDemandas?: string;
  propostasIntervencao?: string;
  nomeResponsavel?: string;
  grauParentesco?: string;
  telefoneResponsavel?: string;
  emailResponsavel?: string;
  possuiComorbidade?: boolean;
  comorbidades?: string;
  usaMedicacaoContinua?: boolean;
  medicacoes?: string;
  frequentaServicoApoio?: boolean;
  servicosApoio?: string;
  possuiDocumentosComprobatorios?: boolean;
  documentosComprobatorios?: string;
}

const campos: [keyof PlanoResponse, string][] = [
  ["coordenadorNome", "Coordenação responsável"], ["coordenadorResponsavelNome", "Coordenação responsável"],
  ["historico", "Histórico"], ["necessidadesEspecificas", "Necessidades específicas"],
  ["conhecimentosHabilidadesInteresses", "Conhecimentos, habilidades e interesses"],
  ["dificuldadesApresentadas", "Dificuldades apresentadas"],
  ["propostasAdaptacoesCurriculares", "Propostas de adaptações curriculares"],
  ["nomeResponsavel", "Responsável"], ["grauParentesco", "Grau de parentesco"],
  ["telefoneResponsavel", "Telefone do responsável"], ["emailResponsavel", "E-mail do responsável"],
  ["possuiComorbidade", "Possui comorbidade"], ["comorbidades", "Comorbidades"],
  ["usaMedicacaoContinua", "Uso contínuo de medicação"], ["medicacoes", "Medicações"],
  ["frequentaServicoApoio", "Frequenta serviço de apoio"], ["servicosApoio", "Serviços de apoio"],
  ["possuiDocumentosComprobatorios", "Possui documentos comprobatórios"], ["documentosComprobatorios", "Documentos comprobatórios"],
  ["consideracoes", "Considerações"], ["avancosDificuldadesPotencialidades", "Avanços, dificuldades e potencialidades"],
  ["principaisDemandas", "Principais demandas"], ["propostasIntervencao", "Propostas de intervenção"],
];

export function mapearDocumento(plano: PlanoResponse, tipo: "PEI" | "PLANO_ACAO"): Documento {
  const assinado = plano.status === "ASSINADO";
  const situacao = tipo === "PEI" ? "Ativo" : assinado ? "Assinado" : "Rascunho";
  return {
    chave: `${tipo}-${plano.id}`, id: plano.id, tipo,
    nome: tipo === "PEI" ? "PEI" : "Plano de ação",
    estudanteId: plano.estudanteId, estudanteNome: plano.estudanteNome,
    estudanteMatricula: plano.estudanteMatricula, curso: plano.estudanteCurso,
    periodo: plano.semestreAno || plano.periodoLetivo || "Não informado",
    dataRegistro: plano.dataCriacao || null, dataAtualizacao: plano.dataAtualizacao || null,
    arquivado: plano.arquivado, assinado,
    status: plano.arquivado ? `Arquivado${assinado ? " · Assinado" : ""}` : situacao,
    detalhes: [...campos.flatMap(([campo, titulo]) => {
      const valor = plano[campo];
      return valor === null || valor === undefined || valor === "" ? [] : [{ titulo, valor: typeof valor === "boolean" ? valor ? "Sim" : "Não" : String(valor) }];
    }), ...(plano.adaptacoesPedagogicas || []).map((adaptacao, index) => ({
      titulo: `Adaptação pedagógica: ${adaptacao.componenteCurricular || index + 1}`,
      valor: [
        ["Docente", adaptacao.professorNome], ["Objetivo geral", adaptacao.objetivoGeral],
        ["Objetivos específicos", adaptacao.objetivosEspecificos], ["Conteúdos programáticos", adaptacao.conteudosProgramaticos],
        ["Metodologia", adaptacao.metodologia], ["Avaliação", adaptacao.avaliacao],
        ["Bibliografia básica", adaptacao.bibliografiaBasica], ["Bibliografia complementar", adaptacao.bibliografiaComplementar],
      ].filter(([, valor]) => valor).map(([titulo, valor]) => `${titulo}: ${valor}`).join("\n\n"),
    }))],
  };
}

const fontes = [
  { tipo: "PEI", endpoint: endpoints.documentos.pei },
  { tipo: "PLANO_ACAO", endpoint: endpoints.documentos.planoAcao },
] as const;

export const documentosService = {
  async listar(signal?: AbortSignal): Promise<ConsultaDocumentos> {
    const respostas = await Promise.allSettled(fontes.map(async fonte => {
      const { data } = await http.get<PlanoResponse[]>(fonte.endpoint, { signal });
      return data.map(plano => mapearDocumento(plano, fonte.tipo));
    }));
    const consulta: ConsultaDocumentos = { documentos: [], tiposDisponiveis: [], falhas: [] };
    respostas.forEach((resposta, index) => {
      const tipo = fontes[index].tipo;
      if (resposta.status === "fulfilled") {
        consulta.documentos.push(...resposta.value);
        consulta.tiposDisponiveis.push(tipo);
      } else consulta.falhas.push({ tipo, mensagem: mensagemErro(resposta.reason) });
    });
    consulta.documentos.sort((a, b) => (b.dataRegistro || "").localeCompare(a.dataRegistro || ""));
    return consulta;
  },
  async executar(documento: Documento, acao: AcaoDocumento): Promise<Documento | null> {
    const conta = userSession.read();
    if (!conta || !canAccess(conta, "documentos.gerenciar")) throw new Error("Você não tem permissão para gerenciar documentos.");
    if (!acaoPermitida(documento, acao)) throw new Error("Esta ação não está disponível para o estado atual do documento.");
    const fonte = fontes.find(f => f.tipo === documento.tipo)!;
    const url = `${fonte.endpoint}/${documento.id}`;
    if (acao === "excluir") { await http.delete(url); return null; }
    const { data } = await http.post<PlanoResponse>(`${url}/${acao}`);
    return mapearDocumento(data, fonte.tipo);
  },
  async excluir(documento: Documento): Promise<void> {
    await documentosService.executar(documento, "excluir");
  },
};
