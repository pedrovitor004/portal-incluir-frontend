import { useEffect, useRef, useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import Modal from "../../../../components/common/Modal";
import Button from "../../../../components/common/Button";
import LoadingState from "../../../../components/common/LoadingState";
import { colorThemes } from "../../../../config/uiThemes";
import { getOverlayToolsHost } from "../../../../services/overlayTools";
import { notificationService } from "../../../../services/notificationService";
import { exportarDeclaracaoEstudante, exportarHistoricoEstudante } from "../../../../services/historicoEstudante/exportarDocumentoEstudante";
import { HistoricoIncompletoError } from "../../../../services/historicoEstudante/historicoModel";
import type { DadosPerfilEstudante } from "../../../../types/perfilEstudante";
import { AuditIcon } from "../../auditorias/components/AuditVisuals";

type Props = { dados: DadosPerfilEstudante; onClose: () => void };
export default function StudentDocumentGeneration({ dados, onClose }: Props) {
  const [tipo, setTipo] = useState<"historico" | "declaracao">("historico");
  const [periodo, setPeriodo] = useState(dados.planos.find(p => !p.arquivado)?.periodoLetivo || "");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const operacao = useRef<AbortController | null>(null);
  useEffect(() => () => operacao.current?.abort(), []);
  const acompanhamentoAtual = dados.estudante.ativo && !dados.estudante.concluido;
  async function gerar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (operacao.current) return;
    const controller = new AbortController(); operacao.current = controller; setGerando(true); setErro("");
    try {
      const resposta = await Swal.fire({ target: getOverlayToolsHost(), titleText: tipo === "historico" ? "Gerar o histórico do estudante?" : "Gerar a declaração de acompanhamento?", text: tipo === "historico" ? "O documento reunirá os dados cadastrados, planos, documentos, adaptações e todas as alterações disponíveis, com as datas e os horários registrados." : `A declaração identificará ${dados.estudante.nomeCompleto}, matrícula ${dados.estudante.matricula}, no período ${periodo}. O documento terá o campo para assinatura da coordenação responsável.`, icon: "question", showCancelButton: true, confirmButtonText: "Sim, gerar documento", cancelButtonText: "Cancelar", confirmButtonColor: colorThemes.green["--accent-main"], cancelButtonColor: "#64748b", focusCancel: true, allowOutsideClick: false, heightAuto: false });
      if (!resposta.isConfirmed || controller.signal.aborted) return;
      if (tipo === "historico") await exportarHistoricoEstudante(dados.estudante.id, controller.signal);
      else await exportarDeclaracaoEstudante(dados.estudante.id, periodo.trim(), controller.signal);
      notificationService.success("Documento gerado com sucesso! O arquivo está disponível nos seus downloads.");
      onClose();
    } catch (error) {
      if (controller.signal.aborted) return;
      setErro(error instanceof HistoricoIncompletoError ? error.message : "Não foi possível gerar o documento. Confira sua conexão e seu acesso e tente novamente.");
    } finally { operacao.current = null; setGerando(false); }
  }
  return <Modal open onClose={onClose} busy={gerando} size="wide" title="Gerar documento" description={`${dados.estudante.nomeCompleto} · Matrícula ${dados.estudante.matricula}`} icon={<AuditIcon tipo="documento" className="h-7 w-7" />} footer={<span className="text-xs text-slate-500">O documento será salvo em PDF para impressão.</span>}>
    <form onSubmit={event => void gerar(event)} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">{[{ id: "historico" as const, titulo: "Histórico do estudante", descricao: "Dados, documentos, adaptações e alterações acumuladas, com Antes e Depois.", icone: "historico" }, { id: "declaracao" as const, titulo: "Declaração de acompanhamento", descricao: "Declaração com identificação, período e campo de assinatura da coordenação.", icone: "escudo" }].map(opcao => <button type="button" key={opcao.id} aria-pressed={tipo === opcao.id} disabled={gerando} onClick={() => { setTipo(opcao.id); setErro(""); }} className={`rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-50 ${tipo === opcao.id ? "border-green-300 bg-green-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}><span className="mb-3 inline-flex rounded-lg bg-white p-2 text-green-700 ring-1 ring-green-100"><AuditIcon tipo={opcao.icone} /></span><span className="block text-sm font-semibold text-slate-800">{opcao.titulo}</span><span className="mt-2 block text-xs leading-relaxed text-slate-500">{opcao.descricao}</span></button>)}</div>
      {tipo === "declaracao" && !acompanhamentoAtual && <p className="text-xs text-slate-500">Como o estudante está inativo ou com acompanhamento concluído, a declaração informará que ele foi acompanhado no período indicado.</p>}
      {tipo === "historico" ? <p className="rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">O histórico reúne todos os registros disponíveis do estudante, incluindo documentos arquivados e exclusões registradas. As informações serão consultadas novamente antes da geração. Datas ou horários ausentes serão identificados no documento.</p> : <div className="space-y-4 rounded-xl border border-green-100 bg-green-50/40 p-4"><dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-500">Estudante</dt><dd className="mt-1 font-semibold">{dados.estudante.nomeCompleto}</dd></div><div><dt className="text-xs text-slate-500">Curso</dt><dd className="mt-1 font-semibold">{dados.estudante.curso}</dd></div></dl><label className="block text-sm font-semibold text-slate-700">Período do acompanhamento<input required maxLength={60} disabled={gerando} value={periodo} onChange={event => setPeriodo(event.target.value)} placeholder="Ex.: 2026.2" className="mt-2 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-green-700" /></label><p className="text-xs leading-relaxed text-slate-500">A declaração terá as logomarcas do IFPB, da CLAI e do Portal Incluir, além do campo para assinatura da Coordenação Local de Acessibilidade e Inclusão.</p></div>}
      {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-800">{erro}</p>}
      {gerando && <LoadingState compact label="Conferindo as informações e preparando o documento..." />}
      <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" disabled={gerando} onClick={onClose}>Cancelar</Button><Button type="submit" disabled={gerando || (tipo === "declaracao" && !periodo.trim())} icon={<AuditIcon tipo="documento" />}>{gerando ? "Preparando..." : "Gerar PDF"}</Button></div>
    </form>
  </Modal>;
}
