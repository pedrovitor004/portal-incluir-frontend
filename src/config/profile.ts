import type { PerfilUsuario } from "../types/auth";
import type { ProfileAdapter } from "../types/profile";
import { coordinatorProfileAdapter } from "../services/profile/adapters/coordinatorProfileAdapter";

/** Register a profile only when its read/update adapter is implemented. */
export const profileAdapters: Partial<Record<PerfilUsuario, ProfileAdapter>> = {
  COORDENADOR: coordinatorProfileAdapter,
};

export function getProfileAdapter(perfil: PerfilUsuario): ProfileAdapter | undefined {
  return profileAdapters[perfil];
}
