import { Link, useLocation } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { getNavigationGroups, matchesNavigationPath } from "./navigationGroups";

export default function SectionNavigation() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  if (!usuario) return null;
  const group = getNavigationGroups(usuario).find(group => group.tabs.some(tab => matchesNavigationPath(pathname, tab.path)));
  if (!group || group.tabs.length < 2) return null;
  return <nav aria-label={`Navegação de ${group.item.label}`} className="mx-auto mb-6 w-full max-w-[1600px] rounded-2xl border border-[#dce5dc] bg-white p-2 shadow-[0_4px_20px_rgba(24,91,50,0.04)]">
    <div className="flex flex-wrap gap-1.5">{group.tabs.map(tab => {
      const active = matchesNavigationPath(pathname, tab.path);
      const Icon = tab.icon;
      return <Link key={tab.path} to={tab.path} aria-current={active ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 ${active ? "bg-green-50 text-green-900 ring-1 ring-inset ring-green-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon className="h-4 w-4 shrink-0" /><span>{tab.label}</span></Link>;
    })}</div>
  </nav>;
}
