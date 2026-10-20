import { useEffect, useId, useRef, useState } from "react";
import ResourceIcon from "../icons/ResourceIcon";

/** Shared entry point for every authenticated profile. No notification API yet. */
export default function NotificationsButton() {
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
    <button ref={triggerRef} type="button" onClick={() => setOpen(value => !value)} aria-label="Abrir notificações" aria-expanded={open} aria-controls={id} title="Notificações"
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dce5dc] text-primary transition hover:bg-[#edf7ee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${open ? "bg-[#edf7ee]" : "bg-white"}`}>
      <ResourceIcon name="bell" className="h-5 w-5" />
    </button>
    {open && <section id={id} aria-label="Notificações" className="fixed right-4 top-20 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[#dce5dc] bg-white shadow-xl sm:absolute sm:right-0 sm:top-full sm:mt-2">
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">Notificações</h2>
        <button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} aria-label="Fechar notificações" className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-[#edf7ee] hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>
        </button>
      </header>
      <div className="max-h-[min(24rem,60dvh)] overflow-y-auto px-5 py-7 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7ee] text-primary"><ResourceIcon name="bell" className="h-5 w-5" /></span>
        <p className="text-sm font-semibold text-slate-700">Nenhuma notificação disponível</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Os avisos do sistema aparecerão aqui quando a integração de notificações estiver disponível.</p>
      </div>
    </section>}
  </div>;
}
