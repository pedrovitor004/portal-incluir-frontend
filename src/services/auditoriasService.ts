import { http } from "./http";
import type { ConsultaAuditoria, FiltrosAuditoria } from "../types/auditoria";

export const auditoriasService = {
  async tabelas(signal: AbortSignal) {
    return (await http.get<string[]>("/auditorias/tabelas", { signal, withCredentials: true })).data;
  },
  async consultar(filtros: FiltrosAuditoria, pagina: number, signal: AbortSignal, tamanho = 20) {
    const params = Object.fromEntries(Object.entries({ ...filtros, pagina, tamanho }).filter(([, valor]) => valor !== ""));
    return (await http.get<ConsultaAuditoria>("/auditorias", { params, signal, withCredentials: true })).data;
  },
  async listarHistorico(signal: AbortSignal): Promise<ConsultaAuditoria> {
    const filtros = { tabela: "", operacao: "", inicio: "", fim: "", registro: "" };
    const primeira = await this.consultar(filtros, 0, signal, 100);
    const registros = [...primeira.registros];
    for (let pagina = 1; pagina < Math.ceil(primeira.total / 100); pagina++) {
      const lote = await this.consultar(filtros, pagina, signal, 100);
      registros.push(...lote.registros);
    }
    // Chaves estaveis tambem evitam duplicatas se houver novas revisoes durante a consulta.
    const unicos = new Map(registros.map(r => [JSON.stringify([r.tabela, r.revisao, Object.entries(r.identidade).sort(([a], [b]) => a.localeCompare(b))]), r]));
    return { registros: [...unicos.values()], total: unicos.size };
  },
};
