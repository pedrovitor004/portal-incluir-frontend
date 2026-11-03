import axios from "axios";
import type { Usuario } from "../types/auth";
import { canAccess } from "../config/access";
import { camposPea, prepararConteudoPea } from "./cadastroPeaValidation";
import type { AdaptacaoPedagogicaConteudo } from "../types/adaptacaoPedagogica";
import type { SolicitacaoPeaRequest, SolicitacaoPeaResponse, ProfessorElegivelPea } from "../types/solicitacaoPea";

export const nomesSituacaoPea = {
  PENDENTE: "Solicitação pendente", ENTREGUE: "PEA entregue", CANCELADO: "Solicitação cancelada",
  CANCELADA: "Solicitação cancelada", PARCIALMENTE_ENTREGUE_CANCELADA: "Parcialmente entregue e cancelada",
} as const;
export function meuDestinatario(s: SolicitacaoPeaResponse, usuario: Usuario | null) {
  return usuario?.perfil === "PROFESSOR" ? s.destinatarios.find(d => d.professorId === usuario.perfilId) : undefined;
}
export function podeGerenciarSolicitacoes(usuario: Usuario | null) {
  return usuario?.perfil === "COORDENADOR" && canAccess(usuario, "pei.editar") && canAccess(usuario, "estudantes.consultar");
}
export function prepararSolicitacaoPea(dados: SolicitacaoPeaRequest, elegiveis: ProfessorElegivelPea[], usuario: Usuario | null): SolicitacaoPeaRequest {
  if (!dados.contexto.trim() || dados.contexto.length > 150) throw new Error("Informe contexto/período com até 150 caracteres.");
  if ((dados.orientacoes?.length ?? 0) > 2000) throw new Error("As orientações devem ter até 2000 caracteres.");
  if (!podeCriarSolicitacaoPea(usuario)) throw new Error("Você não tem permissão para estabelecer vínculos de acompanhamento e solicitar PEA.");
  const comum = { modalidade: dados.modalidade, contexto: dados.contexto.trim(), orientacoes: dados.orientacoes?.trim() || undefined };
  if (dados.modalidade === "PROFESSORES") {
    const ids = [...new Set(dados.professorIds ?? [])].sort((a,b) => a-b);
    if (!ids.length || ids.length > 500 || ids.some(id => !elegiveis.some(p => p.professorId === id))) throw new Error("Selecione de 1 a 500 professores elegíveis.");
    return { ...comum, professorIds: ids };
  }
  if (dados.modalidade === "SETOR") {
    if (!dados.setor?.trim() || dados.setor.length > 120 || !elegiveis.length) throw new Error("Selecione um setor com professores elegíveis.");
    return { ...comum, setor: dados.setor.trim() };
  }
  if (dados.modalidade !== "TODOS" || !elegiveis.length) throw new Error("Não há professores elegíveis para esta seleção.");
  return comum;
}
export function exigirSolicitacaoEntregavel(s: SolicitacaoPeaResponse, usuario: Usuario | null) {
  if (!usuario || !canAccess(usuario, "pedagogico.consultar") || !canAccess(usuario, "pedagogico.editar") || meuDestinatario(s, usuario)?.situacao !== "PENDENTE")
    throw new Error("Esta solicitação não está disponível para sua entrega.");
}
export function prepararEntregaPea(conteudo: AdaptacaoPedagogicaConteudo, s: SolicitacaoPeaResponse, usuario: Usuario | null) {
  exigirSolicitacaoEntregavel(s, usuario);
  // A solicitação fornece a identidade; não consulta estudante, vínculo ou PEI.
  const validado = prepararConteudoPea(conteudo);
  return Object.fromEntries(camposPea.map(c => [c.name, validado[c.name]])) as unknown as AdaptacaoPedagogicaConteudo;
}
export function mensagemErroSolicitacaoPea(erro: unknown) {
  if (!axios.isAxiosError(erro)) return erro instanceof Error ? erro.message : "Não foi possível concluir a operação.";
  const mensagens: Record<number, string> = {
    400: "Verifique os dados informados.", 401: "Sua sessão expirou. Entre novamente para continuar.",
    403: "Você não tem autorização para esta operação.", 404: "A solicitação ou o documento não está disponível.",
    409: "Os dados foram alterados ou existe um registro equivalente. Atualize o andamento antes de continuar.",
    410: "O prazo de disponibilidade deste registro terminou.",
  };
  const status = erro.response?.status;
  if (!status) return "Não foi possível conectar ao servidor. Seus dados foram mantidos; tente novamente.";
  const padrao = mensagens[status] ?? "Não foi possível concluir a operação. Tente novamente.";
  const detalhe: unknown = erro.response?.data?.message;
  return typeof detalhe === "string" && detalhe !== padrao ? `${padrao} ${detalhe}` : padrao;
}
/** Uma chave por conteúdo nesta operação; inclusive após falha de rede. */
export function criarChavesIdempotencia(gerar = () => crypto.randomUUID()) {
  const chaves = new Map<string, string>();
  return (conteudo: unknown) => {
    const assinatura = JSON.stringify(conteudo);
    let chave = chaves.get(assinatura);
    if (!chave) { chave = gerar(); chaves.set(assinatura, chave); }
    return chave;
  };
}

// Mesmo critério de comparação do backend; a lista é sempre obtida da API.
export function normalizarSetorPea(setor: string) {
  return setor.normalize("NFD").replace(/\p{M}/gu, "").trim().replace(/\s+/g, " ").toLowerCase();
}
export function previaDestinatariosPea(dados: SolicitacaoPeaRequest, elegiveis: ProfessorElegivelPea[]) {
  return elegiveis.filter(p => dados.modalidade === "TODOS" || (dados.modalidade === "PROFESSORES"
    ? dados.professorIds?.includes(p.professorId)
    : !!dados.setor?.trim() && normalizarSetorPea(p.setor) === normalizarSetorPea(dados.setor)));
}

export function podeCriarSolicitacaoPea(usuario: Usuario | null) {
  return podeGerenciarSolicitacoes(usuario) && !!usuario && canAccess(usuario, "estudantes.vincular");
}
export function modoCadastroPea(params: URLSearchParams) {
  if (params.has("peaId") && params.has("solicitacaoId")) throw new Error("Não combine edição de PEA com entrega de solicitação.");
  const peaId = params.get("peaId"), solicitacaoId = params.get("solicitacaoId");
  for (const nome of ["peaId", "solicitacaoId"]) {
    if (params.has(nome) && (!/^\d+$/.test(params.get(nome) ?? "") || !Number.isSafeInteger(Number(params.get(nome))) || Number(params.get(nome)) <= 0))
      throw new Error("O PEA ou a solicitação informada é inválida.");
  }
  return { peaId, solicitacaoId };
}
