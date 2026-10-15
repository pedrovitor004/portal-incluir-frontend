import { useId, useState } from "react";
import { Link } from "react-router";
import MenuIconBadge from "./MenuIconBadge";
import type { MenuItem } from "./menu";

type Props = { item: MenuItem; currentPath: string; onNavigate: () => void };

export default function SidebarMenuItem({ item, currentPath, onNavigate }: Props) {
  const controlsId = useId();
  const [open, setOpen] = useState<boolean>();
  const isActive = (path: string) => currentPath === path || currentPath.startsWith(`${path}/`);
  const active = isActive(item.path);
  const childActive = item.children?.some(child => isActive(child.path));
  const expanded = open ?? Boolean(childActive);
  return (
    <div>
      <div className={`flex items-center rounded-md transition-colors ${active || childActive ? "bg-[#58e16d] text-[#153d20]" : "text-white hover:bg-white/10"}`}>
        <Link
          to={item.path}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <MenuIconBadge item={item} />
          <span>{item.label}</span>
        </Link>
        {Boolean(item.children?.length) && (
          <button
            type="button"
            aria-label={`${expanded ? "Recolher" : "Expandir"} subitens de ${item.label}`}
            aria-expanded={expanded}
            aria-controls={controlsId}
            onClick={() => setOpen(!expanded)}
            className="mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}>
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
      {Boolean(item.children?.length) && (
        <ul id={controlsId} hidden={!expanded} aria-label={`Submenu de ${item.label}`} className="ml-5 mt-1 space-y-1 pl-2">
          {item.children?.map(child => (
            <li key={child.path}>
              <Link
                to={child.path}
                onClick={onNavigate}
                aria-current={isActive(child.path) ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isActive(child.path) ? "bg-[#58e16d] text-[#153d20]" : "text-white hover:bg-white/10"}`}
              >
                <MenuIconBadge item={child} />
                <span>{child.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
