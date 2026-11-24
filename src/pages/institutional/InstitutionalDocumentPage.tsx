import { useState, type MouseEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { destinoUsuario, routes } from "../../config/routes";
import { colorThemes } from "../../config/uiThemes";
import type { InstitutionalDocument } from "../../config/institutionalDocuments";
import PdfViewer from "../../components/common/PdfViewer";
import ResourceIcon from "../../components/icons/ResourceIcon";
import AppHeader from "../../components/layout/AppHeader";
import { requestSourceTabFocus } from "../../services/sessionTabs";

export default function InstitutionalDocumentPage({ document }: { document: InstitutionalDocument }) {
  const { usuario } = useAuth();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [returning, setReturning] = useState(false);
  const [closeBlocked, setCloseBlocked] = useState(false);
  const sourceTab = params.get("fromTab");
  const sourceSearch = sourceTab ? `?fromTab=${encodeURIComponent(sourceTab)}` : "";
  const portalPath = usuario ? destinoUsuario(usuario) : routes.login;

  async function returnToPortal(event: MouseEvent<HTMLAnchorElement>) {
    if (!sourceTab || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (returning) return;
    setReturning(true);
    if (await requestSourceTabFocus(sourceTab)) {
      window.close();
      // Some browsers disallow script-closing manually opened tabs.
      setCloseBlocked(true);
    } else {
      navigate(portalPath);
    }
    setReturning(false);
  }
  return (
    <div className="min-h-dvh bg-[#f3f6f1]" style={colorThemes[document.tone]}>
      <AppHeader usuario={usuario} />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <nav aria-label="Recursos institucionais" className="flex flex-wrap items-center gap-2">
          <Link to={portalPath} onClick={returnToPortal} aria-disabled={returning} className="mr-auto min-h-11 rounded-lg border border-[#dce5dc] bg-white px-4 py-3 text-sm font-semibold text-primary hover:bg-[#edf7ee]">{returning ? "Voltando…" : sourceTab || usuario ? "← Voltar ao painel" : "Acessar o portal"}</Link>
          <Link to={`${routes.lgpd}${sourceSearch}`} aria-current={document.icon === "shield" ? "page" : undefined} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 ring-1 ring-inset ring-sky-100 hover:bg-sky-100 aria-[current=page]:ring-sky-600"><ResourceIcon name="shield" />LGPD</Link>
          <Link to={`${routes.legislacao}${sourceSearch}`} aria-current={document.icon === "scales" ? "page" : undefined} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 ring-1 ring-inset ring-red-100 hover:bg-red-100 aria-[current=page]:ring-red-600"><ResourceIcon name="scales" />Legislação</Link>
        </nav>
        {closeBlocked && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Se esta guia continuar aberta, feche-a para voltar à guia original do portal. Você também pode <Link to={portalPath} className="font-semibold underline">abrir o painel nesta guia</Link>.</p>}
        <section className="rounded-xl border border-[#dce5dc] bg-white p-6 sm:p-8">
          <div aria-hidden="true" className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent-main)]"><ResourceIcon name={document.icon} className="h-8 w-8" /></div>
          <p className="mb-2 text-sm font-semibold text-[var(--accent-main)]">{document.subtitle}</p>
          <h1 data-page-title className="text-2xl font-bold leading-tight text-[#26332b] sm:text-3xl">{document.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">{document.description}</p>
        </section>
        <section className="rounded-xl border border-[#dce5dc] bg-white p-6 sm:p-8" aria-labelledby="portal-guidance-title">
          <h2 id="portal-guidance-title" className="text-xl font-bold text-[#26332b]">No Portal Incluir</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">{document.portalDescription}</p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">{document.guidance.map(item => <li key={item} className="flex items-start gap-3 rounded-lg bg-[var(--accent-soft)] p-4 text-sm leading-relaxed text-slate-700"><span aria-hidden="true" className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--accent-main)]" />{item}</li>)}</ul>
        </section>
        <PdfViewer title={document.subtitle} url={document.pdfUrl} sourceUrl={document.sourceUrl} publisher={document.publisher} />
      </main>
      <footer className="px-6 pb-8 text-center text-xs text-slate-500">Portal Incluir · Referências para o acompanhamento educacional e o uso responsável das informações.</footer>
    </div>
  );
}
