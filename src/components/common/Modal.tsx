import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { colorThemes, type ColorTheme } from "../../config/uiThemes";
import "../../styles/modal.css";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: ColorTheme;
  children: ReactNode;
};

/** Native dialog supplies focus containment and makes the background inert. */
export default function Modal({ open, onClose, title, description, icon, tone = "green", children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [open]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <dialog
      ref={dialogRef}
      style={colorThemes[tone]}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={event => { event.preventDefault(); onClose(); }}
      className="portal-modal fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-[#dce5dc] bg-white p-0 text-slate-800 shadow-[0_24px_80px_-16px_rgba(15,44,24,0.4)] backdrop:bg-[#102319]/45 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="relative shrink-0 border-b border-[#dce5dc] bg-gradient-to-br from-[var(--accent-soft)] via-white to-white p-6 pr-16 sm:p-8 sm:pr-20">
          <div>
            <div aria-hidden="true" className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[var(--accent-main)] shadow-[0_3px_12px_rgba(30,80,40,0.08)] ring-1 ring-[var(--accent-ring)]">
              {icon ?? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7v1" strokeLinecap="round" /></svg>}
            </div>
            <h2 id={titleId} className="text-2xl font-bold leading-snug tracking-tight text-[var(--accent-main)]">{title}</h2>
            {description && <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar janela" className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent-main)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-main)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-6 text-sm leading-relaxed sm:p-8">{children}</div>
        <footer className="flex shrink-0 items-center justify-end border-t border-[#dce5dc] bg-[var(--accent-soft)] px-6 py-5 sm:px-8">
          <button type="button" onClick={onClose} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-main)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-main)] sm:w-auto"><svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10 6-6 6 6 6M4 12h16" strokeLinecap="round" strokeLinejoin="round" /></svg>Fechar e voltar</button>
        </footer>
      </div>
    </dialog>, document.body,
  );
}
