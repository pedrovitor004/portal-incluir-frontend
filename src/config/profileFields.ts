import type { ProfileField } from "../types/profile";

/** Shared definitions; each adapter selects the fields accepted by its API. */
export const profileFieldCatalog = {
  nome: { name: "nome", label: "Nome completo", type: "text", maxLength: 150, required: true, autoComplete: "name", fullWidth: true },
  email: { name: "email", label: "E-mail do cadastro", type: "email", maxLength: 150, required: true, autoComplete: "email", fullWidth: true },
  telefone: { name: "telefone", label: "Telefone", type: "tel", maxLength: 20, required: false, autoComplete: "tel" },
  dataNascimento: { name: "dataNascimento", label: "Data de nascimento", type: "date", required: false, autoComplete: "bday" },
  matricula: { name: "matricula", label: "Matrícula", type: "text", maxLength: 30, required: true, autoComplete: "off" },
  cargo: { name: "cargo", label: "Cargo", type: "text", maxLength: 120, required: true, autoComplete: "organization-title" },
  setor: { name: "setor", label: "Setor", type: "text", maxLength: 120, required: true, autoComplete: "organization" },
} satisfies Record<string, ProfileField>;
