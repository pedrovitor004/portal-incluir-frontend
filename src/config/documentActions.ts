import type { Documento } from "../types/documento";
import type { ColorTheme } from "./uiThemes";
export type AcaoDocumento = "excluir" | "arquivar" | "desarquivar";
export const acoesDocumento: Record<AcaoDocumento, { titulo: string; botao: string; progresso: string; sucesso: string; descricao: string; tom: ColorTheme; icone: string }> = {
  excluir: { titulo: "Excluir documento", botao: "Excluir", progresso: "Excluindo documento...", sucesso: "Documento excluído com sucesso.", descricao: "O documento será removido. Esta ação não pode ser desfeita pela página.", tom: "red", icone: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7" },
  arquivar: { titulo: "Arquivar documento", botao: "Arquivar", progresso: "Arquivando documento...", sucesso: "Documento arquivado com sucesso.", descricao: "O documento ficará arquivado e disponível para consulta, sem permitir edição.", tom: "amber", icone: "M3 3h18v5H3zM5 8v13h14V8M9 12h6" },
  desarquivar: { titulo: "Desarquivar documento", botao: "Desarquivar", progresso: "Desarquivando documento...", sucesso: "Documento desarquivado com sucesso.", descricao: "O documento voltará à lista de documentos não arquivados. Documentos assinados continuarão sem permitir edição.", tom: "blue", icone: "M3 3h18v5H3zM5 8v13h14V8M12 18v-7m-3 3 3-3 3 3" },
};
export function acaoPermitida(documento: Documento, acao: AcaoDocumento): boolean {
  if (documento.tipo !== "PEI" && documento.tipo !== "PLANO_ACAO") return false;
  switch (acao) {
    case "arquivar": return !documento.arquivado;
    case "desarquivar": return documento.arquivado;
    case "excluir": return !documento.assinado;
  }
}
