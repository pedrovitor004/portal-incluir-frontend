import { AuditIcon, OperacaoBadge } from "./AuditVisuals";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerOverlayDialog } from "../../../../services/overlayTools";
import type { RegistroAuditoria } from "../../../../types/auditoria";
import { areaAuditoria, identidadeAuditoria, nomeCampo, operacoes, valorAuditoria } from "../auditPresentation";
import "../../../../styles/modal.css";

type Props = { registro: RegistroAuditoria; onClose: () => void };
export default function AuditDetails({ registro, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titulo = useId();
  const descricao = useId();
  const [completo, setCompleto] = useState(registro.operacao !== "MOD");
  const area = areaAuditoria(registro.tabela);
  const detalhes = registro.detalhes;
  const alterados = Object.entries(detalhes?.camposAlterados ?? {});
  const campos = [...new Set([...Object.keys(detalhes?.antes ?? {}), ...Object.keys(detalhes?.depois ?? {})])];
  const linhas = completo ? campos.map(chave => ({ chave, antes: detalhes?.antes?.[chave], depois: detalhes?.depois?.[chave], alterado: Object.hasOwn(detalhes?.camposAlterados ?? {}, chave) })) : alterados.map(([chave, mudanca]) => ({ chave, ...mudanca, alterado: true }));
  useEffect(() => {
    const elemento = dialog.current;
    if (!elemento) return;
    const foco = document.activeElement;
    const overflow = document.body.style.overflow;
    elemento.showModal();
    const liberar = registerOverlayDialog(elemento);
    document.body.style.overflow = "hidden";
    return () => { liberar(); elemento.close(); document.body.style.overflow = overflow; if (foco instanceof HTMLElement) foco.focus(); };
  }, []);
  return createPortal(<dialog ref={dialog} aria-labelledby={titulo} aria-describedby={descricao} onCancel={event => { event.preventDefault(); onClose(); }} className="portal-modal-shell fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-visible border-0 bg-transparent p-0 text-slate-800 backdrop:bg-[#102319]/40 backdrop:backdrop-blur-[3px]">
    <div className="portal-modal absolute inset-0 m-auto flex h-fit max-h-[90dvh] w-[calc(100%-2rem)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-[0_24px_80px_-16px_rgba(15,44,24,0.4)]">
      <header className="relative shrink-0 border-b border-[#dce5dc] bg-gradient-to-br from-[#edf7ee] via-[#f7fbf7] to-white px-5 py-5 sm:px-7 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-4"><p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-green-700"><AuditIcon tipo="escudo" className="h-4 w-4" />Trilha de auditoria</p><button type="button" onClick={onClose} aria-label="Fechar detalhes da auditoria" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-green-100 bg-white text-slate-500 transition hover:bg-green-50 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-green-700"><AuditIcon tipo="fechar" className="h-4 w-4" /></button></div>
        <div className="flex items-center gap-4"><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${area.cor}`}><AuditIcon tipo={area.icone} className="h-7 w-7" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 id={titulo} className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{area.nome}</h2><OperacaoBadge operacao={registro.operacao} /></div><p id={descricao} className="mt-1.5 text-sm text-slate-500">{registro.operacao === "MOD" ? "Confira o que mudou entre as versões deste registro." : registro.operacao === "ADD" ? "Confira os dados registrados no momento da inclusão." : "Confira os dados preservados no momento da exclusão."}</p></div></div>
        <dl className="mt-5 grid gap-4 rounded-xl border border-white bg-white/80 p-4 sm:grid-cols-[.8fr_1.2fr_1.4fr]"><div><dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Revisão</dt><dd className="mt-1 text-sm font-bold text-green-800">#{registro.revisao}</dd></div><div><dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Data da movimentação</dt><dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700"><AuditIcon tipo="relogio" className="h-4 w-4 text-slate-400" />{new Date(registro.data).toLocaleString("pt-BR")}</dd></div><div><dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Identificação do registro</dt><dd className="mt-1 break-words text-sm font-medium text-slate-700">{identidadeAuditoria(registro)}</dd></div></dl>
      </header>
      <div className="min-h-0 overflow-y-auto bg-[#fafcf9] px-5 py-5 sm:px-7">
        {!detalhes ? <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Os detalhes desta revisão não estão disponíveis.</div> : <>
          {!detalhes.anteriorDisponivel && <p role="status" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">O estado anterior desta revisão não foi registrado. Os dados disponíveis estão apresentados abaixo.</p>}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-slate-800">{registro.operacao === "MOD" ? "Comparação das versões" : registro.operacao === "ADD" ? "Dados incluídos" : "Dados excluídos"}</h3><p className="mt-1 text-xs text-slate-500">{registro.operacao === "MOD" ? `${alterados.length} campo(s) alterado(s) nesta revisão` : `${campos.length} campo(s) no registro auditado`}</p></div>{registro.operacao === "MOD" && <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">{[{ label: "Só alterações", value: false }, { label: "Registro completo", value: true }].map(item => <button key={item.label} type="button" aria-pressed={completo === item.value} onClick={() => setCompleto(item.value)} className={`min-h-9 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-green-700 ${completo === item.value ? "bg-green-50 text-green-800 shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>{item.label}</button>)}</div>}</div>
          <div className="overflow-hidden rounded-xl border border-[#dce5dc] bg-white">
            <div className={`hidden gap-4 border-b border-[#dce5dc] bg-[#f4f8f3] px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:grid grid-cols-[1fr_1.4fr_1.4fr]`}><span>Campo</span><span>Antes</span><span>Depois</span></div>
            {linhas.length ? linhas.map(linha => <div key={linha.chave} className={`grid gap-3 border-b border-slate-100 p-4 last:border-0 sm:gap-4 sm:px-5 sm:grid-cols-[1fr_1.4fr_1.4fr]`}><div className="min-w-0 py-1"><p className="break-words text-xs font-semibold text-slate-700">{nomeCampo(linha.chave)}</p>{linha.alterado && completo && <span className="mt-1 inline-block text-[10px] text-amber-700">Alterado nesta revisão</span>}</div><div className={`min-w-0 rounded-lg border px-3 py-2.5 ${linha.alterado || registro.operacao === "DEL" ? "border-rose-100 bg-rose-50/60" : "border-slate-100 bg-slate-50"}`}><p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Antes</p><pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-600 [overflow-wrap:anywhere]">{registro.operacao === "ADD" ? "O registro ainda não existia" : !detalhes.anteriorDisponivel ? "Estado anterior não disponível" : valorAuditoria(linha.antes)}</pre></div><div className={`min-w-0 rounded-lg border px-3 py-2.5 ${linha.alterado || registro.operacao === "ADD" ? "border-green-100 bg-green-50/70" : "border-slate-100 bg-slate-50"}`}><p className="mb-1 text-[10px] font-semibold uppercase text-slate-400 sm:hidden">Depois</p><pre className="whitespace-pre-wrap break-words font-sans text-xs leading-relaxed text-slate-700 [overflow-wrap:anywhere]">{registro.operacao === "DEL" ? "Registro excluído" : valorAuditoria(linha.depois)}</pre></div></div>) : <div className="p-8 text-center text-sm text-slate-500">Nenhuma alteração de campo disponível nesta revisão. Selecione Registro completo para consultar os dados preservados.</div>}
          </div>
        </>}
      </div>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#dce5dc] bg-white px-5 py-4 sm:px-7"><p className="flex items-center gap-2 text-xs text-slate-400"><AuditIcon tipo="historico" className="h-4 w-4" />{operacoes[registro.operacao]} preservada no histórico do sistema</p><button type="button" onClick={onClose} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">Concluir consulta<AuditIcon tipo="seta" className="h-4 w-4" /></button></footer>
    </div>
  </dialog>, document.body);
}
