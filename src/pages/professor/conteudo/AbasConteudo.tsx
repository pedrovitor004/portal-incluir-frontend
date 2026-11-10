import ConteudoIcone from "./ConteudoIcone";
import { coresConteudo } from "./apresentacao";
import { useId } from "react";
import type { ConteudoAcademicoResponse, TipoConteudoAcademico } from "../../../types/conteudoAcademico";

export type AbaConteudo = "" | TipoConteudoAcademico;
const abas: { valor: AbaConteudo; titulo: string }[] = [
  { valor: "", titulo: "Visão geral" }, { valor: "ATIVIDADE", titulo: "Atividades" },
  { valor: "PROVA", titulo: "Provas" }, { valor: "MATERIAL_APOIO", titulo: "Material de apoio" }, { valor: "OUTRO", titulo: "Outros" },
];

export default function AbasConteudo({ aba, onChange, materiais, carregando, painelId }: {
  aba: AbaConteudo; onChange: (aba: AbaConteudo) => void; materiais: ConteudoAcademicoResponse[]; carregando: boolean; painelId: string;
}) {
  const id = useId();
  return <div role="tablist" aria-label="Tipos de conteúdo acadêmico" className="flex flex-wrap gap-2 rounded-2xl border border-[#dce5dc] bg-white p-2">
    {abas.map((item, index) => <button key={item.valor} type="button" role="tab" id={`${id}-${index}`} aria-selected={aba === item.valor} aria-controls={painelId} tabIndex={aba === item.valor ? 0 : -1}
      onClick={() => onChange(item.valor)} onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const destino = event.key === "Home" ? 0 : event.key === "End" ? abas.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + abas.length) % abas.length;
        onChange(abas[destino].valor); document.getElementById(`${id}-${destino}`)?.focus();
      }}
      className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${aba === item.valor ? (item.valor ? coresConteudo[item.valor] : "bg-green-50 text-green-800") + " ring-1 ring-inset ring-current" : "text-slate-600 hover:bg-slate-50"}`}>
      <ConteudoIcone nome={item.valor || "geral"} />{item.titulo}{!carregando && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.valor ? materiais.filter(m => m.tipo === item.valor).length : materiais.length}</span>}
    </button>)}
  </div>;
}
