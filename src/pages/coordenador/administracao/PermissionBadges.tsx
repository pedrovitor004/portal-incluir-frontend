import type { Permission } from "../../../config/access";
import { permissionCatalog } from "../../../config/permissionCatalog";

function cores(codigo: Permission) {
  if (codigo.startsWith("usuarios")) return "border-sky-200/70 bg-sky-50 text-sky-800 hover:bg-sky-100";
  if (codigo.startsWith("permissoes") || codigo === "auditorias") return "border-indigo-200/70 bg-indigo-50 text-indigo-800 hover:bg-indigo-100";
  if (codigo === "sensivel.consultar") return "border-rose-200/70 bg-rose-50 text-rose-800 hover:bg-rose-100";
  if (codigo.startsWith("documentos") || codigo.startsWith("pei")) return "border-amber-200/70 bg-amber-50 text-amber-800 hover:bg-amber-100";
  if (codigo.startsWith("pedagogico") || codigo === "academico.gerar") return "border-violet-200/70 bg-violet-50 text-violet-800 hover:bg-violet-100";
  if (codigo.startsWith("suporte") || codigo === "relatorios") return "border-teal-200/70 bg-teal-50 text-teal-800 hover:bg-teal-100";
  return "border-green-200/70 bg-green-50 text-green-800 hover:bg-green-100";
}

export default function PermissionBadges({ permissoes, previa, onSelect }: { permissoes: Permission[]; previa: boolean; onSelect: (codigo: Permission) => void }) {
  const liberadas = permissionCatalog.filter(permissao => permissoes.includes(permissao.codigo));
  return <div className="mt-5 border-t border-slate-100 pt-5">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{previa ? "Prévia dos acessos após salvar" : "Acessos permitidos"}</h3><p className="text-xs text-slate-400">Clique em um acesso para consultar os detalhes na tabela.</p></div>
    {liberadas.length ? <ul aria-label="Permissões permitidas do usuário" className="flex flex-wrap gap-2">{liberadas.map(permissao => <li key={permissao.codigo}><button type="button" onClick={() => onSelect(permissao.codigo)} title={`${permissao.descricao} · ${permissao.menu}`} className={`inline-flex max-w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold leading-5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${cores(permissao.codigo)}`}><permissao.icon className="h-4 w-4 shrink-0" /><span>{permissao.nome}</span></button></li>)}</ul> : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Nenhuma permissão liberada para esta conta.</p>}
  </div>;
}
