import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Ocorrencia } from "../types/ocorrencia";

export function gerarPdfOcorrencias(registros: Ocorrencia[], mes: string, busca: string, autor: string) {
  const pdf = new jsPDF();
  pdf.setFontSize(17); pdf.text("Portal Incluir", 14, 19);
  pdf.setFontSize(13); pdf.text("Relatório de ocorrências", 14, 28);
  pdf.setFontSize(10);
  const resumo = pdf.splitTextToSize(`Período: ${mes || "Todo o período"} | Total: ${registros.length}\nBusca: ${busca || "Todas"} | Profissional: ${autor || "Todos os profissionais acessíveis"}\nEmitido em ${new Date().toLocaleString("pt-BR")} (Brasília).`, 180);
  pdf.text(resumo, 14, 37);
  autoTable(pdf, {
    startY: 40 + resumo.length * 4.5,
    head: [["Quando / Estudante", "Profissional", "Ocorrência"]],
    body: registros.map(o => [`${new Date(o.ocorridaEm).toLocaleString("pt-BR")}\n${o.estudanteNome}\nMatrícula: ${o.estudanteMatricula}`, o.autorNome, `${o.descricao}${o.arquivoNome ? `\n\nAnexo: ${o.arquivoNome}` : ""}`]),
    styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak", valign: "top" },
    headStyles: { fillColor: [40, 117, 53] },
    columnStyles: { 0: { cellWidth: 48 }, 1: { cellWidth: 38 } },
    margin: { top: 15, bottom: 18 },
  });
  const total = pdf.getNumberOfPages();
  for (let pagina = 1; pagina <= total; pagina++) {
    pdf.setPage(pagina); pdf.setFontSize(8); pdf.setTextColor(100);
    pdf.text(`Portal Incluir · Registros de ocorrência · Página ${pagina} de ${total}`, 14, 289);
  }
  return pdf;
}

export async function exportarOcorrencias(registros: Ocorrencia[], mes: string, busca: string, autor: string) {
  gerarPdfOcorrencias(registros, mes, busca, autor).save(`ocorrencias-${mes || "geral"}.pdf`);
}
