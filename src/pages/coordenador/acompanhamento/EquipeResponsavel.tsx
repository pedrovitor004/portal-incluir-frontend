import { useEffect, useRef, useState, type FormEvent } from "react";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import LoadingState from "../../../components/common/LoadingState";
import { useAuth } from "../../../hooks/useAuth";
import { vinculosEstudanteService as service, type ProfissionalEstudante, type VinculoEstudante } from "../../../services/vinculosEstudanteService";
import { gestaoAcompanhamentoPreview as preview } from "../../../services/gestaoAcompanhamentoPreview";
import { mensagemErro } from "../../../services/apiError";
import { confirmarUsuario } from "../../../services/usuarioConfirmation";
import { notificationService } from "../../../services/notificationService";
import type { EstudanteResponse } from "../../../types/estudante";
import { campoGestao } from "./presentation";

export default function EquipeResponsavel({ estudante }: { estudante: EstudanteResponse }) {
  const { usuario } = useAuth();
  const [vinculos, setVinculos] = useState<VinculoEstudante[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalEstudante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroCandidatos, setErroCandidatos] = useState("");
  const [versao, setVersao] = useState(0);
  const [acao, setAcao] = useState<"atribuir" | VinculoEstudante | null>(null);
  const [profissionalId, setProfissionalId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erroAcao, setErroAcao] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const pendente = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([service.listar(estudante.id, controller.signal), service.candidatos(estudante.id, controller.signal)]).then(([atuais, candidatos]) => {
      if (controller.signal.aborted) return;
      if (atuais.status === "fulfilled") setVinculos(atuais.value); else setErro(mensagemErro(atuais.reason));
      if (candidatos.status === "fulfilled") setProfissionais(candidatos.value); else setErroCandidatos(mensagemErro(candidatos.reason));
      setCarregando(false);
    });
    return () => controller.abort();
  }, [estudante.id, versao]);
  const equipe = vinculos.filter(v => v.profissional.perfil === "EQUIPE_MULTIDISCIPLINAR");
  const disponiveis = profissionais.filter(p => p.perfil === "EQUIPE_MULTIDISCIPLINAR" && p.ativo && p.usuarioId !== null && !p.vinculado && !vinculos.some(v => v.ativo && v.profissional.usuarioId === p.usuarioId));
  const bloqueado = !estudante.ativo || estudante.concluido;
  function abrir(valor: typeof acao) { setAcao(valor); setProfissionalId(""); setMotivo(""); setErroAcao(""); }
  function atualizar() { setErro(""); setErroCandidatos(""); setCarregando(true); setVersao(v => v + 1); }
  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (!acao || pendente.current || bloqueado) return;
    if (!motivo.trim()) { setErroAcao("Informe o motivo do acompanhamento ou encerramento."); return; }
    const profissional = acao === "atribuir" ? disponiveis.find(p => String(p.usuarioId) === profissionalId) : acao.profissional;
    if (!profissional || profissional.usuarioId === null) return;
    pendente.current = true; setOcupado(true); setErroAcao("");
    try {
      if (!await confirmarUsuario(acao === "atribuir" ? "Atribuir estudante ao profissional?" : "Encerrar acompanhamento?", `${profissional.nome} · ${estudante.nomeCompleto}. ${acao === "atribuir" ? "O vínculo será salvo no portal." : "O vínculo será encerrado e o histórico será preservado."} A notificação ao profissional ainda não será entregue.`, acao !== "atribuir")) return;
      const vinculo = acao === "atribuir" ? await service.associar(estudante.id, profissional.usuarioId, motivo.trim()) : await service.encerrar(estudante.id, acao, motivo.trim());
      setVinculos(atuais => [...atuais.filter(v => v.id !== vinculo.id), vinculo]);
      setProfissionais(atuais => atuais.map(p => p.usuarioId === profissional.usuarioId ? { ...p, vinculado: vinculo.ativo } : p));
      preview.vinculo(usuario!.id, profissional.nome, estudante.nomeCompleto, vinculo.ativo, motivo.trim());
      setAcao(null);
      notificationService.success(vinculo.ativo ? "Estudante atribuído ao profissional." : "Acompanhamento encerrado.");
    } catch (error) { setErroAcao(mensagemErro(error)); }
    finally { pendente.current = false; setOcupado(false); }
  }
  return <section className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-[#dce5dc] bg-white p-5"><div><h2 className="font-bold text-slate-800">Equipe de {estudante.nomeCompleto}</h2><p className="mt-1 text-sm text-slate-500">{estudante.curso} · {equipe.filter(v => v.ativo).length} profissional(is) com vínculo ativo</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={carregando || ocupado} onClick={atualizar}>Atualizar</Button><Button disabled={bloqueado || carregando || ocupado || !!erro || !!erroCandidatos || !disponiveis.length} onClick={() => abrir("atribuir")}>+ Atribuir profissional</Button></div></div>
    {bloqueado && <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">O estudante está inativo ou com acompanhamento concluído. Os vínculos estão disponíveis para consulta.</p>}
    {(erro || erroCandidatos) && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{erro && <p>Vínculos: {erro}</p>}{erroCandidatos && <p>Profissionais disponíveis: {erroCandidatos}</p>}</div>}
    {carregando ? <LoadingState /> : !erro && <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{equipe.map(vinculo => <article key={vinculo.id} className="min-w-0 space-y-4 rounded-2xl border border-[#dce5dc] bg-white p-5"><div><span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${vinculo.ativo ? "bg-green-50 text-green-800" : "bg-slate-100 text-slate-600"}`}>{vinculo.ativo ? "Responsável ativo" : "Vínculo encerrado"}</span><h3 className="mt-3 break-words font-bold text-slate-800">{vinculo.profissional.nome}</h3><p className="mt-1 text-sm text-slate-500">{vinculo.profissional.areaAtuacao} · {vinculo.profissional.setor}</p>{!vinculo.profissional.ativo && <p className="mt-2 text-xs text-amber-800">Conta do profissional inativa</p>}</div><dl className="space-y-3 text-sm"><div><dt className="text-xs text-slate-500">Orientações do acompanhamento</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{vinculo.motivo}</dd></div><div><dt className="text-xs text-slate-500">Início</dt><dd className="mt-1 text-slate-700">{new Date(vinculo.dataInicio).toLocaleDateString("pt-BR")}</dd></div>{!vinculo.ativo && <div><dt className="text-xs text-slate-500">Motivo do encerramento</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{vinculo.motivoEncerramento || "Não informado"}</dd></div>}</dl>{vinculo.ativo && <Button variant="secondary" disabled={ocupado || bloqueado} onClick={() => abrir(vinculo)}>Encerrar vínculo</Button>}</article>)}</div>{!equipe.length && <p className="rounded-2xl border border-dashed border-[#dce5dc] p-8 text-center text-sm text-slate-500">Nenhum profissional da equipe multidisciplinar associado a este estudante.</p>}{!disponiveis.length && !erroCandidatos && !bloqueado && <p className="text-sm text-slate-500">Nenhum profissional ativo disponível para uma nova atribuição. Consulte os cadastros da equipe.</p>}</>}
    {acao && <Modal open onClose={() => { if (!ocupado) setAcao(null); }} busy={ocupado} title={acao === "atribuir" ? "Atribuir profissional ao estudante" : "Encerrar vínculo de acompanhamento"} description={estudante.nomeCompleto} footer={<div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row"><Button variant="secondary" disabled={ocupado} onClick={() => setAcao(null)}>Cancelar</Button><Button type="submit" form="atribuir-equipe" disabled={ocupado}>{ocupado ? "Salvando…" : "Confirmar"}</Button></div>}><form id="atribuir-equipe" onSubmit={salvar} className="space-y-4">{acao === "atribuir" ? <label className="block font-semibold">Profissional da equipe<select required disabled={ocupado} className={campoGestao} value={profissionalId} onChange={e => setProfissionalId(e.target.value)}><option value="">Selecione o profissional</option>{disponiveis.map(p => <option key={p.usuarioId} value={p.usuarioId!}>{p.nome} · {p.areaAtuacao}</option>)}</select></label> : <p className="font-semibold">{acao.profissional.nome}</p>}<label className="block font-semibold">{acao === "atribuir" ? "Motivo e orientações para o acompanhamento" : "Motivo do encerramento"}<textarea required maxLength={2000} rows={4} disabled={ocupado} className={campoGestao} value={motivo} onChange={e => setMotivo(e.target.value)} /></label><p className="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">O vínculo será salvo no sistema. Uma prévia da notificação ficará no sino da coordenação; o envio ao profissional depende da integração de notificações.</p>{erroAcao && <p role="alert" className="text-sm text-red-700">{erroAcao}</p>}</form></Modal>}
  </section>;
}
