// Caminhos relativos à baseURL definida em config/api.ts.
export const endpoints = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  coordenadores: {
    perfil: (id: number) => `/coordenadores/${id}`,
    dashboard: (id: number) => `/coordenadores/${id}/dashboard`,
  },
} as const;
