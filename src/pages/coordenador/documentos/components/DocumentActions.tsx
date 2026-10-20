import type { Documento } from "../../../../types/documento";
import { acoesDocumento, acaoPermitida, type AcaoDocumento } from "../../../../config/documentActions";
import { colorThemes } from "../../../../config/uiThemes";
type Props = { documento: Documento; onView: (doc: Documento) => void; onEdit: (doc: Documento) => void; onAction: (doc: Documento, acao: AcaoDocumento) => void; bloqueado?: boolean };
export default function DocumentActions({ documento, onView, onEdit, onAction, bloqueado }: Props) {
  const somenteLeitura = documento.assinado || documento.arquivado;
  const classes = "inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 motion-reduce:transform-none";
  const contexto = `${documento.nome} de ${documento.estudanteNome}`;
  const acoes: AcaoDocumento[] = [documento.arquivado ? "desarquivar" : "arquivar", "excluir"];
  return <div className="flex h-full items-center gap-2">
    <button type="button" aria-label={`Visualizar ${contexto}`} title="Visualizar documento" disabled={bloqueado} onClick={() => onView(documento)} className={`${classes} bg-sky-50 text-sky-700 ring-sky-100 hover:bg-sky-100`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="h-4 w-4"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
    </button>
    <button type="button" aria-label={`Editar ${contexto}`} title={somenteLeitura ? "Documento assinado ou arquivado: somente leitura" : "Editar documento"} disabled={bloqueado || somenteLeitura} onClick={() => onEdit(documento)} className={`${classes} bg-amber-50 text-amber-700 ring-amber-100 hover:bg-amber-100`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4"><path d="m16 3 5 5-12 12-6 1 1-6L16 3ZM14 5l5 5" /></svg>
    </button>
    {acoes.map(acao => { const config = acoesDocumento[acao]; const permitida = acaoPermitida(documento, acao); return <button key={acao} type="button" aria-label={`${config.botao} ${contexto}`} title={permitida ? config.titulo : `${config.titulo}: indisponível para documento assinado ou arquivado`} disabled={bloqueado || !permitida} onClick={() => onAction(documento, acao)} style={colorThemes[config.tom]} className={`${classes} bg-[var(--accent-soft)] text-[var(--accent-main)] ring-[var(--accent-ring)] hover:bg-[var(--accent-ring)]`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4"><path d={config.icone} /></svg>
    </button>; })}
  </div>;
}
