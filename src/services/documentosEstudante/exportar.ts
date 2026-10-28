import { estudantesService } from "../estudantesService";
import { planoAcaoService } from "../planoAcaoService";
import { perfilEstudanteService } from "../perfilEstudanteService";
import { necessidades, condicoes, atendimentos, acessibilidades } from "../../config/estudanteFormOptions";
import type { EstudanteResponse } from "../../types/estudante";
import type { PlanoAcaoResponse } from "../../types/planoAcao";
import modeloPlano from "../../assets/documentos/plano-acao-clai.docx?url";

export type TipoExportacao = "anamnese" | "plano" | "rai";
export type CampoDocumento = { titulo: string; valor: string };
const texto = (v: unknown): string => v === null || v === undefined || v === "" ? "Não informado" : typeof v === "boolean" ? v ? "Sim" : "Não" : String(v);
const data = (v: string | null) => v ? v.slice(0, 10).split("-").reverse().join("/") : "Não informada";
const opcoes = [...necessidades, ...condicoes, ...atendimentos, ...acessibilidades];
const lista = (v: string[]) => v.map(item => opcoes.find(o => o.value === item)?.label ?? item).join(", ") || "Nenhum item informado";

export function camposAnamnese(e: EstudanteResponse): CampoDocumento[] {
  return [
    ["Nome do(a) estudante", e.nomeCompleto], ["Matrícula", e.matricula], ["Curso", e.curso], ["Período de ingresso", e.periodoIngresso],
    ["Data de nascimento", data(e.dataNascimento)], ["Telefone", e.telefone], ["E-mail", e.email],
    ["Nome do responsável", e.nomeResponsavel], ["Telefone do responsável", e.telefoneResponsavel], ["E-mail do responsável", e.emailResponsavel],
    ["Possui necessidade específica", texto(e.possuiNecessidadeEspecifica)], ["Necessidades específicas", lista(e.necessidadesEspecificas)], ["Outra necessidade específica", e.outraNecessidadeEspecifica],
    ["Condições associadas", lista(e.condicoesAssociadas)], ["Outra condição associada", e.outraCondicaoAssociada], ["Atendimentos no campus", lista(e.atendimentosCampus)],
    ["Acessibilidade física", lista(e.acessibilidadesFisicas)], ["Outra acessibilidade física", e.outraAcessibilidadeFisica],
    ["Possui outra necessidade de atendimento", texto(e.possuiOutraNecessidadeAtendimento)], ["Descrição de outra necessidade de atendimento", e.descricaoOutraNecessidadeAtendimento],
  ].map(([titulo, valor]) => ({ titulo: titulo!, valor: texto(valor) }));
}

export function camposPlano(p: PlanoAcaoResponse): CampoDocumento[] {
  return [
    ["Nome do(a) estudante", p.estudanteNome], ["Matrícula", p.estudanteMatricula], ["Curso", p.estudanteCurso], ["Período letivo", p.periodoLetivo], ["Período de ingresso", p.estudantePeriodoIngresso],
    ["Data de nascimento", data(p.estudanteDataNascimento)], ["Telefone", p.estudanteTelefone], ["E-mail", p.estudanteEmail],
    ["Nome do responsável", p.nomeResponsavel], ["Grau de parentesco", p.grauParentesco], ["Telefone do responsável", p.telefoneResponsavel], ["E-mail do responsável", p.emailResponsavel],
    ["Há comorbidade relevante", `${texto(p.possuiComorbidade)}. ${p.comorbidades || ""}`], ["Faz uso de medicação de uso contínuo", `${texto(p.usaMedicacaoContinua)}. ${p.medicacoes || ""}`],
    ["Frequenta serviços de apoio (FUNAD, APAE, etc.)", `${texto(p.frequentaServicoApoio)}. ${p.servicosApoio || ""}`], ["Apresentou documentos comprobatórios", `${texto(p.possuiDocumentosComprobatorios)}. ${p.documentosComprobatorios || ""}`],
    ["IDENTIFICAÇÃO DA(S) NECESSIDADE(S) ESPECÍFICA(S)", p.necessidadesEspecificas], ["Considerações", p.consideracoes],
    ["RELATO SISTEMATIZADO DOS AVANÇOS, DIFICULDADES, POTENCIALIDADES DO(A) ESTUDANTE EM SEU PERCURSO EDUCACIONAL", p.avancosDificuldadesPotencialidades],
    ["PRINCIPAIS DEMANDAS IDENTIFICADAS NO CASO", p.principaisDemandas], ["DESCRIÇÃO DAS PROPOSTAS INICIAIS DE INTERVENÇÃO", p.propostasIntervencao],
  ].map(([titulo, valor]) => ({ titulo, valor: texto(valor) }));
}

/** Fill the retained Anexo II package. All non-document parts are preserved. */
export async function preencherModeloPlano(p: PlanoAcaoResponse): Promise<Uint8Array> {
  const { unzipSync, zipSync, strFromU8, strToU8 } = await import("fflate");
  const response = await fetch(modeloPlano);
  if (!response.ok) throw new Error("Não foi possível carregar o modelo do plano de ação.");
  const zip = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  const xml = new DOMParser().parseFromString(strFromU8(zip["word/document.xml"]), "application/xml");
  const body = xml.getElementsByTagNameNS(ns, "body")[0];
  const paragrafos = Array.from(body.getElementsByTagNameNS(ns, "p"));
  const conteudo = (el: Element) => Array.from(el.getElementsByTagNameNS(ns, "t")).map(t => t.textContent).join("");
  // Fail explicitly if the institution replaces the template with a different structure.
  if (paragrafos.length !== 87 || !conteudo(paragrafos[2]).includes("PLANO DE AÇÃO DA CLAI")) throw new Error("O modelo do plano mudou. Revise o mapeamento antes de exportar.");
  function inserir(indice: number, valor: string) {
    const paragrafo = paragrafos[indice];
    const run = xml.createElementNS(ns, "w:r");
    const propriedades = xml.createElementNS(ns, "w:rPr");
    const tamanho = xml.createElementNS(ns, "w:sz"); tamanho.setAttributeNS(ns, "w:val", "22"); propriedades.appendChild(tamanho); run.appendChild(propriedades);
    valor.split(/\r?\n/).forEach((linha, i) => { if (i) run.appendChild(xml.createElementNS(ns, "w:br")); const t = xml.createElementNS(ns, "w:t"); t.setAttribute("xml:space", "preserve"); t.textContent = linha; run.appendChild(t); });
    paragrafo.appendChild(run);
  }
  const campos = camposPlano(p);
  for (let i = 0; i < 12; i++) inserir(i + 3, ` ${campos[i].valor}`);
  const perguntas = [[15, p.possuiComorbidade, p.comorbidades], [18, p.usaMedicacaoContinua, p.medicacoes], [21, p.frequentaServicoApoio, p.servicosApoio], [24, p.possuiDocumentosComprobatorios, p.documentosComprobatorios]] as const;
  for (const [indice, resposta, detalhes] of perguntas) {
    const pergunta = conteudo(paragrafos[indice]).replace("Não (   )", `Não (${resposta === false ? " X " : "   "})`).replace("Sim (   )", `Sim (${resposta === true ? " X " : "   "})`);
    for (const t of Array.from(paragrafos[indice].getElementsByTagNameNS(ns, "t"))) t.textContent = "";
    inserir(indice, pergunta); inserir(indice + 1, texto(detalhes));
  }
  inserir(36, texto(p.necessidadesEspecificas)); inserir(38, texto(p.consideracoes)); inserir(50, texto(p.avancosDificuldadesPotencialidades)); inserir(62, texto(p.principaisDemandas)); inserir(73, texto(p.propostasIntervencao));
  inserir(85, "____________________________________________");
  // Fixed-height rows can clip long responses. Allow the original rows to grow.
  for (const altura of Array.from(xml.getElementsByTagNameNS(ns, "trHeight"))) altura.setAttributeNS(ns, "w:hRule", "atLeast");
  zip["word/document.xml"] = strToU8(new XMLSerializer().serializeToString(xml));
  return zipSync(zip);
}

function baixar(blob: Blob, nome: string) { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = nome; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000); }

export async function exportarDocumentoFluxo(estudanteId: number, tipo: TipoExportacao, formato: "pdf" | "docx", planoId?: number) {
  const estudante = await estudantesService.buscarPorId(estudanteId);
  const titulo = tipo === "plano" ? "PLANO DE AÇÃO DA CLAI" : tipo === "anamnese" ? "ANAMNESE DO ESTUDANTE" : "RELATÓRIO DE ACOMPANHAMENTO INDIVIDUAL (RAI)";
  let campos = camposAnamnese(estudante);
  let plano: PlanoAcaoResponse | undefined;
  if (tipo === "plano") {
    if (!planoId) throw new Error("Selecione um plano salvo para exportar.");
    plano = await planoAcaoService.buscarPorId(planoId);
    if (plano.estudanteId !== estudanteId) throw new Error("O plano não pertence a este estudante.");
    campos = camposPlano(plano);
  }
  if (tipo === "rai") {
    const dados = await perfilEstudanteService.consultar(estudanteId, new AbortController().signal);
    if (dados.falhas.planos || dados.falhas.peis || dados.falhas.adaptacoes) throw new Error("Atualize os registros antes de emitir o RAI. Algumas informações não puderam ser consultadas.");
    campos = [{ titulo: "Emissão", valor: new Date().toLocaleString("pt-BR") }, { titulo: "Identificação inicial e anamnese", valor: "Dados registrados até esta emissão." }, ...campos,
      ...dados.documentos.flatMap(d => [{ titulo: `${d.nome} • ${d.periodo} • ${d.status}`, valor: `Registro ${d.id}` }, ...d.detalhes]),
      ...dados.adaptacoes.map(a => ({ titulo: `Adaptação pedagógica • ${a.componenteCurricular}`, valor: [`Docente: ${a.professorNome}`, `Objetivo geral: ${texto(a.objetivoGeral)}`, `Objetivos específicos: ${texto(a.objetivosEspecificos)}`, `Conteúdos: ${texto(a.conteudosProgramaticos)}`, `Metodologia: ${texto(a.metodologia)}`, `Avaliação: ${texto(a.avaliacao)}`].join("\n") })),
      ...dados.historico.map(h => ({ titulo: `Histórico • ${h.operacao} • ${h.tabela}`, valor: new Date(h.data).toLocaleString("pt-BR") })),
      ...(dados.falhas.historico ? [{ titulo: "Histórico de alterações", valor: "Indisponível nesta emissão. Este relatório reúne os documentos e dados atuais do acompanhamento." }] : [])];
  }
  const nome = `${tipo}-${estudante.matricula.replace(/[^a-zA-Z0-9_-]/g, "_")}${plano ? `-${plano.id}` : ""}.${formato}`;
  if (formato === "docx" && plano) { const arquivo = await preencherModeloPlano(plano); baixar(new Blob([new Uint8Array(arquivo)], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), nome); return; }
  if (formato === "docx") {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");
    const doc = new Document({ sections: [{ properties: {}, children: [new Paragraph({ text: titulo, heading: HeadingLevel.TITLE }), ...campos.flatMap(c => [new Paragraph({ children: [new TextRun({ text: c.titulo, bold: true })], spacing: { before: 160, after: 80 } }), ...c.valor.split("\n").map(text => new Paragraph({ text }))]), new Paragraph({ text: "Assinatura do(a) responsável: __________________________________________", spacing: { before: 600 } }), new Paragraph("Data: ____/____/________") ] }] });
    baixar(await Packer.toBlob(doc), nome); return;
  }
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const pdf = new jsPDF();
  pdf.setFont("helvetica", "bold"); pdf.setFontSize(12);
  let y = 20;
  if (tipo === "plano") { pdf.text("ANEXO II", 105, y, { align: "center" }); y += 8; }
  const linhas = pdf.splitTextToSize(titulo, 158); pdf.text(linhas, 105, y, { align: "center" }); y += linhas.length * 6 + 5;
  autoTable(pdf, { startY: y, margin: { left: 30, right: 30, bottom: 20 }, body: campos.map(c => [`${c.titulo}\n\n${c.valor}`]), theme: "grid", styles: { font: "helvetica", fontSize: 10, textColor: 0, lineColor: 0, lineWidth: 0.2, cellPadding: 3, overflow: "linebreak" }, rowPageBreak: "auto" });
  const ultima = pdf as typeof pdf & { lastAutoTable: { finalY: number } };
  y = ultima.lastAutoTable.finalY + 15;
  if (y + 35 > 277) { pdf.addPage(); y = 25; }
  pdf.setFont("helvetica", "normal"); pdf.setFontSize(10);
  pdf.text(tipo === "plano" ? "Assinatura do(a) coordenador(a) da COAPNE:" : "Assinatura do(a) responsável:", 30, y);
  pdf.line(30, y + 16, 165, y + 16); pdf.text("Data: ____/____/________", 30, y + 28);
  baixar(pdf.output("blob"), nome);
}
