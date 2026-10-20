import type { PerfilUsuario } from "../types/auth";
import { canAccess, type Permission } from "./access";

export type NavigationItem = {
  label: string;
  slug: string;
  icon: "home" | "students" | "clipboard" | "document" | "chart" | "users" | "shield";
  groupOnly?: boolean;
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
      { label: "Adaptações pedagógicas", slug: "adaptacoes", icon: "clipboard", permission: "pedagogico.editar", profiles: ["PROFESSOR"] },
      { label: "Atendimentos", slug: "atendimentos", icon: "clipboard", permission: "suporte.registrar", profiles: ["EQUIPE_MULTIDISCIPLINAR"] },
    ]
  },
  {
    label: "Acompanhamento pedagógico", slug: "pedagogico", icon: "clipboard", groupOnly: true,
    permission: "pedagogico.consultar", profiles: ["COORDENADOR", "ADMINISTRADOR"], children: [
      { label: "Adaptações pedagógicas", slug: "adaptacoes", icon: "clipboard", permission: "pedagogico.consultar" },
      { label: "Conteúdo acadêmico", slug: "conteudo-academico", icon: "document", permission: "academico.gerar" },
    ],
  },
  { label: "Atendimentos", slug: "atendimentos", icon: "clipboard", permission: "suporte.consultar", profiles: ["COORDENADOR", "ADMINISTRADOR"] },
  { label: "Conteúdo acadêmico", slug: "conteudo-academico", icon: "document", permission: "academico.gerar", profiles: ["PROFESSOR"] },
  { label: "Documentos", slug: "documentos", icon: "document", permission: "documentos" },
  { label: "Relatórios", slug: "relatorios", icon: "chart", permission: "relatorios" },
  {
    label: "Administração", slug: "administracao", icon: "shield", groupOnly: true,
    permission: "usuarios", profiles: ["COORDENADOR", "ADMINISTRADOR"], children: [
      { label: "Usuários", slug: "administracao/usuarios", icon: "users", permission: "usuarios" },
      { label: "Permissões", slug: "administracao/permissoes", icon: "shield", permission: "permissoes" },
      { label: "Auditorias", slug: "administracao/auditorias", icon: "clipboard", permission: "auditorias" },
    ],
  },
];

export function getNavigation(perfil: PerfilUsuario): NavigationItem[] {
  const visible = (item: NavigationItem) =>
    (!item.profiles || item.profiles.includes(perfil)) &&
    (!item.permission || canAccess(perfil, item.permission));
  const estudantesLabel = "Estudantes";
  return navigation.filter(visible)
    .map(item => ({
      ...item,
      label: item.slug === "estudantes" ? estudantesLabel : item.label,
      children: item.children?.filter(visible),
    }));
}
