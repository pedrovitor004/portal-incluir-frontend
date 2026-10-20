// Caminhos relativos à baseURL definida em config/api.ts.
export const endpoints = {
  documentos: {
    pei: "/planos-educacionais",
    planoAcao: "/planos-acao",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  coordenadores: {
    perfil: (id: number) => `/coordenadores/${id}`,
    dashboard: (id: number) => `/coordenadores/${id}/dashboard`,
  },
} as const;
