import { useCallback, useId, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { useConsultaPea } from "../../../hooks/useConsultaPea";
import { solicitacoesPeaService } from "../../../services/solicitacoesPeaService";
import { meuDestinatario } from "../../../services/solicitacaoPeaModel";
import { canAccess } from "../../../config/access";
import { routes } from "../../../config/routes";
import ConsultaPeaState from "../../../components/pea/ConsultaPeaState";
import SolicitacaoPeaCard from "../../../components/pea/SolicitacaoPeaCard";
import Button from "../../../components/common/Button";
function ListaSolicitacoesPea() {
  const { usuario } = useAuth();
  const consultar = useCallback((signal: AbortSignal) => solicitacoesPeaService.recebidas(signal), []);
  const consulta = useConsultaPea(consultar);
  const [aba, setAba] = useState<"abertas" | "entregues">("abertas");
  const abasId = useId();
  const solicitacoes = consulta.dados ?? [];
  const abertas = solicitacoes.filter(s => meuDestinatario(s, usuario)?.situacao === "PENDENTE");
  const entregues = solicitacoes.filter(s => meuDestinatario(s, usuario)?.situacao === "ENTREGUE");
  const canceladas = solicitacoes.filter(s => meuDestinatario(s, usuario)?.situacao === "CANCELADO");
  const visiveis = aba === "abertas" ? abertas : entregues;
  const abas = [{ id: "abertas", titulo: "Em aberto", total: abertas.length }, { id: "entregues", titulo: "Entregues", total: entregues.length }] as const;
  return <main className="mx-auto max-w-[1100px] space-y-6 pb-10">
    <header><h1 className="text-2xl font-bold text-primary">Solicitações de PEA recebidas</h1><p className="mt-2 text-sm text-slate-600">Consulte as orientações da coordenação e entregue seu PEA solicitado, mesmo sem PEI ou vínculo permanente com o estudante.</p></header>
    <div className="flex flex-wrap gap-4">{usuario && canAccess(usuario,"documentos") && <Link className="font-semibold text-green-800 underline" to="/professor/documentos">Voltar aos documentos</Link>}<Button variant="secondary" disabled={consulta.carregando} onClick={consulta.recarregar}>Atualizar solicitações</Button></div>
    <ConsultaPeaState {...consulta} onRetry={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && consulta.dados?.length === 0 && <p role="status">Nenhuma solicitação recebida disponível.</p>}
    <div role="tablist" aria-label="Situação das solicitações de PEA" className="grid grid-cols-2 gap-2 rounded-xl border border-[#dce5dc] bg-white p-2">
      {abas.map((item, index) => <button key={item.id} type="button" role="tab" id={`${abasId}-${item.id}`} aria-controls={`${abasId}-painel`} aria-selected={aba === item.id} tabIndex={aba === item.id ? 0 : -1}
        onClick={() => setAba(item.id)}
        onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const destino = event.key === "Home" ? abas[0] : event.key === "End" ? abas[1] : abas[(index + 1) % abas.length];
          setAba(destino.id);
          document.getElementById(`${abasId}-${destino.id}`)?.focus();
        }}
        className={`min-h-11 rounded-lg px-3 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${aba === item.id ? "bg-green-50 text-green-800" : "text-slate-500 hover:bg-slate-50"}`}>
        {item.titulo}{!consulta.carregando && !consulta.erro && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.total}</span>}
      </button>)}
    </div>
    <section role="tabpanel" id={`${abasId}-painel`} aria-labelledby={`${abasId}-${aba}`} tabIndex={0} className="space-y-6 focus-visible:outline-2 focus-visible:outline-primary">
    {!consulta.carregando && !consulta.erro && solicitacoes.length > 0 && visiveis.length === 0 && <p role="status" className="rounded-xl border border-[#dce5dc] bg-white p-5 text-sm text-slate-600">{aba === "abertas" ? "Nenhuma solicitação em aberto." : "Nenhum PEA entregue por solicitação."}</p>}
    {!consulta.carregando && !consulta.erro && visiveis.map(s => {
      const d = meuDestinatario(s, usuario);
      return <SolicitacaoPeaCard key={s.id} solicitacao={s}><Link className="inline-flex min-h-11 items-center font-semibold text-green-800 underline" to={`${routes.solicitacoesPeaProfessor}/${s.id}`}>{d?.situacao === "PENDENTE" ? "Consultar e responder solicitação" : d?.situacao === "ENTREGUE" ? "Consultar entrega" : "Consultar solicitação cancelada"}</Link></SolicitacaoPeaCard>;
    })}
    </section>
    {!consulta.carregando && !consulta.erro && canceladas.length > 0 && <details className="rounded-xl border border-[#dce5dc] bg-white p-4">
      <summary className="min-h-11 cursor-pointer text-sm font-semibold text-slate-700">Solicitações canceladas ({canceladas.length})</summary>
      <div className="mt-4 space-y-6">{canceladas.map(s => <SolicitacaoPeaCard key={s.id} solicitacao={s}><Link className="inline-flex min-h-11 items-center font-semibold text-green-800 underline" to={`${routes.solicitacoesPeaProfessor}/${s.id}`}>Consultar solicitação cancelada</Link></SolicitacaoPeaCard>)}</div>
    </details>}
  </main>;
}

export default function SolicitacoesPeaProfessorPage() {
  const { usuario } = useAuth();
  return <ListaSolicitacoesPea key={usuario?.id} />;
}
