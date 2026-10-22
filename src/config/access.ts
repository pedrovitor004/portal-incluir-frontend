import type { PerfilUsuario, Usuario } from "../types/auth";

export type Permission =
  | "estudantes.vincular" | "estudantes.consultar" | "estudantes.editar"
  | "pedagogico.consultar" | "pedagogico.editar" | "academico.gerar"
  | "sensivel.consultar" | "suporte.consultar" | "suporte.registrar"
  | "anamnese" | "planos.gerar" | "pei.consultar"
  | "documentos" | "relatorios" | "usuarios" | "permissoes" | "auditorias" | "usuarios.gerenciar" | "permissoes.gerenciar" | "documentos.gerenciar" | "pei.editar";

const coordenador: Permission[] = [
  "estudantes.vincular", "estudantes.consultar", "estudantes.editar", "pedagogico.consultar",
  "pedagogico.editar", "academico.gerar", "sensivel.consultar",
  "suporte.consultar", "suporte.registrar", "anamnese", "planos.gerar",
  "pei.consultar", "documentos", "relatorios", "usuarios", "permissoes", "auditorias", "usuarios.gerenciar", "permissoes.gerenciar", "documentos.gerenciar", "pei.editar",
];

// Frontend policy only. The API must enforce permissions and student/professional scope.
export const accessProfiles = {
  COORDENADOR: { label: "Coordenador", basePath: "/coordenador", permissions: coordenador },
  ADMINISTRADOR: { label: "Administrador", basePath: "/administrador", permissions: coordenador },
  PROFESSOR: {
    label: "Professor", basePath: "/professor",
    permissions: ["estudantes.consultar", "pedagogico.consultar", "pedagogico.editar", "academico.gerar", "pei.consultar", "documentos"],
  },
  EQUIPE_MULTIDISCIPLINAR: {
    label: "Equipe Multidisciplinar", basePath: "/equipe",
    permissions: ["estudantes.consultar", "sensivel.consultar", "suporte.consultar", "suporte.registrar", "relatorios"],
  },
} satisfies Record<PerfilUsuario, { label: string; basePath: string; permissions: Permission[] }>;

export function canAccess(conta: PerfilUsuario | Usuario, permission: Permission) {
  if (typeof conta !== "string" && conta.permissoes) return conta.permissoes.includes(permission);
  const perfil = typeof conta === "string" ? conta : conta.perfil;
  return (accessProfiles[perfil].permissions as readonly Permission[]).includes(permission);
}
