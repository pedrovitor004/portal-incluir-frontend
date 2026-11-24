import type { Documento } from "../../../../types/documento";
import { formatarDataDocumento } from "../../../../config/documentos";

export default function DocumentDetails({ documento }: { documento: Documento }) {
  const identificacao = [
    ["Estudante", documento.estudanteNome], ["Matrícula", documento.estudanteMatricula],
    ["Curso", documento.curso], ["Período letivo", documento.periodo],
    ["Data de registro", formatarDataDocumento(documento.dataRegistro)],
    ["Última atualização", formatarDataDocumento(documento.dataAtualizacao)], ["Status", documento.status],
  ];
  return <div className="space-y-6">
    <dl className="grid gap-4 sm:grid-cols-2">{identificacao.map(([titulo, valor]) => <div key={titulo}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</dt><dd className="mt-1 break-words font-medium text-slate-800">{valor || "Não informado"}</dd></div>)}</dl>
    <dl className="space-y-5 border-t border-slate-100 pt-5">{documento.detalhes.map((campo, index) => <div key={`${campo.titulo}-${index}`}><dt className="font-semibold text-slate-800">{campo.titulo}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-600">{campo.valor}</dd></div>)}</dl>
  </div>;
}
