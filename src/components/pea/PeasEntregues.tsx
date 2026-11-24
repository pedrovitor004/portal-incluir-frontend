import { useCallback } from "react";
import { adaptacoesPedagogicasService } from "../../services/adaptacoesPedagogicasService";
import { useConsultaPea } from "../../hooks/useConsultaPea";
import ConsultaPeaState from "./ConsultaPeaState";
import Button from "../common/Button";
export default function PeasEntregues({ estudanteId, onView }: { estudanteId: number; onView: (id: number) => void }) {
 const consultar = useCallback((signal: AbortSignal) => adaptacoesPedagogicasService.listarPorEstudante(estudanteId, signal), [estudanteId]);
 const consulta = useConsultaPea(consultar);
 return <section aria-label="PEAs já entregues" className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/20 p-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">PEAs já entregues</h3><Button variant="secondary" disabled={consulta.carregando} onClick={consulta.recarregar}>Atualizar entregas</Button></div>
  <p className="text-sm text-slate-600">Todos os PEAs registrados para este estudante que você pode consultar, incluindo arquivados, entregas de pedidos de outros coordenadores e cadastros sem solicitação.</p>
  <ConsultaPeaState {...consulta} onRetry={consulta.recarregar} />
  {!consulta.carregando && !consulta.erro && consulta.dados?.length === 0 && <p role="status" className="text-sm text-slate-600">Nenhum PEA registrado para este estudante.</p>}
  {!consulta.carregando && !consulta.erro && <ul className="divide-y divide-slate-200">{consulta.dados?.map(p => <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-sm font-semibold">{p.componenteCurricular} · {p.semestreAno}</p><p className="text-sm text-slate-600">{p.professorNome} · {p.arquivado ? "Arquivado" : "Registrado"}</p></div><Button variant="secondary" onClick={() => onView(p.id)}>Consultar PEA entregue</Button></li>)}</ul>}
 </section>;
}
