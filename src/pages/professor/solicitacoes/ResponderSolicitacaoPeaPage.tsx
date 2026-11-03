import { useCallback, useState } from "react";
import { Link, useParams } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { useConsultaPea } from "../../../hooks/useConsultaPea";
import { solicitacoesPeaService as api } from "../../../services/solicitacoesPeaService";
import { adaptacoesPedagogicasService } from "../../../services/adaptacoesPedagogicasService";
import { meuDestinatario } from "../../../services/solicitacaoPeaModel";
import { canAccess } from "../../../config/access";
import { routes } from "../../../config/routes";
import Button from "../../../components/common/Button";
import PeaEntregueModal from "../../../components/pea/PeaEntregueModal";
import ConsultaPeaState from "../../../components/pea/ConsultaPeaState";
import SolicitacaoPeaCard from "../../../components/pea/SolicitacaoPeaCard";

function HistoricoPea({ estudanteId, professorId, entregaId }: { estudanteId: number; professorId: number; entregaId: number | null }) {
  const consultar = useCallback((signal: AbortSignal) => adaptacoesPedagogicasService.listarPorEstudanteEProfessor(estudanteId, professorId, signal), [estudanteId, professorId]);
  const consulta = useConsultaPea(consultar);
  const [peaId, setPeaId] = useState<number | null>(null);
  const anteriores = consulta.dados?.filter(p => p.id !== entregaId);
  return <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
    <h2 className="text-lg font-semibold">PEAs anteriores de sua autoria</h2>
    <p className="text-sm text-slate-600">Consulte seus documentos deste estudante. A consulta não responde à solicitação. A entrega exige o preenchimento de um novo PEA.</p>
    <ConsultaPeaState {...consulta} onRetry={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && (anteriores?.length ? <ul className="space-y-3">{anteriores.map(p => <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"><span>{p.componenteCurricular} · {p.semestreAno}{p.arquivado ? " · Arquivado" : ""}</span><Button variant="secondary" onClick={() => setPeaId(p.id)}>Consultar PEA #{p.id}</Button></li>)}</ul> : <p role="status" className="text-sm text-slate-600">Nenhum PEA anterior de sua autoria para este estudante.</p>)}
    {peaId !== null && <PeaEntregueModal key={peaId} id={peaId} titulo="Consulta de PEA anterior" onClose={() => setPeaId(null)} />}
  </section>;
}
function Conteudo({ id }: { id: number }) {
  const { usuario } = useAuth();
  const consultar = useCallback((signal: AbortSignal) => api.contexto(id, signal), [id]);
  const consulta = useConsultaPea(consultar);
  const [peaId, setPeaId] = useState<number | null>(null);
  const solicitacao = consulta.dados;
  const destinatario = solicitacao ? meuDestinatario(solicitacao, usuario) : undefined;
  return <main className="mx-auto max-w-[1100px] space-y-6 pb-10">
    <header><Link to={routes.solicitacoesPeaProfessor} className="font-semibold text-green-800 underline">← Voltar às solicitações recebidas</Link><h1 className="mt-4 text-2xl font-bold text-primary">PEA solicitado</h1></header>
    <Button variant="secondary" disabled={consulta.carregando} onClick={consulta.recarregar}>Atualizar situação</Button>
    <ConsultaPeaState {...consulta} onRetry={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && solicitacao && <>
      <SolicitacaoPeaCard solicitacao={solicitacao} onViewPea={setPeaId} />
      {destinatario?.situacao === "PENDENTE" && usuario && canAccess(usuario,"pedagogico.editar") && canAccess(usuario,"pedagogico.consultar")
        ? <Link to={`${routes.cadastroPeaProfessor}?solicitacaoId=${solicitacao.id}`} className="inline-flex min-h-11 items-center rounded-lg bg-green-800 px-4 py-2 font-semibold text-white">Preencher PEA</Link>
        : <p role="status" className="rounded-xl bg-slate-50 p-4 text-sm">{destinatario?.situacao === "CANCELADO" ? "Esta solicitação foi cancelada e não aceita entrega." : destinatario?.situacao === "ENTREGUE" ? "Seu PEA já foi entregue. Utilize Consultar PEA entregue para visualizar o documento." : "Esta solicitação não está disponível para sua entrega com as permissões atuais."}</p>}
      {destinatario && usuario?.perfil === "PROFESSOR" && canAccess(usuario,"pedagogico.consultar") && <HistoricoPea key={`${solicitacao.estudante.id}-${usuario.perfilId}`} estudanteId={solicitacao.estudante.id} professorId={usuario.perfilId} entregaId={destinatario.peaId} />}
    </>}
    {peaId !== null && <PeaEntregueModal key={peaId} id={peaId} onClose={() => setPeaId(null)} />}
  </main>;
}
export default function ResponderSolicitacaoPeaPage() {
  const { id } = useParams(); const { usuario } = useAuth(); const numero = Number(id);
  if (!Number.isSafeInteger(numero) || numero <= 0) return <p role="alert">Solicitação inválida ou indisponível.</p>;
  return <Conteudo key={`${usuario?.id}-${numero}`} id={numero} />;
}
