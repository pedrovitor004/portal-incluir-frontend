import { useEffect, useId, useRef, useState } from "react";
import { atuacoesDocentes } from "../../config/profissionais";

export default function ProfessionalCoursesField({ value, onChange, disabled = false }: { value: string[]; onChange: (cursos: string[]) => void; disabled?: boolean }) {
  const opcoes = [...atuacoesDocentes, ...value.filter(curso => !atuacoesDocentes.includes(curso))];
  const [aberto, setAberto] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const gatilho = useRef<HTMLButtonElement>(null);
  const listaId = useId();
  useEffect(() => {
    if (!aberto) return;
    function fecharFora(event: PointerEvent) {
      if (event.target instanceof Node && !container.current?.contains(event.target)) setAberto(false);
    }
    function fecharComTeclado(event: KeyboardEvent) {
      if (event.key === "Escape") { setAberto(false); gatilho.current?.focus(); }
    }
    document.addEventListener("pointerdown", fecharFora);
    document.addEventListener("keydown", fecharComTeclado);
    return () => {
      document.removeEventListener("pointerdown", fecharFora);
      document.removeEventListener("keydown", fecharComTeclado);
    };
  }, [aberto]);
  return <div ref={container} className="flex min-w-0 flex-col gap-1 sm:col-span-2">
    <span className="text-xs font-medium text-primary">Cursos e áreas de atuação do professor (obrigatório)</span>
    <div className="relative min-w-0">
      <button ref={gatilho} type="button" aria-label="Selecionar cursos e áreas de atuação" aria-expanded={aberto && !disabled} aria-controls={listaId} disabled={disabled} onClick={() => setAberto(atual => !atual)} className="flex h-9 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-left text-sm text-slate-700 outline-none hover:border-emerald-400 focus-visible:ring-4 focus-visible:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60">
        <span className="min-w-0 truncate">{value.length === 0 ? "Selecione um ou mais cursos ou a base comum" : value.length === 1 ? value[0] : `${value.length} opções selecionadas`}</span>
        <svg aria-hidden="true" className={`h-4 w-4 shrink-0 transition ${aberto ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <div id={listaId} hidden={!aberto || disabled} role="group" aria-label="Cursos e áreas de atuação" className="absolute bottom-full left-0 z-30 mb-2 max-h-56 w-full overflow-y-auto overscroll-contain rounded-xl border border-emerald-200 bg-white p-2 shadow-xl">
        {opcoes.map(curso => <button key={curso} type="button" role="checkbox" aria-checked={value.includes(curso)} disabled={disabled} onClick={() => onChange(value.includes(curso) ? value.filter(atual => atual !== curso) : [...value, curso])} className="flex w-full cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-left text-xs leading-5 text-slate-700 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-primary">
          <span aria-hidden="true" className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${value.includes(curso) ? "border-primary bg-primary text-white" : "border-slate-300 bg-white"}`}>{value.includes(curso) && <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 4 4L19 6" /></svg>}</span>
          <span>{curso}</span>
        </button>)}
      </div>
    </div>
    <span className="text-xs text-slate-500">Pode selecionar mais de um. A disciplina pode ser informada depois.</span>
  </div>;
}
