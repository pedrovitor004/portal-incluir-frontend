export default function LoadingState({ label = "Carregando dados...", compact = false }: { label?: string; compact?: boolean }) {
  return <div role="status" aria-live="polite" className={`flex items-center justify-center gap-3 text-sm text-slate-600 ${compact ? "py-3" : "min-h-48 rounded-2xl border border-green-100 bg-white p-8"}`}>
    <span aria-hidden="true" className="h-6 w-6 shrink-0 animate-spin rounded-full border-[3px] border-green-100 border-t-primary motion-reduce:animate-none" />
    <span>{label}</span>
  </div>;
}
