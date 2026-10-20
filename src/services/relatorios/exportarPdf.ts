import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { camposRelatorio, referenciasRelatorio } from "../../config/relatorios";
import { descreverFiltros, tabelaExportacao } from "./relatorioModel";
import type { RelatorioInstitucional } from "../../types/relatorio";

type Marcas = { ifpb?: string; clai?: string; brasao?: string };
export function criarPdfRelatorio(r: RelatorioInstitucional, marcas: Marcas = {}) {
  const campos = camposRelatorio.filter(c => r.campos.includes(c.id));
  const paisagem = campos.length > 4;
  const pdf = new jsPDF({ format: "a4", unit: "mm", orientation: paisagem ? "landscape" : "portrait" });
  const largura = pdf.internal.pageSize.getWidth(), altura = pdf.internal.pageSize.getHeight();
  const margem = 18, util = largura - margem * 2, limite = altura - 22;
  const verde: [number, number, number] = [40, 117, 53];
  pdf.setProperties({ title: r.titulo, subject: "Relatório institucional - CLAI / IFPB Campus Monteiro", author: "IFPB Campus Monteiro - CLAI", creator: "Portal Incluir" });

  function imagem(data: string | undefined, x: number, y: number, maxW: number, maxH: number) {
    if (!data) return;
    const p = pdf.getImageProperties(data), escala = Math.min(maxW / p.width, maxH / p.height);
    pdf.addImage(data, data.startsWith("data:image/jpeg") ? "JPEG" : "PNG", x, y, p.width * escala, p.height * escala);
  }
  function cabecalho(continuacao = false) {
    imagem(marcas.ifpb, margem, 12, 15, 21);
    imagem(marcas.clai, largura - margem - 39, 14, 17, 18);
    imagem(marcas.brasao, largura - margem - 14, 15, 14, 14);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(38, 51, 43);
    pdf.text("INSTITUTO FEDERAL DA PARAÍBA", margem + 22, 18);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8);
    pdf.text("Campus Monteiro", margem + 22, 23);
    pdf.setFontSize(6.5); pdf.text("Coordenação Local de Acessibilidade e Inclusão", margem + 22, 28);
    pdf.setDrawColor(...verde); pdf.setLineWidth(0.5); pdf.line(margem, 37, largura - margem, 37);
    if (continuacao) {
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...verde);
      pdf.text(pdf.splitTextToSize(r.titulo, util), margem, 44);
    }
  }
  cabecalho();
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(17); pdf.setTextColor(33, 49, 39);
  const titulo = pdf.splitTextToSize(r.titulo, util);
  pdf.text(titulo, margem, 49);
  let y = 49 + titulo.length * 6.7;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(95, 108, 100);
  pdf.text(`Relatório consolidado | Consulta em ${new Date(r.consultadoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (Brasília)`, margem, y + 2);
  y += 10;
  const filtros = pdf.splitTextToSize(descreverFiltros(r.filtros), util - 8);
  const alturaFiltros = filtros.length * 3.6 + 8;
  pdf.setFillColor(245, 248, 245); pdf.roundedRect(margem, y, util, alturaFiltros, 1.5, 1.5, "F");
  pdf.setTextColor(77, 91, 81); pdf.text(filtros, margem + 4, y + 6); y += alturaFiltros + 10;
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...verde);
  pdf.text("Indicadores por curso", margem, y); y += 4;
  const tabela = tabelaExportacao(r);
  let fimTabela = y;
  autoTable(pdf, {
    head: [tabela.cabecalho], body: tabela.linhas.slice(0, -1), foot: [tabela.linhas[tabela.linhas.length - 1]],
    showFoot: "lastPage", startY: y, margin: { top: 57, left: margem, right: margem, bottom: 23 },
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.8, overflow: "linebreak", textColor: [57, 70, 61], lineColor: [228, 234, 228], lineWidth: 0.1 },
    headStyles: { fillColor: verde, textColor: [255, 255, 255], fontStyle: "bold", valign: "middle" },
    footStyles: { fillColor: [232, 245, 233], textColor: verde, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 248] },
    columnStyles: Object.fromEntries(tabela.cabecalho.map((_, i) => [i, i === 0 ? { cellWidth: paisagem ? 80 : campos.length > 2 ? 65 : 100 } : { halign: "right" }])),
    didParseCell: dados => { if (dados.column.index > 0) dados.cell.styles.halign = "right"; },
    didDrawPage: dados => { if (dados.pageNumber > 1) cabecalho(true); fimTabela = dados.cursor?.y || 60; },
  });
  y = fimTabela + 11;
  function novaPagina() { pdf.addPage(); cabecalho(true); y = 60; }
  function texto(texto: string, tamanho = 8) {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(tamanho); pdf.setTextColor(82, 96, 86);
    const linhas: string[] = pdf.splitTextToSize(texto, util);
    for (const linha of linhas) { if (y + 4 > limite) novaPagina(); pdf.setFont("helvetica", "normal"); pdf.setFontSize(tamanho); pdf.setTextColor(82, 96, 86); pdf.text(linha, margem, y); y += tamanho * 0.44; }
    y += 2;
  }
  if (y + 34 > limite) novaPagina();
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(9); pdf.setTextColor(...verde); pdf.text("Fonte e critérios de contagem", margem, y); y += 6;
  texto("Fonte: cadastros de estudantes e documentos do Portal Incluir, conforme os filtros e a data de consulta acima. A base não representa o total de matrículas do campus.");
  if (r.campos.some(c => ["ativos", "inativos", "concluidos"].includes(c))) texto("Ativos/inativos seguem a situação cadastral. Concluídos possuem data de conclusão e também integram esses totais; não devem ser somados a ativos e inativos.");
  if (r.campos.includes("comPei") || r.campos.includes("comPlano")) texto("PEI: Plano Educacional Individualizado. Consideram-se documentos não arquivados; sua presença não comprova atendimento. Um estudante pode ter ambos os tipos de documento.");
  texto("Documento de apoio à gestão, sem identificação dos estudantes. Não substitui a declaração oficial ao MEC/Inep. Encaminhamento e assinatura pelo SUAP. Uso institucional restrito, inclusive para cursos com poucos estudantes.", 7.5);
  if (r.demonstracoesExcluidas) texto(`Documentos de demonstração desconsiderados na base: ${r.demonstracoesExcluidas}.`, 7.5);
  if (y + 12 > limite) novaPagina();
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(8); pdf.setTextColor(...verde); pdf.text("Referências de contexto institucional", margem, y); y += 5;
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(7);
  let x = margem;
  const nomesReferencias = ["Gestão institucional (IFPB)", "Acessibilidade e inclusão (IFPB)", "Censo da Educação Superior (Inep)"];
  referenciasRelatorio.forEach((ref, i) => {
    const label = nomesReferencias[i], comprimento = pdf.getTextWidth(label);
    if (x + comprimento > largura - margem) { x = margem; y += 4; }
    pdf.setTextColor(60, 102, 69); pdf.textWithLink(label, x, y, { url: ref.url }); x += comprimento + 8;
  });
  const paginas = pdf.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    pdf.setPage(i); pdf.setDrawColor(216, 225, 217); pdf.setLineWidth(0.2); pdf.line(margem, altura - 16, largura - margem, altura - 16);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(100, 112, 104);
    pdf.text("IFPB Campus Monteiro | CLAI | Portal Incluir", margem, altura - 10);
    pdf.text(`Página ${i} de ${paginas}`, largura - margem, altura - 10, { align: "right" });
  }
  return pdf;
}
