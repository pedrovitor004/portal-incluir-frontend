import type { ComponentType } from "react";
import type { PerfilUsuario } from "../../../types/auth";
import { accessProfiles } from "../../../config/access";
import { getNavigation } from "../../../config/navigation";
import { HomeIcon, StudentsIcon, ClipboardIcon, DocumentIcon, ChartIcon, UsersIcon, ShieldIcon } from "../../icons/AppIcons";

export type MenuItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  groupOnly?: boolean;
  children?: MenuItem[];
};

const icons = { home: HomeIcon, students: StudentsIcon, clipboard: ClipboardIcon, document: DocumentIcon, chart: ChartIcon, users: UsersIcon, shield: ShieldIcon };

export function getMenuItems(perfil: PerfilUsuario): MenuItem[] {
  const basePath = accessProfiles[perfil].basePath;
  return getNavigation(perfil).map(item => ({
    groupOnly: item.groupOnly, label: item.label, path: `${basePath}/${item.slug}`, icon: icons[item.icon],
    children: item.children?.map(child => ({
      label: child.label, path: `${basePath}/${child.slug}`, icon: icons[child.icon],
    })),
  }));
}
