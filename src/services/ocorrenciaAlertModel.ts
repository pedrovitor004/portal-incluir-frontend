import type { NotificacaoFluxo } from "./notificacoesService";
export function detectarNovasOcorrencias(anteriores: Set<number> | null, recebidas: NotificacaoFluxo[]) {
 const ids = new Set(recebidas.map(n=>n.id));
 const novas = anteriores === null ? [] : recebidas.filter(n=>n.etapa==="OCORRENCIA"&&!n.lida&&!anteriores.has(n.id));
 if(anteriores) for(const id of anteriores) ids.add(id);
 const pendentes = recebidas.filter(n => n.etapa === "OCORRENCIA" && !n.lida);
 return { ids, novas, iniciais: anteriores === null ? pendentes : [] };
}
