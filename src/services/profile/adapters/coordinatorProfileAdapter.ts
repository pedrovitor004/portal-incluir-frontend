import { endpoints } from "../../../config/endpoints";
import { profileFieldCatalog as field } from "../../../config/profileFields";
import type { ProfileAdapter, ProfileData } from "../../../types/profile";
import { http } from "../../http";

// Backend contracts stay in the adapter, outside shared UI and validation.
interface CoordinatorRequest {
  nome: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  matricula: string;
  cargo: string;
  setor: string;
}

interface CoordinatorResponse extends CoordinatorRequest {
  id: number;
  status: "ATIVO" | "INATIVO";
}

function normalize(data: CoordinatorResponse): ProfileData {
  const { id, status, nome, email, telefone, dataNascimento, matricula, cargo, setor } = data;
  return { id, active: status === "ATIVO", values: { nome, email, telefone, dataNascimento, matricula, cargo, setor } };
}

export const coordinatorProfileAdapter: ProfileAdapter = {
  fields: [field.nome, field.email, field.telefone, field.dataNascimento, field.matricula, field.cargo, field.setor],
  emailChangesLogin: false,
  async read(id, signal) {
    const { data } = await http.get<CoordinatorResponse>(endpoints.coordenadores.perfil(id), { signal });
    return normalize(data);
  },
  async update(id, values) {
    const request: CoordinatorRequest = {
      nome: values.nome ?? "", email: values.email ?? "", telefone: values.telefone || null,
      dataNascimento: values.dataNascimento || null, matricula: values.matricula ?? "",
      cargo: values.cargo ?? "", setor: values.setor ?? "",
    };
    const { data } = await http.put<CoordinatorResponse>(endpoints.coordenadores.perfil(id), request);
    return normalize(data);
  },
};
