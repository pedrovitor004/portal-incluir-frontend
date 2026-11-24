import type { ConteudoAcademicoRequest, ConteudoAcademicoResponse, TipoConteudoAcademico } from "../../../types/conteudoAcademico";
import { linkSeguro } from "./apresentacao";

export type OrigemConteudo = "texto" | "link" | "arquivo";
export type FormularioConteudo = {
  titulo: string; tipo: TipoConteudoAcademico; componenteCurricular: string;
  descricao: string; orientacoesAdaptacao: string; link: string; estudanteId: string;
};
export const limitesConteudo = { titulo: 150, componenteCurricular: 150, descricao: 5000, orientacoesAdaptacao: 5000, link: 2000 };
export const formatosArquivo = ".pdf,.docx,.txt,.png,.jpg,.jpeg";

export function formularioInicial(material?: ConteudoAcademicoResponse): FormularioConteudo {
  return { titulo: material?.titulo ?? "", tipo: material?.tipo ?? "ATIVIDADE", componenteCurricular: material?.componenteCurricular ?? "",
    descricao: material?.descricao ?? "", orientacoesAdaptacao: material?.orientacoesAdaptacao ?? "", link: material?.link ?? "", estudanteId: material?.estudanteId?.toString() ?? "" };
}

export function validarFormulario(form: FormularioConteudo, origem: OrigemConteudo, arquivo: File | null, original?: ConteudoAcademicoResponse) {
  const erros: Record<string, string> = {};
  for (const campo of ["titulo", "componenteCurricular", "descricao"] as const) if (!form[campo].trim()) erros[campo] = "Preencha este campo.";
  for (const [campo, limite] of Object.entries(limitesConteudo)) {
    if (campo === "link" && origem !== "link") continue;
    if (form[campo as keyof typeof limitesConteudo].trim().length > limite) erros[campo] = `Use no máximo ${limite} caracteres.`;
  }
  if (!["PROVA", "ATIVIDADE", "MATERIAL_APOIO", "OUTRO"].includes(form.tipo)) erros.tipo = "Selecione um tipo válido.";
  if (origem === "link" && !linkSeguro(form.link.trim())) erros.link = "Informe um link HTTP ou HTTPS válido, sem credenciais.";
  if (origem === "arquivo" && !arquivo && !original?.arquivoNome) erros.arquivo = "Selecione um arquivo.";
  if (original?.arquivoNome && origem !== "arquivo") erros.arquivo = "Remova o anexo atual antes de alterar a origem do material.";
  if (arquivo && origem === "arquivo") {
    if (!/\.(pdf|docx|txt|png|jpe?g)$/i.test(arquivo.name)) erros.arquivo = "Use PDF, DOCX, TXT, PNG ou JPEG.";
    else if (!arquivo.size) erros.arquivo = "O arquivo não pode estar vazio.";
    else if (arquivo.size > 10 * 1024 * 1024) erros.arquivo = "O arquivo deve ter no máximo 10 MB.";
    else if (arquivo.name.length > 180) erros.arquivo = "O nome do arquivo deve ter no máximo 180 caracteres.";
  }
  return erros;
}

export function prepararRequest(form: FormularioConteudo, origem: OrigemConteudo, original?: ConteudoAcademicoResponse): ConteudoAcademicoRequest {
  return { titulo: form.titulo.trim(), tipo: form.tipo, componenteCurricular: form.componenteCurricular.trim(),
    descricao: form.descricao.trim(), orientacoesAdaptacao: form.orientacoesAdaptacao.trim() || null,
    link: origem === "link" ? form.link.trim() : null,
    estudanteId: original ? original.estudanteId : form.estudanteId ? Number(form.estudanteId) : null };
}
