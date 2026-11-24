import { canAccess } from "../../config/access";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoClai from "../../assets/logos/logo-clai.png";
import logoPortal from "../../assets/logos/logo-portal.png";
import { perfilEstudanteService } from "../perfilEstudanteService";
import { estudantesService } from "../estudantesService";
import { userSession } from "../sessionStorage";
import { montarHistoricoEstudante } from "./historicoModel";

async function imagem(url: string, verde = false): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível carregar as logomarcas do documento.");
  const blob = await response.blob();
  if (!verde) return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); });
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas"); canvas.width = bitmap.width; canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Não foi possível preparar a logomarca do portal.");
  ctx.drawImage(bitmap, 0, 0); bitmap.close(); ctx.globalCompositeOperation = "source-in"; ctx.fillStyle = "#287535"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}
function contaAutorizada() {
  const conta = userSession.read();
  if (!conta || !canAccess(conta, "documentos")) throw new Error("Entre com sua conta da coordenação para gerar o documento.");
  return conta;
}
async function marcas() { const [ifpb, clai, portal] = await Promise.all([imagem(logoIfpb), imagem(logoClai), imagem(logoPortal, true)]); return { ifpb, clai, portal }; }
function baixar(blob: Blob, nome: string, contaId: number, signal: AbortSignal) {
  signal.throwIfAborted();
  if (contaAutorizada().id !== contaId) throw new Error("A conta conectada mudou. Confira seu acesso antes de gerar o documento.");
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = nome;
  document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
function nomeArquivo(prefixo: string, matricula: string, data: string) { return `${prefixo}-${matricula.replace(/[^a-zA-Z0-9_-]/g, "_")}-${data.slice(0, 10)}.pdf`; }
export async function exportarHistoricoEstudante(id: number, signal: AbortSignal) {
  const conta = contaAutorizada();
  const dados = await perfilEstudanteService.consultar(id, signal); signal.throwIfAborted();
  const emitidoEm = new Date().toISOString(); const modelo = montarHistoricoEstudante(dados, emitidoEm, conta.nome);
  const [{ criarPdfHistorico }, identidade] = await Promise.all([import("./historicoPdf"), marcas()]); signal.throwIfAborted();
  const pdf = criarPdfHistorico(modelo, identidade);
  baixar(pdf.output("blob"), nomeArquivo("historico-estudante", dados.estudante.matricula, emitidoEm), conta.id, signal);
}
export async function exportarDeclaracaoEstudante(id: number, periodo: string, signal: AbortSignal) {
  const conta = contaAutorizada(); const estudante = await estudantesService.buscarPorId(id); signal.throwIfAborted();
  const [{ criarPdfDeclaracao }, identidade] = await Promise.all([import("./declaracaoPdf"), marcas()]); signal.throwIfAborted();
  const emitidoEm = new Date().toISOString(); const pdf = criarPdfDeclaracao({ estudante, periodo, emitidoEm, emitidoPor: conta.nome }, identidade);
  baixar(pdf.output("blob"), nomeArquivo("declaracao-acompanhamento", estudante.matricula, emitidoEm), conta.id, signal);
}
