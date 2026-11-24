// Caminhos relativos à baseURL definida em config/api.ts.
export const endpoints = {
  conteudosAcademicos: {
    base: "/conteudos-academicos",
    porId: (id: number) => `/conteudos-academicos/${id}`,
    arquivo: (id: number) => `/conteudos-academicos/${id}/arquivo`,
  },
  documentos: {
    pei: "/planos-educacionais",
    adaptacoesPedagogicas: "/adaptacoes-pedagogicas",
    planoAcao: "/planos-acao",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    recuperarSenha: "/auth/recuperar-senha",
    redefinirSenha: "/auth/redefinir-senha",
  },
  coordenadores: {
    perfil: (id: number) => `/coordenadores/${id}`,
    dashboard: (id: number) => `/coordenadores/${id}/dashboard`,
  },
} as const;
