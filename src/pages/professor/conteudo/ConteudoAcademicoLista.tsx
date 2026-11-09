import Button from "../../../components/common/Button";
import { formatarDataDocumento } from "../../../config/documentos";
import type { ConteudoAcademicoResponse } from "../../../types/conteudoAcademico";
import { tiposConteudo } from "./apresentacao";

export default function ConteudoAcademicoLista({ materiais, onVisualizar, onEditar, onExcluir, onFavorito, ocupado = false }: {
  materiais: ConteudoAcademicoResponse[];
  onVisualizar: (id: number) => void;
  onEditar?: (id: number) => void;
  onExcluir?: (id: number) => void;
  onFavorito?: (id: number) => void;
  ocupado?: boolean;
}) {
  return <ul className="grid gap-4 md:grid-cols-2">
    {materiais.map(material => <li key={material.id} className={`flex min-w-0 flex-col gap-4 rounded-2xl border bg-white p-5 sm:p-6 ${material.favorito ? "border-amber-300 ring-1 ring-amber-100" : "border-[#dce5dc]"}`}>
      <div><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">{tiposConteudo[material.tipo]}</span>
        {onFavorito && <button type="button" disabled={ocupado} aria-pressed={!!material.favorito} aria-label={`${material.favorito ? "Remover dos favoritos" : "Favoritar"}: ${material.titulo}`} title={material.favorito ? "Remover dos favoritos" : "Favoritar material"} onClick={() => onFavorito(material.id)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-amber-600 hover:bg-amber-50 focus-visible:outline-2 focus-visible:outline-amber-600 disabled:opacity-50"><svg aria-hidden="true" viewBox="0 0 24 24" fill={material.favorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9Z" strokeLinejoin="round" /></svg></button>}
      </div>
        <h3 className="mt-3 break-words text-lg font-bold text-primary">{material.titulo}</h3>
        <p className="mt-1 break-words text-sm font-semibold text-slate-600">{material.componenteCurricular}</p>
      </div>
      <p className="line-clamp-3 break-words text-sm leading-relaxed text-slate-600">{material.descricao}</p>
      <div className="mt-auto space-y-2 text-xs text-slate-500">
        <p className="break-words">{material.estudanteId === null ? "Material reutilizável · Sem estudante associado" : `${material.estudanteNome} · ${material.estudanteMatricula}`}</p>
        <p>{material.arquivoNome ? "Arquivo anexado" : material.link ? "Link de apoio" : "Conteúdo textual"} · Atualizado em {formatarDataDocumento(material.dataAtualizacao)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={ocupado} onClick={() => onVisualizar(material.id)} aria-label={`Visualizar material: ${material.titulo}`}>Visualizar material</Button>
        {onEditar && <Button variant="secondary" disabled={ocupado} onClick={() => onEditar(material.id)} aria-label={`Editar material: ${material.titulo}`}>Editar</Button>}
        {onExcluir && <button type="button" disabled={ocupado} onClick={() => onExcluir(material.id)} aria-label={`Excluir material: ${material.titulo}`} className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700 disabled:opacity-50">Excluir</button>}
      </div>
    </li>)}
  </ul>;
}
