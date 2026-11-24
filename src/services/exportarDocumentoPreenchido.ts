import type { Documento } from "../types/documento";
import { formatarDataDocumento } from "../config/documentos";

type Formato = "pdf" | "docx";

const assinaturasPei = [
  "Assinatura do Setor Pedagógico (responsável):",
  "Assinatura da Assistência Estudantil (responsável):",
  "Assinatura do Docente:",
  "Assinatura da CLAI:",
  "Assinatura do(a) Coordenador(a) de Curso:",
  "Assinatura do Estudante ou Responsável:",
];

export async function gerarArquivoDocumento(documento: Documento, formato: Formato): Promise<Blob> {
  if (documento.tipo !== "PEA" && documento.tipo !== "PEI") throw new Error("Exportação indisponível para este tipo de documento.");
  const titulo = documento.tipo === "PEA" ? "PLANO DE ENSINO ADAPTADO (PEA)" : "PLANO EDUCACIONAL INDIVIDUALIZADO (PEI)";
  const campos = [
    { titulo: "Estudante", valor: documento.estudanteNome },
    { titulo: "Matrícula", valor: documento.estudanteMatricula },
    { titulo: "Curso", valor: documento.curso },
    { titulo: "Período letivo", valor: documento.periodo },
    { titulo: "Data de registro", valor: formatarDataDocumento(documento.dataRegistro) },
    { titulo: "Última atualização", valor: formatarDataDocumento(documento.dataAtualizacao) },
    { titulo: "Status", valor: documento.status },
    ...documento.detalhes,
  ].map(campo => ({ ...campo, valor: campo.valor || "Não informado" }));
  if (formato === "docx") {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType, TabStopPosition, LeaderType } = await import("docx");
    const doc = new Document({ sections: [{ properties: {}, children: [
      ...(documento.tipo === "PEI" ? [new Paragraph({ text: "ANEXO III", alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 160 } })] : []),
      new Paragraph({ text: titulo, heading: HeadingLevel.TITLE }),
      ...campos.flatMap(campo => [
        new Paragraph({ children: [new TextRun({ text: campo.titulo, bold: true })], spacing: { before: 160, after: 80 } }),
        ...campo.valor.split(/\r?\n/).map(text => new Paragraph({ text })),
      ]),
      ...(documento.tipo === "PEI" ? assinaturasPei.map((assinatura, index) => new Paragraph({
        children: [new TextRun({ text: assinatura, bold: true, size: 20 }), new TextRun("\t")],
        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX, leader: LeaderType.UNDERSCORE }],
        keepNext: index < assinaturasPei.length - 1,
        keepLines: true,
        spacing: { before: index === 0 ? 400 : 240, after: 80 },
      })) : []),
    ] }] });
    return Packer.toBlob(doc);
  }
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const pdf = new jsPDF();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  let inicio = 20;
  if (documento.tipo === "PEI") {
    pdf.text("ANEXO III", 105, inicio, { align: "center" });
    inicio += 8;
  }
  const linhas = pdf.splitTextToSize(titulo, 158);
  pdf.text(linhas, 105, inicio, { align: "center" });
  autoTable(pdf, {
    startY: inicio + 5 + linhas.length * 6,
    margin: { left: 30, right: 30, bottom: 20 },
    body: campos.map(campo => [`${campo.titulo}\n\n${campo.valor}`]),
    theme: "grid",
    styles: { font: "helvetica", fontSize: 10, textColor: 0, lineColor: 0, lineWidth: 0.2, cellPadding: 3, overflow: "linebreak" },
    rowPageBreak: "auto",
  });
  if (documento.tipo === "PEI") {
    const fimTabela = (pdf as typeof pdf & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
    const limite = pdf.internal.pageSize.getHeight() - 25;
    const altura = (assinaturasPei.length - 1) * 15;
    let y = fimTabela + 15;
    if (y + altura > limite) {
      pdf.addPage();
      y = 25;
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setLineWidth(0.2);
    assinaturasPei.forEach(assinatura => {
      pdf.text(assinatura, 30, y);
      pdf.line(30 + pdf.getTextWidth(assinatura) + 2, y + 1, 180, y + 1);
      y += 15;
    });
  }
  return pdf.output("blob");
}

export async function exportarDocumentoPreenchido(documento: Documento, formato: Formato) {
  const blob = await gerarArquivoDocumento(documento, formato);
  const matricula = documento.estudanteMatricula.replace(/[^a-zA-Z0-9_-]/g, "_");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${documento.tipo.toLowerCase()}-${matricula}-${documento.id}.${formato}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
