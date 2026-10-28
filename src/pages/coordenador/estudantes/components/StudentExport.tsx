import { useState } from "react";
import Button from "../../../../components/common/Button";
import { useAuth } from "../../../../hooks/useAuth";
import { canAccess } from "../../../../config/access";
import { mensagemErro } from "../../../../services/apiError";
import type { TipoExportacao } from "../../../../services/documentosEstudante/exportar";

export default function StudentExport({ estudanteId, tipo, planoId }: { estudanteId: number; tipo: TipoExportacao; planoId?: number }) {
  const { usuario } = useAuth();
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  if (!usuario || !canAccess(usuario, "documentos") || !canAccess(usuario, "sensivel.consultar")) return null;
  async function exportar(formato: "pdf" | "docx") {
    if (ocupado) return;
    setOcupado(true); setErro("");
    try { const { exportarDocumentoFluxo } = await import("../../../../services/documentosEstudante/exportar"); await exportarDocumentoFluxo(estudanteId, tipo, formato, planoId); }
    catch (e) { setErro(mensagemErro(e)); }
    finally { setOcupado(false); }
  }
  return <section className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold text-slate-800">{tipo === "plano" ? `Plano de ação nº ${planoId}` : tipo === "anamnese" ? "Anamnese do estudante" : "RAI acumulativo"}</h3><p className="mt-1 text-xs text-slate-500">{tipo === "rai" ? "Reúne os registros disponíveis até a emissão." : "Exporta os dados salvos. Salve suas alterações antes de emitir."}</p></div><div className="flex gap-2"><Button variant="secondary" disabled={ocupado} onClick={() => void exportar("pdf")}>{ocupado ? "Gerando..." : "Baixar PDF"}</Button><Button variant="secondary" disabled={ocupado} onClick={() => void exportar("docx")}>Baixar Word</Button></div></div>{erro && <p role="alert" className="mt-3 text-sm text-red-700">{erro}</p>}</section>;
}
