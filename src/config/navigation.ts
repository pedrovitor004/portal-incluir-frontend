import type { PerfilUsuario } from "../types/auth";
import { canAccess, type Permission } from "./access";

export type NavigationItem = {
  label: string;
  slug: string;
  icon: "home" | "students" | "clipboard" | "document" | "chart" | "users";
  permission?: Permission;
  profiles?: PerfilUsuario[];
  children?: NavigationItem[];
};

const navigation: NavigationItem[] = [
  { label: "Início", slug: "dashboard", icon: "home" },
  {
    label: "Estudantes", slug: "estudantes", icon: "students", permission: "estudantes.consultar", children: [
      { label: "Plano de Ação", slug: "plano-acao", icon: "clipboard", permission: "planos.gerar" },
      { label: "Anamnese", slug: "anamnese", icon: "clipboard", permission: "anamnese" },
      { label: "PEI", slug: "pei", icon: "document", permission: "pei.consultar" },
      { label: "Adaptações pedagógicas", slug: "adaptacoes", icon: "clipboard", permission: "pedagogico.editar", profiles: ["PROFESSOR", "ADMINISTRADOR"] },
      { label: "Atendimentos", slug: "atendimentos", icon: "clipboard", permission: "suporte.registrar", profiles: ["EQUIPE_MULTIDISCIPLINAR", "ADMINISTRADOR"] },
    ]
  },
  { label: "Conteúdo acadêmico", slug: "conteudo-academico", icon: "document", permission: "academico.gerar", profiles: ["PROFESSOR", "ADMINISTRADOR"] },
  { label: "Documentos", slug: "documentos", icon: "document", permission: "documentos" },
  { label: "Relatórios", slug: "relatorios", icon: "chart", permission: "relatorios" },
  { label: "Usuário", slug: "usuarios", icon: "users", permission: "usuarios" },
];

export function getNavigation(perfil: PerfilUsuario): NavigationItem[] {
  const visible = (item: NavigationItem) =>
    (!item.profiles || item.profiles.includes(perfil)) &&
    (!item.permission || canAccess(perfil, item.permission));
  return navigation.filter(visible)
    .map(item => ({ ...item, children: item.children?.filter(visible) }));
}
