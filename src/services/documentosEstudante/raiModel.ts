import type { RaiConteudo } from "../../types/rai";
import { novoRai } from "../../types/rai";
import type { DadosPerfilEstudante } from "../../types/perfilEstudante";
import { atendimentos, necessidades, condicoes } from "../../config/estudanteFormOptions";
const juntar = (valores: (string | null | undefined)[]) => [...new Set(valores.map(v => v?.trim()).filter((v): v is string => !!v))].join("\n\n");
export function periodoRaiInclui(periodo: string, rai: RaiConteudo): boolean {
 const m = periodo.trim().match(/^(\d{4})(?:[./-]([12]))?$/);
 return !!m && m[1] === rai.anoLetivo && (rai.periodicidade === "ANUAL" || !m[2] || Number(m[2]) === (rai.periodicidade === "BIMESTRAL" ? Math.ceil(Number(rai.numeroPeriodo)/2) : Number(rai.numeroPeriodo)));
}
export function sugerirRai(contexto: DadosPerfilEstudante, selecao: Partial<RaiConteudo> = {}): RaiConteudo {
 if (contexto.falhas.planos || contexto.falhas.peis || contexto.falhas.adaptacoes) throw new Error("Não foi possível consultar todas as fontes do RAI. Tente carregar os dados novamente.");
 const e = contexto.estudante;
 const r = { ...novoRai(), periodicidade: /t[eé]cnico/i.test(e.curso) ? "BIMESTRAL" as const : "SEMESTRAL" as const, anoLetivo: String(new Date().getFullYear()), ...selecao };
 const planos = contexto.planos.filter(p => !p.arquivado && periodoRaiInclui(p.periodoLetivo ?? "", r));
 const peis = (contexto.peis ?? []).filter(p => !p.arquivado && periodoRaiInclui(p.semestreAno ?? "", r));
 const disponiveis = contexto.adaptacoes.filter(a => !a.arquivado && periodoRaiInclui(a.semestreAno, r));
 if (!r.componenteCurricular && new Set(disponiveis.map(a => a.componenteCurricular)).size === 1) r.componenteCurricular = disponiveis[0].componenteCurricular;
 const peas = disponiveis.filter(a => !r.componenteCurricular || a.componenteCurricular === r.componenteCurricular);
 const dePlanos = (chave: "necessidadesEspecificas" | "consideracoes" | "avancosDificuldadesPotencialidades" | "principaisDemandas" | "propostasIntervencao" | "comorbidades" | "medicacoes" | "servicosApoio") => planos.map(p => p[chave] ? `Plano de Ação nº ${p.id}: ${p[chave]}` : "");
 const dePeis = (chave: "necessidadesEspecificas" | "conhecimentosHabilidadesInteresses" | "dificuldadesApresentadas" | "propostasAdaptacoesCurriculares" | "historico") => peis.map(p => p[chave] ? `PEI nº ${p.id}: ${p[chave]}` : "");
 const dePeas = (chave: "objetivoGeral" | "objetivosEspecificos" | "conteudosProgramaticos" | "metodologia" | "avaliacao") => peas.map(p => p[chave] ? `PEA — ${p.componenteCurricular} (${p.professorNome}): ${p[chave]}` : "");
 r.deficiencia = juntar([...(e.necessidadesEspecificas ?? []).map(v => necessidades.find(o => o.value === v)?.label ?? v), e.outraNecessidadeEspecifica, ...dePlanos("necessidadesEspecificas"), ...dePeis("necessidadesEspecificas")]);
 r.acompanhamento = juntar([...(e.atendimentosCampus ?? []).map(v => atendimentos.find(o => o.value === v)?.label ?? v), e.descricaoOutraNecessidadeAtendimento, ...dePlanos("servicosApoio")]);
 r.saude = juntar([...(e.condicoesAssociadas ?? []).map(v => condicoes.find(o => o.value === v)?.label ?? v), e.outraCondicaoAssociada, ...dePlanos("comorbidades"), ...dePlanos("medicacoes")]);
 r.aprendizagem = juntar([...dePeis("dificuldadesApresentadas"), ...dePlanos("principaisDemandas")]);
 r.competencias = juntar([...dePeis("conhecimentosHabilidadesInteresses"), ...dePlanos("avancosDificuldadesPotencialidades")]);
 r.objetivosGerais = juntar(dePeas("objetivoGeral")); r.objetivosEspecificos = juntar(dePeas("objetivosEspecificos"));
 r.comentarios = juntar([...dePlanos("consideracoes"), ...dePeis("dificuldadesApresentadas")]);
 r.avaliacao = juntar([...dePeas("avaliacao"), ...dePeis("propostasAdaptacoesCurriculares")]);
 r.encaminhamentos = juntar(dePlanos("propostasIntervencao"));
 r.consideracoesGerais = juntar([...dePlanos("avancosDificuldadesPotencialidades"), ...dePeis("historico")]);
 const comunicacao = [...dePeas("metodologia"), ...dePeis("necessidadesEspecificas"), e.descricaoOutraNecessidadeAtendimento ?? ""];
 r.comunicacao = juntar(comunicacao.filter(v => /comunica|fala|linguagem|libras|auditiv/i.test(v)));
 const nomes = [...new Set(peas.map(p => p.professorNome).filter(Boolean))].join("; "); r.professor = nomes.length <= 150 ? nomes : "";
 const propostas = juntar([...dePeis("propostasAdaptacoesCurriculares"), ...dePeas("metodologia"), ...dePeas("avaliacao")]);
 r.adequacoes = [];
 if (peas.some(p => p.conteudosProgramaticos?.trim())) r.adequacoes.push("Conteúdos");
 if (peas.some(p => p.objetivoGeral?.trim() || p.objetivosEspecificos?.trim())) r.adequacoes.push("Objetivos");
 if (peas.some(p => p.metodologia?.trim())) r.adequacoes.push("Métodos");
 if (/recurso|tecnologia assistiva|material adaptado/i.test(propostas)) r.adequacoes.push("Recursos");
 if (/tempo ampliado|tempo adicional|temporalidade|prazo ampliado|mais tempo/i.test(propostas)) r.adequacoes.push("Temporalidade");
 if (peas.some(p => p.avaliacao?.trim())) r.adequacoes.push("Avaliação");
 return r;
}
/** Keep manual review; only source values that remain unchanged are refreshed. */
export function atualizarImportados(atual: RaiConteudo, anterior: RaiConteudo, proximo: RaiConteudo): RaiConteudo {
 const r = { ...atual };
 for (const k of Object.keys(proximo) as (keyof RaiConteudo)[]) {
  if (["anoLetivo", "periodicidade", "numeroPeriodo", "data", "local", "campus", "habilidades"].includes(k)) continue;
  if (JSON.stringify(atual[k]) === JSON.stringify(anterior[k]) || atual[k] === "") Object.assign(r, { [k]: proximo[k] });
 }
 return r;
}
export const origensCamposRai: Partial<Record<keyof RaiConteudo, string>> = {
 deficiencia: "Anamnese, Plano de Ação e PEI", acompanhamento: "Anamnese e Plano de Ação", saude: "Anamnese e Plano de Ação",
 comunicacao: "Registros explícitos de comunicação no PEI e PEA", aprendizagem: "PEI e demandas do Plano de Ação", competencias: "Habilidades do PEI e avanços do Plano de Ação",
 objetivosGerais: "PEAs do período", objetivosEspecificos: "PEAs do período", comentarios: "Plano de Ação e PEI", avaliacao: "PEA e propostas do PEI",
 encaminhamentos: "Intervenções do Plano de Ação", consideracoesGerais: "Plano de Ação e histórico do PEI", adequacoes: "Campos dos PEAs e propostas do PEI; confirme as adaptações aplicadas",
};
