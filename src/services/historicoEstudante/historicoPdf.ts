import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { dataHistorico, type HistoricoEstudanteDocumento } from "./historicoModel";

export type MarcasEstudante = { ifpb?: string; clai?: string; portal?: string };
export function adicionarMarcas(pdf: jsPDF, marcas: MarcasEstudante, corLinha: [number, number, number] = [40, 117, 53]) {
  const imagem = (data: string | undefined, x: number, y: number, w: number, h: number) => {
    if (!data) return;
    const info = pdf.getImageProperties(data); const escala = Math.min(w / info.width, h / info.height);
    pdf.addImage(data, "PNG", x + (w - info.width * escala) / 2, y + (h - info.height * escala) / 2, info.width * escala, info.height * escala);
  };
  imagem(marcas.ifpb, 18, 10, 24, 25); imagem(marcas.clai, 92, 10, 25, 25); imagem(marcas.portal, 147, 12, 45, 21);
  pdf.setDrawColor(...corLinha); pdf.setLineWidth(.5); pdf.line(18, 39, 192, 39);
}
function textoPdf(value: string): string { return value.replace(/[\u2010-\u2015]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/→/g, "->").replace(/✓/g, "Sim"); }
export function criarPdfHistorico(modelo: HistoricoEstudanteDocumento, marcas: MarcasEstudante = {}) {
  const pdf = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait", compress: true });
  pdf.setProperties({ title: `Histórico do estudante - ${modelo.nome}`, author: modelo.emitidoPor, creator: "Portal Incluir", subject: "Histórico consolidado de acompanhamento do estudante" });
  const verde: [number, number, number] = [40, 117, 53];
  const cabecalhos = new Set<number>();
  const header = () => {
    const pagina = pdf.getCurrentPageInfo().pageNumber; if (cabecalhos.has(pagina)) return; cabecalhos.add(pagina);
    adicionarMarcas(pdf, marcas);
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...verde); pdf.text("HISTÓRICO DO ESTUDANTE", 18, 46);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(80, 95, 84);
    pdf.text(pdf.splitTextToSize(textoPdf(`${modelo.nome} | Matrícula ${modelo.matricula}`), 174), 18, 52);
  };
  header(); let y = 66;
  const novaPagina = () => { pdf.addPage(); header(); y = 66; };
  const titulo = (texto: string) => {
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(10);
    const linhas = pdf.splitTextToSize(textoPdf(texto), 170) as string[];
    if (y + linhas.length * 4.5 + 25 > 274) novaPagina();
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...verde);
    pdf.text(linhas, 18, y); y += linhas.length * 4.5 + 3;
  };
  const texto = (valor: string) => {
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(75, 86, 79);
    const linhas = pdf.splitTextToSize(textoPdf(valor), 174) as string[];
    for (const linha of linhas) { if (y + 4 > 274) novaPagina(); pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(75, 86, 79); pdf.text(linha, 18, y); y += 4; }
    y += 3;
  };
  function tabela(cabecalho: string[], corpo: string[][], larguras: number[]) {
    if (!corpo.length) { texto("Nenhum registro encontrado nesta consulta."); return; }
    autoTable(pdf, { head: [cabecalho], body: corpo.map(l => l.map(textoPdf)), startY: y,
      margin: { top: 65, bottom: 23, left: 18, right: 18 },
      styles: { font: "helvetica", fontSize: 8, cellPadding: 2.5, overflow: "linebreak", valign: "top", textColor: [51, 65, 55], lineColor: [222, 232, 223], lineWidth: .1 },
      headStyles: { fillColor: verde, textColor: [255, 255, 255], fontStyle: "bold" }, alternateRowStyles: { fillColor: [247, 250, 246] },
      columnStyles: Object.fromEntries(larguras.map((largura, i) => [i, { cellWidth: largura }])),
      didDrawPage: () => { if (pdf.getCurrentPageInfo().pageNumber > 1) header(); },
    });
    y = (pdf as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 9;
  }
  titulo("Emissão do documento");
  tabela(["Informação", "Descrição"], [["Emitido em", dataHistorico(modelo.emitidoEm)], ["Emitido por", modelo.emitidoPor], ["Identificação", modelo.nome], ["Matrícula", modelo.matricula]], [48, 126]);
  texto("Este documento reúne os registros disponíveis do acompanhamento do estudante na data da emissão. Datas ou horários ausentes são identificados como não informados.");
  for (const secao of modelo.secoes) { titulo(secao.titulo); tabela(["Informação", "Registro"], secao.campos, [52, 122]); }
  titulo("Linha do tempo acumulada"); tabela(["Data e horário", "Movimentação", "Descrição"], modelo.movimentacoes, [43, 49, 82]);
  titulo("Histórico detalhado de alterações - Antes e Depois");
  if (!modelo.alteracoes.length) texto("Nenhuma alteração encontrada para este estudante nesta consulta.");
  for (const alteracao of modelo.alteracoes) {
    titulo(alteracao.titulo); texto(`Data e horário: ${alteracao.data}`); texto(alteracao.observacao);
    tabela(["Campo", "Antes", "Depois"], alteracao.campos, [42, 66, 66]);
  }
  const total = pdf.getNumberOfPages();
  for (let pagina = 1; pagina <= total; pagina++) {
    pdf.setPage(pagina); pdf.setDrawColor(220, 230, 221); pdf.setLineWidth(.2); pdf.line(18, 279, 192, 279);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(95, 107, 99);
    pdf.text("IFPB Campus Monteiro | CLAI | Portal Incluir", 18, 284);
    pdf.text(`Página ${pagina} de ${total}`, 192, 284, { align: "right" });
    pdf.text("Histórico do estudante - documento de consulta", 18, 289);
  }
  return pdf;
}
