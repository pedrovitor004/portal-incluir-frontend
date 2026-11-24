import { jsPDF } from "jspdf";
import type { EstudanteResponse } from "../../types/estudante";
import { adicionarMarcas, type MarcasEstudante } from "./historicoPdf";

export type DeclaracaoEstudante = { estudante: EstudanteResponse; periodo: string; emitidoEm: string; emitidoPor: string };
export function criarPdfDeclaracao(dados: DeclaracaoEstudante, marcas: MarcasEstudante = {}) {
  if (!dados.periodo.trim()) throw new Error("Informe o período do acompanhamento.");
  if (dados.periodo.trim().length > 60) throw new Error("Informe o período com até 60 caracteres.");
  const pdf = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait", compress: true });
  pdf.setProperties({ title: `Declaração de acompanhamento - ${dados.estudante.nomeCompleto}`, author: "Coordenação Local de Acessibilidade e Inclusão", creator: "Portal Incluir", subject: "Declaração de acompanhamento do estudante - IFPB Campus Monteiro" });
  adicionarMarcas(pdf, marcas, [0, 0, 0]);
  pdf.setFont("helvetica", "bold"); pdf.setTextColor(0, 0, 0); pdf.setFontSize(10);
  pdf.text("INSTITUTO FEDERAL DA PARAÍBA - CAMPUS MONTEIRO", 105, 49, { align: "center" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(0, 0, 0);
  pdf.text("Coordenação Local de Acessibilidade e Inclusão", 105, 55, { align: "center" });
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(21); pdf.setTextColor(0, 0, 0);
  pdf.text("DECLARAÇÃO", 105, 80, { align: "center" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(12); pdf.setTextColor(0, 0, 0);
  const texto = `Declaramos, para os devidos fins, que ${dados.estudante.nomeCompleto}, matrícula ${dados.estudante.matricula}, estudante do curso de ${dados.estudante.curso}, no período ${dados.periodo.trim()}, ${dados.estudante.ativo && !dados.estudante.concluido ? "é" : "foi"} devidamente acompanhado(a) pela Coordenação Local de Acessibilidade e Inclusão do Instituto Federal da Paraíba, Campus Monteiro.`;
  const linhas = pdf.splitTextToSize(texto, 166) as string[];
  pdf.text(linhas, 22, 107, { align: "justify", maxWidth: 166, lineHeightFactor: 1.8 });
  const fimTexto = 107 + linhas.length * 7.6;
  const data = new Date(dados.emitidoEm).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "numeric", month: "long", year: "numeric" });
  pdf.setFontSize(11); pdf.text(`Monteiro - PB, ${data}.`, 188, fimTexto + 14, { align: "right" });
  const assinatura = Math.max(218, fimTexto + 55);
  pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(.35); pdf.line(45, assinatura, 165, assinatura);
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(0, 0, 0);
  pdf.text("Coordenação Local de Acessibilidade e Inclusão", 105, assinatura + 7, { align: "center" });
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(0, 0, 0);
  pdf.text("IFPB - Campus Monteiro", 105, assinatura + 13, { align: "center" });
  pdf.text("Assinatura e identificação do(a) responsável", 105, assinatura + 20, { align: "center" });
  pdf.setDrawColor(0, 0, 0); pdf.line(18, 275, 192, 275);
  pdf.setFontSize(7); pdf.setTextColor(0, 0, 0);
  pdf.text("Declaração emitida pelo Portal Incluir. Validade mediante assinatura da coordenação responsável.", 105, 281, { align: "center" });
  pdf.text(`Emitido em ${new Date(dados.emitidoEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })} (Brasília)`, 105, 286, { align: "center" });
  return pdf;
}
