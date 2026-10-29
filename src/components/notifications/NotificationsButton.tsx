import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import ResourceIcon from "../icons/ResourceIcon";
import { useAuth } from "../../hooks/useAuth";
import { gestaoAcompanhamentoPreview as preview } from "../../services/gestaoAcompanhamentoPreview";
import { useNotificacoes } from "../../hooks/useNotificacoes";
import NotificationsList from "./NotificationsList";

/** Notificações recebidas pela conta e prévias locais da coordenação. */
export default function NotificationsButton() {
  const { usuario } = useAuth();
  const conta = usuario?.id ?? -1;
  const estado = useSyncExternalStore(preview.subscribe, () => preview.consultar(conta));
  const avisos = usuario?.perfil === "COORDENADOR" ? estado.avisos : [];
  const recebidas = useNotificacoes();
  const naoLidas = recebidas.avisos.filter(a => !a.lida).length + recebidas.solicitacoes.length;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); triggerRef.current?.focus(); }
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return <div ref={rootRef} className="relative shrink-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={triggerRef} type="button" onClick={() => { if (!open) recebidas.atualizar(); setOpen(value => !value); }} aria-label={`Abrir notificações${naoLidas ? `, ${naoLidas} não lidas` : ""}`} aria-expanded={open} aria-controls={id} title="Notificações"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dce5dc] text-primary transition hover:bg-[#edf7ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${open ? "bg-[#edf7ee]" : "bg-white"}`}>
      <ResourceIcon name="bell" className="h-5 w-5" />
      {naoLidas > 0 && <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-700 px-1 text-[10px] font-bold text-white">{naoLidas > 99 ? "99+" : naoLidas}</span>}
    </button>
    {open && <section id={id} aria-label="Notificações" className="fixed right-4 top-20 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-xl sm:absolute sm:right-0 sm:top-full sm:mt-2">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Notificações</h2>
        <button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} aria-label="Fechar notificações" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-[#edf7ee] hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
        </button>
      </header>
      <NotificationsList dados={recebidas} />
      {avisos.length > 0 ? <div className="max-h-[min(24rem,60dvh)] overflow-y-auto overscroll-contain"><div className="border-b border-amber-100 bg-amber-50 p-4"><p className="text-xs leading-relaxed text-amber-900">Prévia das notificações de saída. Nenhuma mensagem foi entregue aos profissionais.</p><button type="button" onClick={() => preview.ler(conta)} className="mt-2 min-h-11 text-xs font-semibold text-primary">Marcar prévias como lidas</button></div><ul className="divide-y divide-slate-100">{avisos.map(aviso => <li key={aviso.id} className={`break-words p-4 ${!aviso.lido ? "bg-green-50/50" : ""}`}><p className="text-sm font-semibold text-slate-800">{aviso.titulo}</p><p className="mt-1 text-xs font-semibold text-green-800">Para: {aviso.destinatario}</p><p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{aviso.mensagem}</p><time dateTime={aviso.data} className="mt-2 block text-[11px] text-slate-500">{new Date(aviso.data).toLocaleString("pt-BR")}</time></li>)}</ul></div> : null}
    </section>}
  </div>;
}
