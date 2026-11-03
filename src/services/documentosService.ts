import type { EstudanteResponse } from "../types/estudante";
import { userSession } from "./sessionStorage";
import { canAccess } from "../config/access";
import { acaoPermitida, acaoPeaPermitida, type AcaoDocumento } from "../config/documentActions";
import type { Usuario } from "../types/auth";
import { endpoints } from "../config/endpoints";
import type { ConsultaDocumentos, Documento } from "../types/documento";
import { mensagemErro } from "./apiError";
import { http } from "./http";
import { adaptacoesPedagogicasService } from "./adaptacoesPedagogicasService";
import { camposPea } from "./cadastroPeaValidation";
import type { AdaptacaoPedagogicaResponse } from "../types/adaptacaoPedagogica";

export function mapearPea(pea: AdaptacaoPedagogicaResponse): Documento {
  return {
    chave: `PEA-${pea.id}`, id: pea.id, tipo: "PEA", nome: `PEA · ${pea.componenteCurricular}`,
    estudanteId: pea.estudanteId, estudanteNome: pea.estudanteNome, estudanteMatricula: pea.estudanteMatricula,
    curso: pea.estudanteCurso, periodo: pea.semestreAno, professorId: pea.professorId,
    dataRegistro: pea.dataCriacao, dataAtualizacao: pea.dataAtualizacao,
    arquivado: pea.arquivado, assinado: false, status: pea.arquivado ? "Arquivado" : "Ativo",
    detalhes: [{ titulo: "Professor responsável", valor: pea.professorNome },
      ...camposPea.map(campo => ({ titulo: campo.label, valor: pea[campo.name] }))],
  };
}

export function mapearAnamnese(estudante: EstudanteResponse): Documento {
  return {
    chave: `ANAMNESE-${estudante.id}`, id: estudante.id, tipo: "ANAMNESE", nome: "Anamnese",
    estudanteId: estudante.id, estudanteNome: estudante.nomeCompleto,
    estudanteMatricula: estudante.matricula, curso: estudante.curso, periodo: estudante.periodoIngresso,
    dataRegistro: null, dataAtualizacao: null,
    arquivado: false, assinado: false, status: "Registrada",
    detalhes: [],
  };
}

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
  async buscar(documento: Pick<Documento, "tipo" | "id">, signal?: AbortSignal): Promise<Documento> {
    if (documento.tipo === "ANAMNESE") {
      const { data } = await http.get<EstudanteResponse>(`/estudantes/${documento.id}`, { signal });
      const { camposAnamnese } = await import("./documentosEstudante/exportar");
      return { ...mapearAnamnese(data), detalhes: camposAnamnese(data) };
    }
    if (documento.tipo === "PEA") return mapearPea(await adaptacoesPedagogicasService.buscarPorId(documento.id, signal));
    const fonte = fontes.find(f => f.tipo === documento.tipo);
    if (!fonte) throw new Error("Consulta indisponível para este tipo de documento.");
    const { data } = await http.get<PlanoResponse>(`${fonte.endpoint}/${documento.id}`, { signal });
    return mapearDocumento(data, fonte.tipo);
  },
  async listar(signal?: AbortSignal, professorId?: number): Promise<ConsultaDocumentos> {
    const consultas = fontes.map(async fonte => {
      const { data } = await http.get<PlanoResponse[]>(fonte.endpoint, { signal });
      return data.map(plano => mapearDocumento(plano, fonte.tipo));
    });
    consultas.push(http.get<EstudanteResponse[]>("/estudantes", { signal })
      .then(({ data }) => data.map(mapearAnamnese)));
    if (professorId !== undefined) consultas.push(adaptacoesPedagogicasService.listarPorProfessor(professorId, signal)
      .then(peas => peas.filter(pea => pea.professorId === professorId).map(mapearPea)));
    const respostas = await Promise.allSettled(consultas);
    const consulta: ConsultaDocumentos = { documentos: [], tiposDisponiveis: [], falhas: [] };
    respostas.forEach((resposta, index) => {
      const tipo = fontes[index]?.tipo ?? (index === fontes.length ? "ANAMNESE" : "PEA");
      if (resposta.status === "fulfilled") {
        consulta.documentos.push(...resposta.value);
        consulta.tiposDisponiveis.push(tipo);
      } else consulta.falhas.push({ tipo, mensagem: mensagemErro(resposta.reason) });
    });
    consulta.documentos.sort((a, b) => (b.dataRegistro || "").localeCompare(a.dataRegistro || ""));
    return consulta;
  },
  async executar(documento: Documento, acao: AcaoDocumento, usuario?: Usuario | null): Promise<Documento | null> {
    if (documento.tipo === "PEA") {
      if (!acaoPeaPermitida(documento, acao, usuario === undefined ? userSession.read() : usuario)) throw new Error("Você não tem permissão para esta ação ou o estado do PEA foi alterado.");
      if (acao === "excluir") { await adaptacoesPedagogicasService.excluir(documento.id); return null; }
      const pea = acao === "arquivar"
        ? await adaptacoesPedagogicasService.arquivar(documento.id)
        : await adaptacoesPedagogicasService.desarquivar(documento.id);
      return mapearPea(pea);
    }
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
