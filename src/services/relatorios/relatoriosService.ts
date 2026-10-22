import { canAccess } from "../../config/access";
import { http } from "../http";
import { userSession } from "../sessionStorage";
import type { BaseRelatorio, EstudanteRelatorio } from "../../types/relatorio";
export function exigirAcessoRelatorios() {
  const conta = userSession.read();
  if (!conta || !canAccess(conta, "relatorios")) throw new Error("A geração deste relatório está disponível para a coordenação.");
}
interface EstudanteApi { id: number; curso?: string; periodoIngresso?: string; ativo: boolean; dataConclusao?: string | null; dataLimiteRetencao?: string | null }
interface DocumentoApi { id: number; estudanteId: number; arquivado: boolean; historico?: string; consideracoes?: string }
export function prepararBase(estudantes: EstudanteApi[], peis: DocumentoApi[], planos: DocumentoApi[], agora = new Date()): BaseRelatorio {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(agora);
  const demonstracao = (d: DocumentoApi) => /\[DEMONSTRAÇÃO UI DOCUMENTOS\]/i.test(`${d.historico || ""} ${d.consideracoes || ""}`);
  const ids = (docs: DocumentoApi[]) => new Set(docs.filter(d => !d.arquivado && !demonstracao(d)).map(d => d.estudanteId));
  const comPei = ids(peis), comPlano = ids(planos);
  const unicos = new Map<number, EstudanteRelatorio>();
  for (const e of estudantes) {
    if (!Number.isSafeInteger(e.id) || e.id <= 0 || (e.dataLimiteRetencao && e.dataLimiteRetencao <= hoje)) continue;
    unicos.set(e.id, { id: e.id, curso: e.curso?.trim() || "Não informado", ingresso: e.periodoIngresso?.trim() || "Não informado", situacao: e.ativo ? "Ativo" : "Inativo", concluido: !!e.dataConclusao, pei: comPei.has(e.id), planoAcao: comPlano.has(e.id) });
  }
  return { estudantes: [...unicos.values()], consultadoEm: agora.toISOString(), demonstracoesExcluidas: [...peis, ...planos].filter(demonstracao).length };
}
export const relatoriosService = {
  async consultar(signal?: AbortSignal): Promise<BaseRelatorio> {
    exigirAcessoRelatorios();
    const opcoes = { signal, params: { _consulta: Date.now() } };
    const [estudantes, peis, planos] = await Promise.all([http.get<EstudanteApi[]>("/estudantes", opcoes), http.get<DocumentoApi[]>("/planos-educacionais", opcoes), http.get<DocumentoApi[]>("/planos-acao", opcoes)]);
    if (![estudantes.data, peis.data, planos.data].every(Array.isArray)) throw new Error("Não foi possível organizar os dados do relatório. Tente consultar novamente.");
    return prepararBase(estudantes.data, peis.data, planos.data);
  },
};
