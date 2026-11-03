import { useCallback } from "react";
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
  return <main className="mx-auto max-w-[1100px] space-y-6 pb-10">
    <header><h1 className="text-2xl font-bold text-primary">Solicitações de PEA recebidas</h1><p className="mt-2 text-sm text-slate-600">Consulte as orientações da coordenação e entregue seu PEA solicitado, mesmo sem PEI ou vínculo permanente com o estudante.</p></header>
    <div className="flex flex-wrap gap-4">{usuario && canAccess(usuario,"documentos") && <Link className="font-semibold text-green-800 underline" to="/professor/documentos">Voltar aos documentos</Link>}<Button variant="secondary" disabled={consulta.carregando} onClick={consulta.recarregar}>Atualizar solicitações</Button></div>
    <ConsultaPeaState {...consulta} onRetry={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && consulta.dados?.length === 0 && <p role="status">Nenhuma solicitação recebida disponível.</p>}
    {!consulta.carregando && !consulta.erro && consulta.dados?.map(s => {
      const d = meuDestinatario(s, usuario);
      return <SolicitacaoPeaCard key={s.id} solicitacao={s}><Link className="inline-flex min-h-11 items-center font-semibold text-green-800 underline" to={`${routes.solicitacoesPeaProfessor}/${s.id}`}>{d?.situacao === "PENDENTE" ? "Consultar e responder solicitação" : d?.situacao === "ENTREGUE" ? "Consultar entrega" : "Consultar solicitação cancelada"}</Link></SolicitacaoPeaCard>;
    })}
  </main>;
}

export default function SolicitacoesPeaProfessorPage() {
  const { usuario } = useAuth();
  return <ListaSolicitacoesPea key={usuario?.id} />;
}
