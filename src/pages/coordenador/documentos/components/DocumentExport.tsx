import { useState } from "react";
import Button from "../../../../components/common/Button";
import { useAuth } from "../../../../hooks/useAuth";
import { canAccess } from "../../../../config/access";
import { mensagemErro } from "../../../../services/apiError";
import type { Documento } from "../../../../types/documento";

export default function DocumentExport({ documento }: { documento: Documento }) {
  const { usuario } = useAuth();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  if (!usuario || !canAccess(usuario, "documentos") ||
    (documento.tipo !== "PEA" && documento.tipo !== "PEI") ||
    !canAccess(usuario, documento.tipo === "PEA" ? "pedagogico.consultar" : "pei.consultar")) return null;

  async function exportar(formato: "pdf" | "docx") {
    if (ocupado) return;
    setOcupado(true);
    setErro("");
    try {
      const { exportarDocumentoPreenchido } = await import("../../../../services/exportarDocumentoPreenchido");
      await exportarDocumentoPreenchido(documento, formato);
    } catch (e) { setErro(mensagemErro(e)); }
    finally { setOcupado(false); }
  }

  return <section className="rounded-xl border border-slate-200 bg-white p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h3 className="text-sm font-semibold text-slate-800">{documento.tipo} nº {documento.id}</h3><p className="mt-1 text-xs text-slate-500">Exporta os dados salvos exibidos neste documento.</p></div>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={ocupado} onClick={() => void exportar("pdf")}>{ocupado ? "Gerando..." : "Baixar PDF"}</Button>
        <Button variant="secondary" disabled={ocupado} onClick={() => void exportar("docx")}>Baixar Word</Button>
      </div>
    </div>
    {erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}
  </section>;
}
