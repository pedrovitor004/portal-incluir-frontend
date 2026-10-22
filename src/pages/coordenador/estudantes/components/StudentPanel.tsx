import { useAuth } from "../../../../hooks/useAuth";
import { canAccess } from "../../../../config/access";
import { useEffect, useRef, useState } from "react";
import Modal from "../../../../components/common/Modal";
import LoadingState from "../../../../components/common/LoadingState";
import Button from "../../../../components/common/Button";
import { acoesEstudante, acaoEstudantePermitida, type AcaoEstudante } from "../../../../config/estudantes";
import { acompanhamentoEstudanteService, type EtapaEstudante } from "../../../../services/acompanhamentoEstudanteService";
import { estudantesService } from "../../../../services/estudantesService";
import { confirmarAcaoEstudante, informarPoliticaExclusao } from "../../../../services/estudanteConfirmation";
import { notificationService } from "../../../../services/notificationService";
import { mensagemErro } from "../../../../services/apiError";
import { mapearEstudante, type Estudante, type EstudanteResponse } from "../../../../types/estudante";

const estados = { registrado: { texto: "Registrado", cor: "bg-green-50 text-green-800" }, pendente: { texto: "Pendente", cor: "bg-red-50 text-red-700" }, revisar: { texto: "A revisar", cor: "bg-amber-50 text-amber-800" }, indisponivel: { texto: "A verificar", cor: "bg-slate-100 text-slate-600" } };
type Props = { estudante: Estudante; modo: "acoes" | "pendencias"; onClose: () => void; onUpdate: (estudante: EstudanteResponse) => void; onPerfil: () => void; onCadastro: () => void };
export default function StudentPanel({ estudante, modo, onClose, onUpdate, onPerfil, onCadastro }: Props) {
  const { usuario } = useAuth();
  const editarCadastro = !!usuario && canAccess(usuario, "estudantes.editar") && canAccess(usuario, "anamnese");
  const [dados, setDados] = useState<{ estudante: EstudanteResponse; etapas: EtapaEstudante[] } | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [executando, setExecutando] = useState(false);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);
  const pendente = useRef(false);
  useEffect(() => {
    const controller = new AbortController(); let ativo = true;
    acompanhamentoEstudanteService.consultar(estudante.id, controller.signal).then(resposta => { if (ativo) setDados(resposta); }).catch(error => { if (ativo) setErro(mensagemErro(error)); }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; controller.abort(); };
  }, [estudante.id, versao]);
  const atual = dados ? mapearEstudante(dados.estudante) : estudante;
  async function executar(acao: AcaoEstudante) {
    if (pendente.current || !dados || !acaoEstudantePermitida(atual, acao)) return;
    pendente.current = true; setExecutando(true); setErro("");
    try {
      const confirmacao = await confirmarAcaoEstudante(atual, acao);
      if (!confirmacao.confirmado) return;
      const resposta = acao === "concluir" ? await estudantesService.concluir(atual.id, confirmacao.dataConclusao!) : await estudantesService[acao](atual.id);
      setDados(anterior => anterior ? { ...anterior, estudante: resposta } : anterior); onUpdate(resposta);
      notificationService.success(acoesEstudante[acao].sucesso);
    } catch (error) { setErro(mensagemErro(error)); notificationService.error(mensagemErro(error)); }
    finally { pendente.current = false; setExecutando(false); }
  }
  return <Modal open onClose={onClose} busy={executando} size="wide" title={modo === "acoes" ? "Gerenciar estudante" : "Etapas do acompanhamento"} description={`${atual.nome} · Matrícula ${atual.matricula}`}>
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-green-100 bg-green-50/60 p-4"><div><p className="font-semibold text-green-900">{atual.curso}</p><p className="mt-1 text-xs text-slate-500">Ingresso {atual.ano}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${atual.status === "Ativo" ? "bg-green-100 text-green-800" : atual.status === "Concluído" ? "bg-sky-100 text-sky-800" : "bg-slate-200 text-slate-700"}`}>{atual.status}</span></div>
      {erro && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}<button disabled={executando || carregando} className="ml-2 font-semibold underline disabled:opacity-50" onClick={() => { setCarregando(true); setErro(""); setVersao(v => v + 1); }}>Consultar novamente</button></div>}
      {carregando && <LoadingState compact label="Consultando os dados atuais do estudante..." />}
      {dados && modo === "acoes" && <>
        {dados.estudante.concluido && <div role="status" className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sky-900"><p className="font-semibold">Acompanhamento concluído</p><p className="mt-1 text-xs">Conclusão: {dados.estudante.dataConclusao ? new Date(`${dados.estudante.dataConclusao}T12:00:00`).toLocaleDateString("pt-BR") : "Não informada"}. Dados guardados até {dados.estudante.dataLimiteRetencao ? new Date(`${dados.estudante.dataLimiteRetencao}T12:00:00`).toLocaleDateString("pt-BR") : "data não informada"}.</p></div>}
        <div className="space-y-3">{(Object.keys(acoesEstudante) as AcaoEstudante[]).filter(acao => acaoEstudantePermitida(atual, acao)).map(acao => { const config = acoesEstudante[acao]; return <button key={acao} type="button" disabled={executando || carregando} onClick={() => void executar(acao)} className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50/40 focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50"><span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${acao === "inativar" ? "bg-amber-50 text-amber-700" : acao === "concluir" ? "bg-sky-50 text-sky-700" : "bg-green-50 text-green-700"}`}><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d={config.icone} /></svg></span><span><span className="block font-semibold text-slate-800">{config.titulo}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{config.descricao}</span></span></button>; })}</div>
        <button type="button" disabled={executando} onClick={() => void informarPoliticaExclusao()} className="flex min-h-11 w-full items-center justify-between rounded-xl border border-red-100 bg-red-50/40 px-4 text-left text-sm font-semibold text-red-700 focus-visible:outline-2 focus-visible:outline-red-700">Exclusão de estudante<span className="text-xs font-medium">Consultar política →</span></button>
      </>}
      {dados && modo === "pendencias" && <>
        <p className="text-xs leading-relaxed text-slate-500">As etapas abaixo mostram os registros encontrados e o que precisa de revisão. A presença de um documento não confirma que todo o acompanhamento foi concluído.</p>
        <ol className="space-y-3">{dados.etapas.map((etapa, indice) => { const estado = estados[etapa.estado]; return <li key={etapa.id} className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${estado.cor}`}>{etapa.estado === "registrado" ? "✓" : indice + 1}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">{etapa.titulo}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${estado.cor}`}>{estado.texto}</span></div><p className="mt-2 text-xs leading-relaxed text-slate-500">{etapa.resumo}</p>{etapa.destino && <button type="button" disabled={executando || (etapa.destino === "cadastro" && (dados.estudante.concluido || !editarCadastro))} onClick={etapa.destino === "cadastro" ? onCadastro : onPerfil} className="mt-3 min-h-9 text-xs font-semibold text-green-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-green-700 disabled:opacity-50">{etapa.destino === "cadastro" ? dados.estudante.concluido ? "Cadastro concluído · somente leitura" : "Revisar dados do estudante →" : "Abrir perfil do estudante →"}</button>}</div></div></li>; })}</ol>
      </>}
      {executando && <LoadingState compact label="Processando a ação do estudante..." />}
      <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={executando} onClick={onPerfil}>Abrir perfil</Button>{dados && editarCadastro && !dados.estudante.concluido && <Button disabled={executando || carregando} onClick={onCadastro}>Editar dados</Button>}</div>
    </div>
  </Modal>;
}
