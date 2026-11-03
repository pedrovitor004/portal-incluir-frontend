import { useCallback, useRef, useState, type FormEvent, type Dispatch, type SetStateAction } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useConsultaPea } from "../../../../hooks/useConsultaPea";
import { solicitacoesPeaService as api } from "../../../../services/solicitacoesPeaService";
import { criarChavesIdempotencia, mensagemErroSolicitacaoPea, normalizarSetorPea, podeGerenciarSolicitacoes, podeCriarSolicitacaoPea, prepararSolicitacaoPea, previaDestinatariosPea } from "../../../../services/solicitacaoPeaModel";
import type { ProfessorElegivelPea, SolicitacaoPeaRequest, SolicitacaoPeaResponse } from "../../../../types/solicitacaoPea";
import Button from "../../../../components/common/Button";
import Modal from "../../../../components/common/Modal";
import LoadingState from "../../../../components/common/LoadingState";
import ConsultaPeaState from "../../../../components/pea/ConsultaPeaState";
import SolicitacaoPeaCard from "../../../../components/pea/SolicitacaoPeaCard";
import PeaEntregueModal from "../../../../components/pea/PeaEntregueModal";
import { canAccess } from "../../../../config/access";
const campo = "mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal";

type ConsultaElegiveis = {
  dados: ProfessorElegivelPea[] | null; carregando: boolean; erro: string; recarregar: () => void;
};

export function SelecaoDestinatariosPea({ consulta, dados, onChange }: {
  consulta: ConsultaElegiveis; dados: SolicitacaoPeaRequest;
  onChange: Dispatch<SetStateAction<SolicitacaoPeaRequest>>;
}) {
  if (consulta.carregando) return <LoadingState label="Carregando professores elegíveis..." />;
  if (consulta.erro) return <ConsultaPeaState carregando={false} erro={consulta.erro} onRetry={consulta.recarregar} />;
  if (consulta.dados === null) return null;
  const elegiveis = consulta.dados;
  const previa = previaDestinatariosPea(dados, elegiveis);
  const setores = [...new Map(elegiveis.map(p => [normalizarSetorPea(p.setor), p.setor])).values()].sort((a,b) => a.localeCompare(b));
  return <div className="space-y-4">
        <label className="block text-sm font-medium">Selecionar destinatários por<select className={campo} value={dados.modalidade} onChange={e => onChange(d => ({ ...d, modalidade: e.target.value as SolicitacaoPeaRequest["modalidade"], setor: undefined, professorIds: [] }))}><option value="PROFESSORES">Professores específicos</option><option value="SETOR">Setor</option><option value="TODOS">Todos os professores elegíveis</option></select></label>
        {dados.modalidade === "SETOR" && <label className="block text-sm font-medium">Setor *<select required className={campo} value={dados.setor ?? ""} onChange={e => onChange(d => ({ ...d, setor: e.target.value }))}><option value="">Selecione um setor</option>{setores.map(s => <option key={s}>{s}</option>)}</select></label>}
        {dados.modalidade === "PROFESSORES" && <fieldset className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3"><legend className="px-1 text-sm font-medium">Professores elegíveis</legend>{elegiveis.map(p => <label key={p.professorId} className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={dados.professorIds?.includes(p.professorId) ?? false} onChange={e => onChange(d => ({ ...d, professorIds: e.target.checked ? [...(d.professorIds ?? []), p.professorId] : d.professorIds?.filter(id => id !== p.professorId) }))} /><span>{p.nome} · {p.setor}{p.disciplina ? ` · ${p.disciplina}` : ""}</span></label>)}</fieldset>}
        <div aria-live="polite" className="rounded-lg bg-white p-3 text-sm"><p className="font-semibold">Prévia: {previa.length} destinatário(s)</p><ul className="mt-2 max-h-40 overflow-y-auto">{previa.map(p => <li key={p.professorId}>{p.nome} · {p.setor}</li>)}</ul>{!elegiveis.length && <p>Nenhum professor elegível disponível.</p>}<p className="mt-2 text-slate-600">A elegibilidade será reavaliada pelo servidor no envio. Para setor e todos os elegíveis, a lista final pode mudar; os destinatários efetivos aparecerão no andamento.</p></div>
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold">Os destinatários receberão automaticamente vínculo de acompanhamento.</p>
      <p className="text-sm text-slate-700">O vínculo permite acesso de acompanhamento ao estudante conforme as permissões existentes, sem conceder novas permissões à conta. Entregar o PEA ou cancelar a solicitação não encerra os vínculos.</p>
      <ResumoVinculosPea destinatarios={previa} />
    </div>
  </div>;
}

export function ResumoVinculosPea({ destinatarios }: { destinatarios: ProfessorElegivelPea[] }) {
  const novosOuReativados = destinatarios.filter(p => !p.vinculado).length;
  return <div className="space-y-2 text-sm" role="status"><p>Na última consulta: {destinatarios.length} professor(es) contemplado(s); {novosOuReativados} vínculo(s) a criar ou reativar; {destinatarios.length - novosOuReativados} vínculo(s) ativo(s) a preservar.</p><p>Os dados não distinguem novos vínculos de reativações. A quantidade final não pode ser garantida antecipadamente: elegibilidade e vínculos são reavaliados no envio.</p></div>;
}

function NovaSolicitacao({ estudanteId, onSaved, onCancel }: { estudanteId: number; onSaved: () => void; onCancel: () => void }) {
  const { usuario } = useAuth();
  const consultar = useCallback((signal: AbortSignal) => api.elegiveis(estudanteId, undefined, signal), [estudanteId]);
  const consulta = useConsultaPea(consultar);
  const [dados, setDados] = useState<SolicitacaoPeaRequest>({ modalidade: "PROFESSORES", contexto: "", orientacoes: "", professorIds: [] });
  const [confirmacao, setConfirmacao] = useState<{ dados: SolicitacaoPeaRequest; destinatarios: ProfessorElegivelPea[] } | null>(null);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const trava = useRef(false);
  const chaves = useRef(criarChavesIdempotencia());
  const consultaConcluida = !consulta.carregando && !consulta.erro && consulta.dados !== null;
  const elegiveis = consultaConcluida ? consulta.dados! : [];
  const previa = previaDestinatariosPea(dados, elegiveis);
  async function revisar(event: FormEvent) {
    event.preventDefault(); if (trava.current || consulta.carregando || consulta.erro) return;
    trava.current = true; setOcupado(true); setErro("");
    try {
      // Atualiza a elegibilidade antes de pedir a confirmação.
      const atuais = await api.elegiveis(estudanteId, dados.modalidade === "SETOR" ? dados.setor : undefined);
      const request = prepararSolicitacaoPea(dados, atuais, usuario);
      setConfirmacao({ dados: request, destinatarios: previaDestinatariosPea(request, atuais) });
    } catch (e) { setErro(mensagemErroSolicitacaoPea(e)); }
    finally { trava.current = false; setOcupado(false); }
  }
  async function enviar() {
    if (trava.current || !confirmacao) return;
    trava.current = true; setOcupado(true); setErro("");
    try { await api.criar(estudanteId, confirmacao.dados, chaves.current(confirmacao.dados)); onSaved(); }
    catch (e) { setErro(mensagemErroSolicitacaoPea(e)); }
    finally { trava.current = false; setOcupado(false); }
  }
  return <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/30 p-5">
    <h3 className="font-semibold">Nova solicitação de PEA</h3>
    {erro && !confirmacao && <p role="alert" className="text-sm text-red-800">{erro}</p>}
    <form onSubmit={e => void revisar(e)} className="space-y-4" aria-busy={ocupado}>
      <fieldset disabled={ocupado} className="space-y-4">
        <legend className="sr-only">Destinatários e orientações da solicitação</legend>
        <label className="block text-sm font-medium">Contexto/período *<input required maxLength={150} className={campo} value={dados.contexto} onChange={e => setDados(d => ({ ...d, contexto: e.target.value }))} /></label>
        <label className="block text-sm font-medium">Orientações<textarea maxLength={2000} rows={4} className={campo} value={dados.orientacoes} onChange={e => setDados(d => ({ ...d, orientacoes: e.target.value }))} /></label>
        <SelecaoDestinatariosPea consulta={consulta} dados={dados} onChange={setDados} />
        <div className="flex flex-wrap gap-3"><Button type="submit" disabled={!consultaConcluida || !previa.length}>{ocupado ? "Aguarde..." : "Revisar destinatários e enviar"}</Button><Button variant="secondary" onClick={onCancel}>Fechar formulário</Button><Button variant="secondary" disabled={consulta.carregando} onClick={consulta.recarregar}>Atualizar elegíveis</Button></div>
      </fieldset>
    </form>
    <Modal open={confirmacao !== null} onClose={() => { if (!ocupado) { setConfirmacao(null); setErro(""); } }} title="Confirmar solicitação de PEA" busy={ocupado} footer={<Button disabled={ocupado} onClick={() => void enviar()}>{ocupado ? "Enviando..." : "Confirmar envio"}</Button>}>
      <div className="space-y-3"><p className="font-semibold">{confirmacao?.dados.contexto}</p><p className="whitespace-pre-wrap">{confirmacao?.dados.orientacoes || "Sem orientações adicionais."}</p><p>{confirmacao?.destinatarios.length} destinatário(s) na última consulta:</p><ul>{confirmacao?.destinatarios.map(p => <li key={p.professorId}>{p.nome} · {p.setor}</li>)}</ul>{confirmacao && <div className="space-y-3 rounded-lg bg-amber-50 p-3"><p className="font-semibold">Ao confirmar, você autoriza vínculos automáticos de acompanhamento para todos os destinatários efetivos. Eles terão acesso ao estudante conforme as permissões que já possuem; nenhuma permissão será acrescentada às contas.</p><ResumoVinculosPea destinatarios={confirmacao.destinatarios} /><p>Vínculos já ativos serão preservados. A entrega e o cancelamento da solicitação não encerram o acompanhamento. O motivo automático identificará esta solicitação na auditoria do vínculo.</p></div>}<p>A elegibilidade é reavaliada no envio. Confira a lista efetiva no andamento após a confirmação.</p>{erro && <p role="alert" className="text-red-800">{erro}</p>}</div>
    </Modal>
  </div>;
}

export default function SolicitacoesPeaPanel({ estudanteId, somenteLeitura }: { estudanteId: number; somenteLeitura: boolean }) {
  const { usuario } = useAuth();
  const consultar = useCallback((signal: AbortSignal) => api.listar(estudanteId, signal), [estudanteId]);
  const consulta = useConsultaPea(consultar);
  const [novo, setNovo] = useState(false);
  const [cancelamento, setCancelamento] = useState<SolicitacaoPeaResponse | null>(null);
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [peaId, setPeaId] = useState<number | null>(null);
  const [sucesso, setSucesso] = useState("");
  const trava = useRef(false);
  const gerencia = podeGerenciarSolicitacoes(usuario);
  const podeCriar = podeCriarSolicitacaoPea(usuario);
  async function cancelar(event: FormEvent) {
    event.preventDefault(); if (!cancelamento || trava.current || !motivo.trim()) return;
    trava.current = true; setOcupado(true); setErro("");
    try {
      await api.cancelar(cancelamento.id, cancelamento.versao, motivo.trim());
      setCancelamento(null); setSucesso("Destinatários pendentes cancelados. As entregas anteriores foram preservadas."); consulta.recarregar();
    } catch (e) { setErro(mensagemErroSolicitacaoPea(e)); }
    finally { trava.current = false; setOcupado(false); }
  }
  return <section aria-labelledby="solicitacoes-pea-titulo" className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="solicitacoes-pea-titulo" className="text-lg font-semibold">Solicitações de PEA</h2><div className="flex flex-wrap gap-3"><Button variant="secondary" disabled={consulta.carregando || ocupado} onClick={consulta.recarregar}>Atualizar andamento</Button>{podeCriar && !somenteLeitura && <Button disabled={novo || ocupado || consulta.carregando || !!consulta.erro} onClick={() => { setNovo(true); setSucesso(""); }}>Solicitar PEA</Button>}</div></div>
    <p className="text-sm text-slate-600">Solicite PEAs a professores ativos e autorizados de toda a instituição, por professor, setor ou todos os elegíveis, mesmo sem PEI cadastrado. São exibidas as solicitações de sua autoria.</p>
    {gerencia && !podeCriar && !somenteLeitura && <p className="text-sm text-amber-800">Novas solicitações criam vínculos automaticamente e exigem a permissão de vincular estudantes. O acompanhamento das solicitações existentes permanece disponível.</p>}
    {somenteLeitura && <p className="text-sm text-slate-600">Estudante indisponível para novas solicitações e cancelamentos. O histórico permanece para consulta conforme autorização.</p>}
    {sucesso && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-900">{sucesso}</p>}
    <ConsultaPeaState {...consulta} onRetry={consulta.recarregar} />
    {novo && podeCriar && !somenteLeitura && <NovaSolicitacao estudanteId={estudanteId} onCancel={() => setNovo(false)} onSaved={() => { setNovo(false); setSucesso("Solicitação registrada. Confira abaixo os destinatários efetivos do envio."); consulta.recarregar(); }} />}
    {!consulta.carregando && !consulta.erro && consulta.dados?.length === 0 && <p role="status" className="text-sm text-slate-600">Nenhuma solicitação de sua autoria para este estudante.</p>}
    {!consulta.carregando && !consulta.erro && consulta.dados?.map(s => <SolicitacaoPeaCard key={s.id} solicitacao={s} onViewPea={usuario && canAccess(usuario, "pedagogico.consultar") ? setPeaId : undefined}>{gerencia && !somenteLeitura && s.destinatarios.some(d => d.situacao === "PENDENTE") && <Button variant="secondary" onClick={() => { setCancelamento(s); setMotivo(""); setErro(""); }}>Cancelar destinatários pendentes</Button>}</SolicitacaoPeaCard>)}
    <Modal open={cancelamento !== null} onClose={() => { if (!ocupado) setCancelamento(null); }} busy={ocupado} title="Cancelar solicitação pendente" footer={<span className="text-xs text-slate-600">As entregas já realizadas serão preservadas.</span>}>
      <form onSubmit={e => void cancelar(e)} className="space-y-4" aria-busy={ocupado}><p>{cancelamento?.contexto}</p><p>Confirma o cancelamento de todos os destinatários ainda pendentes? Entregas anteriores permanecerão registradas.</p><label className="block font-medium">Motivo *<textarea required maxLength={1000} value={motivo} disabled={ocupado} onChange={e => setMotivo(e.target.value)} className={campo} /></label>{erro && <div role="alert" className="space-y-3 text-red-800"><p>{erro}</p><Button variant="secondary" disabled={ocupado} onClick={() => { setCancelamento(null); consulta.recarregar(); }}>Atualizar andamento antes de tentar novamente</Button></div>}<Button type="submit" disabled={ocupado || !motivo.trim()}>{ocupado ? "Cancelando..." : "Confirmar cancelamento"}</Button></form>
    </Modal>
    {peaId !== null && <PeaEntregueModal key={peaId} id={peaId} onClose={() => setPeaId(null)} />}
  </section>;
}
