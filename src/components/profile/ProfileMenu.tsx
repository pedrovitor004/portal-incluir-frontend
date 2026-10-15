import { useEffect, useId, useRef, useState } from "react";
import { accessProfiles } from "../../config/access";
import type { Usuario } from "../../types/auth";
import ProfileModal from "./ProfileModal";
import { getProfileAdapter } from "../../config/profile";

export default function ProfileMenu({ usuario }: { usuario: Usuario }) {
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<"details" | "edit" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const adapter = getProfileAdapter(usuario.perfil);
  const role = accessProfiles[usuario.perfil].label;
  const initials = usuario.nome.split(" ").filter(Boolean).slice(0, 2).map(name => name[0]).join("");

  useEffect(() => {
    if (!expanded) return;
    const onPointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setExpanded(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setExpanded(false); triggerRef.current?.focus(); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [expanded]);

  function openProfile(mode: "details" | "edit") {
    // Keep the persistent trigger as the focus return target of the modal.
    triggerRef.current?.focus();
    setExpanded(false);
    setView(mode);
  }

  return (
    <div ref={rootRef} className="relative shrink-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}>
      <button ref={triggerRef} type="button" onClick={() => setExpanded(value => !value)} aria-label={`Abrir perfil de ${usuario.nome}`} aria-expanded={expanded} aria-controls={id} className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-[#f0f7ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
        <span className="hidden text-right sm:block"><span className="block text-[10px] text-slate-500">{role}</span><span className="block max-w-56 truncate text-xs font-semibold text-slate-800">{usuario.nome}</span></span>
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e6f4e8] text-base font-bold text-primary">{initials}</span>
        <svg aria-hidden="true" className={`h-4 w-4 text-primary transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {expanded && <div id={id} className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#dce5dc] bg-white p-3 shadow-xl">
        <div className="mb-2 border-b border-slate-100 px-3 py-3"><p className="break-words font-semibold text-[#26332b]">{usuario.nome}</p><p className="mt-1 break-words text-xs text-slate-500">{usuario.email}</p><span className="mt-3 inline-block rounded-full bg-[#e6f4e8] px-3 py-1 text-xs font-semibold text-[#287535]">{role}</span></div>
        {adapter ? <div className="space-y-1"><button type="button" onClick={() => openProfile("details")} aria-haspopup="dialog" className="min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-[#f0f7ef] focus-visible:outline-2 focus-visible:outline-primary">Ver meus dados</button><button type="button" onClick={() => openProfile("edit")} aria-haspopup="dialog" className="min-h-11 w-full rounded-lg bg-[#e6f4e8] px-3 py-2 text-left text-sm font-semibold text-[#287535] hover:bg-[#d4ebd8] focus-visible:outline-2 focus-visible:outline-primary">Editar meus dados</button></div> : <p className="px-3 py-2 text-xs text-slate-500">Perfil de acesso da sua conta.</p>}
      </div>}
      {view && adapter && <ProfileModal adapter={adapter} key={`${usuario.perfil}:${usuario.perfilId}`} usuario={usuario} initialEditing={view === "edit"} onClose={() => setView(null)} />}
    </div>
  );
}
