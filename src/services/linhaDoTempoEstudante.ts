import type { DadosPerfilEstudante, AdaptacaoEstudante } from "../types/perfilEstudante";
import type { Documento } from "../types/documento";
import type { RegistroAuditoria } from "../types/auditoria";

export type DestinoMovimentacao = { tipo: "alteracao"; registro: RegistroAuditoria } | { tipo: "documento"; documento: Documento } | { tipo: "adaptacao"; adaptacao: AdaptacaoEstudante } | { tipo: "cadastro" };
export type MovimentacaoEstudante = { chave: string; titulo: string; descricao: string; data: string; icone: string; operacao?: RegistroAuditoria["operacao"]; destino: DestinoMovimentacao };
export function montarLinhaDoTempo(dados: DadosPerfilEstudante): MovimentacaoEstudante[] {
  const eventos: MovimentacaoEstudante[] = dados.historico.map(r => ({ chave: `revisao-${r.tabela}-${r.revisao}-${JSON.stringify(r.identidade)}`, titulo: r.tabela === "estudantes_aud" ? "Cadastro do estudante" : r.tabela.includes("adaptacoes") ? "Adaptação pedagógica" : r.tabela.includes("planos_acao") ? "Plano de Ação" : r.tabela.includes("plano") ? "Plano educacional" : "Dados do estudante", descricao: r.operacao === "ADD" ? "Registro incluído no acompanhamento." : r.operacao === "DEL" ? "Registro excluído. Os dados anteriores estão disponíveis para consulta." : "Informações alteradas no acompanhamento.", data: r.data, icone: r.tabela.includes("adaptacoes") ? "adaptacao" : r.tabela.includes("plano") ? "documento" : "usuario", operacao: r.operacao, destino: { tipo: "alteracao", registro: r } }));
  const temHistorico = (tabelas: string[], id: number) => dados.historico.some(r => tabelas.includes(r.tabela) && String(r.identidade.id) === String(id));
  for (const documento of dados.documentos) {
    const tabelas = documento.tipo === "PLANO_ACAO" ? ["planos_acao_aud"] : ["plano_educacional_aud", "planos_educacionais_aud"];
    if (temHistorico(tabelas, documento.id)) continue;
    if (documento.dataRegistro) eventos.push({ chave: `documento-${documento.chave}-criado`, titulo: `${documento.nome} registrado`, descricao: `Período ${documento.periodo}.`, data: documento.dataRegistro, icone: "documento", destino: { tipo: "documento", documento } });
    if (documento.dataAtualizacao && documento.dataAtualizacao !== documento.dataRegistro) eventos.push({ chave: `documento-${documento.chave}-atualizado`, titulo: `${documento.nome} atualizado`, descricao: `Período ${documento.periodo}. Situação atual: ${documento.status.toLocaleLowerCase("pt-BR")}.`, data: documento.dataAtualizacao, icone: "documento", destino: { tipo: "documento", documento } });
  }
  for (const adaptacao of dados.adaptacoes) {
    if (temHistorico(["adaptacoes_pedagogicas_aud"], adaptacao.id)) continue;
    if (adaptacao.dataCriacao) eventos.push({ chave: `adaptacao-${adaptacao.id}-criada`, titulo: "Adaptação registrada", descricao: `${adaptacao.componenteCurricular || "Componente não informado"} · ${adaptacao.professorNome || "Professor não informado"}`, data: adaptacao.dataCriacao, icone: "adaptacao", destino: { tipo: "adaptacao", adaptacao } });
    if (adaptacao.dataAtualizacao && adaptacao.dataAtualizacao !== adaptacao.dataCriacao) eventos.push({ chave: `adaptacao-${adaptacao.id}-atualizada`, titulo: "Adaptação atualizada", descricao: adaptacao.componenteCurricular || "Componente não informado", data: adaptacao.dataAtualizacao, icone: "adaptacao", destino: { tipo: "adaptacao", adaptacao } });
  }
  if (dados.estudante.dataConclusao && !temHistorico(["estudantes_aud"], dados.estudante.id)) eventos.push({ chave: "conclusao", titulo: "Acompanhamento concluído", descricao: "Os dados do estudante estão disponíveis apenas para consulta.", data: dados.estudante.dataConclusao, icone: "escudo", destino: { tipo: "cadastro" } });
  return eventos.filter(e => Number.isFinite(Date.parse(e.data))).sort((a, b) => Date.parse(b.data) - Date.parse(a.data) || a.chave.localeCompare(b.chave));
}
