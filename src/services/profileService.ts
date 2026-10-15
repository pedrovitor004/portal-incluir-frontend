import { getProfileAdapter } from "../config/profile";
import type { PerfilUsuario } from "../types/auth";
import type { ProfileValues } from "../types/profile";

function adapterFor(perfil: PerfilUsuario) {
  const adapter = getProfileAdapter(perfil);
  if (!adapter) throw new Error("A consulta e a edição deste perfil ainda não estão disponíveis.");
  return adapter;
}

export const profileService = {
  async read(perfil: PerfilUsuario, id: number, signal?: AbortSignal) {
    return adapterFor(perfil).read(id, signal);
  },
  async update(perfil: PerfilUsuario, id: number, values: ProfileValues) {
    return adapterFor(perfil).update(id, values);
  },
};
