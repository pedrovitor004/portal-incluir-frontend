import { useEffect, useState } from "react";
import Button from "../../../../components/common/Button";
import LoadingState from "../../../../components/common/LoadingState";
import { documentosService } from "../../../../services/documentosService";
import { mensagemErro } from "../../../../services/apiError";
import type { Documento, TipoDocumento } from "../../../../types/documento";
import DocumentDetails from "./DocumentDetails";
import StudentExport from "../../estudantes/components/StudentExport";
import DocumentExport from "./DocumentExport";

const tipos: TipoDocumento[] = ["ANAMNESE", "PEI", "PLANO_ACAO", "PEA", "RAI"];

export default function DocumentViewer({ tipo, id, onBack }: { tipo: string; id: number; onBack: () => void }) {
  const [documento, setDocumento] = useState<Documento | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    if (!tipos.includes(tipo as TipoDocumento) || !Number.isSafeInteger(id) || id <= 0) return;
    const controller = new AbortController();
    documentosService.buscar({ tipo: tipo as TipoDocumento, id }, controller.signal).then(dados => {
      if (!controller.signal.aborted) setDocumento(dados);
    }).catch(error => { if (!controller.signal.aborted) setErro(mensagemErro(error)); });
    return () => controller.abort();
  }, [tipo, id, tentativa]);
  if (!tipos.includes(tipo as TipoDocumento) || !Number.isSafeInteger(id) || id <= 0) return <div role="alert">Documento inválido. <Button onClick={onBack}>Voltar</Button></div>;
  return <div className="mx-auto max-w-5xl space-y-6 pb-8">
    <header className="flex flex-wrap items-center justify-between gap-4 print:hidden">
      <div><h1 data-page-title className="text-2xl font-bold text-primary">{documento?.nome || "Visualizar documento"}</h1><p className="mt-1 text-sm text-slate-500">Últimos dados salvos do documento selecionado · somente leitura.</p></div>
      <div className="flex gap-2"><Button variant="secondary" onClick={onBack}>Voltar aos documentos</Button></div>
    </header>
    {erro ? <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5"><p>{erro}</p><Button onClick={() => { setErro(""); setDocumento(null); setTentativa(v => v + 1); }}>Tentar novamente</Button></div> : !documento ? <LoadingState label="Carregando o documento preenchido..." /> : <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:p-0 print:shadow-none">
      <h2 className="mb-8 text-center text-xl font-bold uppercase text-slate-900">{documento.nome}</h2>
      <DocumentDetails documento={documento} />
      {(documento.tipo === "PEA" || documento.tipo === "PEI") && <div className="mt-8 print:hidden"><DocumentExport key={documento.chave} documento={documento} /></div>}
      {(documento.tipo === "ANAMNESE" || documento.tipo === "PLANO_ACAO") && <div className="mt-8 print:hidden"><StudentExport estudanteId={documento.estudanteId} tipo={documento.tipo === "ANAMNESE" ? "anamnese" : "plano"} planoId={documento.tipo === "PLANO_ACAO" ? documento.id : undefined} /></div>}
    </article>}
  </div>;
}
