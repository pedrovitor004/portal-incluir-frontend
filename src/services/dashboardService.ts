import { endpoints } from "../config/endpoints";
import type { DashboardCoordenadorData } from "../types/dashboard";
import { http } from "./http";

export const dashboardService = {
  async buscarCoordenador(id: number, signal?: AbortSignal): Promise<DashboardCoordenadorData> {
    const { data } = await http.get<DashboardCoordenadorData>(endpoints.coordenadores.dashboard(id), { signal });
    return data;
  },
};
