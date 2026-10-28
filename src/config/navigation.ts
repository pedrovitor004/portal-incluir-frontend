import type { PerfilUsuario, Usuario } from "../types/auth";
import { canAccess, type Permission } from "./access";

export type NavigationItem = {
  label: string;
  slug: string;
  icon: "home" | "students" | "clipboard" | "document" | "chart" | "users" | "shield";
  groupOnly?: boolean;
  permission?: Permission;
  permissionsAny?: Permission[];
  section?: "Professores" | "Equipe multidisciplinar";
  profiles?: PerfilUsuario[];
  children?: NavigationItem[];
};

const navigation: NavigationItem[] = [
  { label: "Início", slug: "dashboard", icon: "home" },
  {
    label: "Estudantes", slug: "estudantes", icon: "students", permission: "estudantes.consultar", children: [
      { label: "Cadastro do estudante", slug: "cadastro-estudante", icon: "clipboard", permission: "anamnese" },
    ]
  },
  {
    label: "Acompanhamento pedagógico", slug: "pedagogico", icon: "clipboard", groupOnly: true,
    section: "Professores", children: [
      { label: "Adaptações pedagógicas", slug: "adaptacoes", icon: "clipboard", permissionsAny: ["pedagogico.consultar", "pedagogico.editar"] },
      { label: "Conteúdo acadêmico", slug: "conteudo-academico", icon: "document", permission: "academico.gerar" },
    ],
  },
  { label: "Atendimentos", slug: "atendimentos", icon: "clipboard", section: "Equipe multidisciplinar", permissionsAny: ["suporte.consultar", "suporte.registrar"] },
  { label: "Responsáveis pelo acompanhamento", slug: "responsaveis", icon: "users", section: "Equipe multidisciplinar", profiles: ["COORDENADOR"], permission: "estudantes.vincular" },
  { label: "Documentos", slug: "documentos", icon: "document", permission: "documentos" },
  { label: "Relatórios", slug: "relatorios", icon: "chart", permission: "relatorios" },
  {
    label: "Administração", slug: "administracao", icon: "shield", groupOnly: true,
    children: [
      { label: "Usuários", slug: "administracao/usuarios", icon: "users", permission: "usuarios" },
      { label: "Permissões", slug: "administracao/permissoes", icon: "shield", permission: "permissoes" },
      { label: "Auditorias", slug: "administracao/auditorias", icon: "clipboard", permission: "auditorias" },
    ],
  },
];

export function getNavigation(conta: PerfilUsuario | Usuario): NavigationItem[] {
  const perfil = typeof conta === "string" ? conta : conta.perfil;
  const visible = (item: NavigationItem) =>
    (!item.profiles || item.profiles.includes(perfil)) &&
    (!item.permission || canAccess(conta, item.permission)) &&
    (!item.permissionsAny || item.permissionsAny.some(permission => canAccess(conta, permission)));
  const estudantesLabel = perfil === "PROFESSOR" ? "Meus estudantes"
    : perfil === "EQUIPE_MULTIDISCIPLINAR" ? "Estudantes acompanhados" : "Estudantes";
  return navigation.filter(item => visible(item) && (!item.groupOnly || item.children?.some(visible)))
    .map(item => ({
      ...item,
      label: item.slug === "estudantes" ? estudantesLabel : item.label,
      children: item.children?.filter(visible),
    }));
}
