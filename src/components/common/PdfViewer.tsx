type Props = { title: string; url: string; sourceUrl: string; publisher: string };

/** External PDFs may be blocked by browser/site policies; alternatives stay visible. */
export default function PdfViewer({ title, url, sourceUrl, publisher }: Props) {
  const linkClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#dce5dc] bg-white px-4 py-2 text-sm font-semibold text-[#226b32] transition hover:bg-[#e8f5e9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  return (
    <section aria-labelledby="document-viewer-title" className="overflow-hidden rounded-xl border border-[#dce5dc] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce5dc] p-5">
        <div><h2 id="document-viewer-title" className="text-lg font-bold text-[#26332b]">Documento para consulta</h2><p className="mt-1 text-xs text-slate-500">{publisher} · PDF</p></div>
        <div className="flex flex-wrap gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>Abrir PDF <span className="sr-only">em nova aba</span><span aria-hidden="true">↗</span></a>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Ler texto em HTML <span className="sr-only">na fonte oficial, em nova aba</span><span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <p className="border-b border-[#dce5dc] bg-[#f5f8f4] px-5 py-3 text-sm leading-relaxed text-slate-600">Se o documento não aparecer abaixo, use “Abrir PDF”. Para leitura em texto, use “Ler texto em HTML”. Consulte a fonte oficial para acompanhar atualizações da lei.</p>
      <object data={url} type="application/pdf" title={`PDF: ${title}`} aria-label={`Documento PDF: ${title}`} className="block h-[70dvh] min-h-96 w-full bg-slate-100">
        <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"><p className="max-w-md text-slate-600">Seu navegador não exibiu o PDF nesta página. Você pode acessar o documento pelos links abaixo.</p><a href={url} target="_blank" rel="noopener noreferrer" className={linkClass}>Abrir PDF em nova aba ↗</a><a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>Ler na fonte oficial ↗</a></div>
      </object>
    </section>
  );
}
