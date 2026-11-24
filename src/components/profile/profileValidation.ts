import type { ProfileDraft, ProfileErrors, ProfileField, ProfileValues } from "../../types/profile";

export function validateProfile(draft: ProfileDraft, fields: readonly ProfileField[], today: string): ProfileErrors {
  const errors: ProfileErrors = {};
  for (const field of fields) {
    const value = (draft[field.name] ?? "").trim();
    if (!value) {
      if (field.required) errors[field.name] = `Preencha o campo ${field.label.toLowerCase()}.`;
      continue;
    }
    if (field.maxLength && value.length > field.maxLength) errors[field.name] = `Use no máximo ${field.maxLength} caracteres.`;
    else if (field.type === "email" && !/^[^\s@]+@[^\s@]+$/.test(value)) errors[field.name] = "Informe um e-mail válido, como nome@instituicao.edu.br.";
    else if (field.type === "tel" && !/^[0-9()+\-\s]{8,20}$/.test(value)) errors[field.name] = "Informe de 8 a 20 caracteres, usando números, espaços, +, parênteses ou hífen.";
    else if (field.type === "date" && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value || value >= today)) errors[field.name] = "Informe uma data de nascimento anterior a hoje.";
  }
  return errors;
}

/** Only editable, configured fields are included in the update. */
export function serializeProfile(draft: ProfileDraft, fields: readonly ProfileField[]): ProfileValues {
  return Object.fromEntries(fields.map(field => {
    const value = (draft[field.name] ?? "").trim();
    return [field.name, value ? field.type === "email" ? value.toLowerCase() : value : field.required ? "" : null];
  }));
}
