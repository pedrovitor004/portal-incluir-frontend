import type { ComponentType } from "react";
import type { PerfilUsuario, Usuario } from "../../../types/auth";
import { accessProfiles } from "../../../config/access";
import { getNavigation } from "../../../config/navigation";
import { HomeIcon, StudentsIcon, ClipboardIcon, DocumentIcon, ChartIcon, UsersIcon, ShieldIcon } from "../../icons/AppIcons";

export type MenuItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  groupOnly?: boolean;
  section?: "Professores" | "Equipe multidisciplinar";
  children?: MenuItem[];
};

const icons = { home: HomeIcon, students: StudentsIcon, clipboard: ClipboardIcon, document: DocumentIcon, chart: ChartIcon, users: UsersIcon, shield: ShieldIcon };

export function getMenuItems(conta: PerfilUsuario | Usuario): MenuItem[] {
  const perfil = typeof conta === "string" ? conta : conta.perfil;
  const basePath = accessProfiles[perfil].basePath;
  return getNavigation(conta).map(item => ({
    groupOnly: item.groupOnly, section: item.section, label: item.label, path: `${basePath}/${item.slug}`, icon: icons[item.icon],
    children: item.children?.map(child => ({
      label: child.label, path: `${basePath}/${child.slug}`, icon: icons[child.icon],
    })),
  }));
}
