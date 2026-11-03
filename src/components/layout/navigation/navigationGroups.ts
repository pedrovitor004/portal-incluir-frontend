import { getMenuItems, type MenuItem } from "./menu";
import type { PerfilUsuario, Usuario } from "../../../types/auth";

export type NavigationGroup = { item: MenuItem; tabs: MenuItem[] };

export function getNavigationGroups(conta: PerfilUsuario | Usuario): NavigationGroup[] {
  return getMenuItems(conta).map(item => {
    if ((item.children?.length ?? 0) <= 2) return { item, tabs: [] };
    const tabs = (item.groupOnly ? item.children! : [item, ...item.children!])
      .map(tab => ({ ...tab, children: undefined, groupOnly: false }));
    return { item: { ...item, path: tabs[0].path, children: undefined, groupOnly: false, matchPaths: tabs.map(tab => tab.path) }, tabs };
  });
}

export function matchesNavigationPath(currentPath: string, path: string) {
  return currentPath === path || currentPath.startsWith(`${path}/`);
}
