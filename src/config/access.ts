import type { PerfilUsuario } from "../types/auth";

export type Permission =
  | "estudantes.consultar" | "estudantes.editar"
  | "pedagogico.consultar" | "pedagogico.editar" | "academico.gerar"
  | "sensivel.consultar" | "suporte.consultar" | "suporte.registrar"
  | "anamnese" | "planos.gerar" | "pei.consultar"
  | "documentos" | "relatorios" | "usuarios";

const coordenador: Permission[] = [
  "estudantes.consultar", "estudantes.editar", "pedagogico.consultar",
  "pedagogico.editar", "academico.gerar", "sensivel.consultar",
  "suporte.consultar", "suporte.registrar", "anamnese", "planos.gerar",
  "pei.consultar", "documentos", "relatorios", "usuarios",
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

export function canAccess(perfil: PerfilUsuario, permission: Permission) {
  return (accessProfiles[perfil].permissions as readonly Permission[]).includes(permission);
}
