import type { RegistroAuditoria } from "../../../types/auditoria";

export const operacoes = { ADD: "Inclusão", MOD: "Alteração", DEL: "Exclusão" };
export const coresOperacao = { ADD: "bg-green-50 text-green-800 ring-green-600/15", MOD: "bg-amber-50 text-amber-800 ring-amber-600/15", DEL: "bg-red-50 text-red-700 ring-red-600/15" };
const areas: Record<string, { nome: string; icone: string; cor: string }> = {
  usuarios: { nome: "Usuários", icone: "usuario", cor: "bg-sky-50 text-sky-700 ring-sky-100" },
  usuario_permissoes: { nome: "Permissões individuais", icone: "escudo", cor: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  vinculos_estudante_profissional: { nome: "Profissionais do estudante", icone: "equipe", cor: "bg-teal-50 text-teal-700 ring-teal-100" },
  professor_cursos: { nome: "Cursos de atuação dos professores", icone: "professor", cor: "bg-amber-50 text-amber-700 ring-amber-100" },
  estudantes: { nome: "Estudantes", icone: "estudante", cor: "bg-green-50 text-green-700 ring-green-100" },
  professores: { nome: "Professores", icone: "professor", cor: "bg-amber-50 text-amber-700 ring-amber-100" },
  coordenadores: { nome: "Coordenadores", icone: "escudo", cor: "bg-emerald-50 text-emerald-700 ring-emerald-100" },
  administradores: { nome: "Administradores", icone: "escudo", cor: "bg-sky-50 text-sky-700 ring-sky-100" },
  membros_equipe_multidisciplinar: { nome: "Equipe multidisciplinar", icone: "equipe", cor: "bg-violet-50 text-violet-700 ring-violet-100" },
  equipes_multidisciplinares: { nome: "Equipe multidisciplinar", icone: "equipe", cor: "bg-violet-50 text-violet-700 ring-violet-100" },
  planos_acao: { nome: "Planos de ação", icone: "plano", cor: "bg-amber-50 text-amber-700 ring-amber-100" },
  plano_educacional: { nome: "Planos educacionais", icone: "documento", cor: "bg-sky-50 text-sky-700 ring-sky-100" },
  planos_educacionais: { nome: "Planos educacionais", icone: "documento", cor: "bg-sky-50 text-sky-700 ring-sky-100" },
  adaptacoes_pedagogicas: { nome: "Adaptações pedagógicas", icone: "adaptacao", cor: "bg-teal-50 text-teal-700 ring-teal-100" },
};
export function areaAuditoria(tabela: string) {
  const chave = tabela.replace(/_aud$/, "");
  return areas[chave] ?? { nome: chave.charAt(0).toUpperCase() + chave.slice(1).replaceAll("_", " "), icone: "tabela", cor: "bg-slate-50 text-slate-600 ring-slate-200" };
}
export function valorAuditoria(value: unknown): string { return value === undefined ? "Não registrado" : value === null ? "Sem valor" : typeof value === "boolean" ? value ? "Sim" : "Não" : typeof value === "object" ? JSON.stringify(value, null, 2) : String(value); }
export function identidadeAuditoria(registro: RegistroAuditoria) { return Object.entries(registro.identidade).map(([chave, value]) => `${chave}: ${valorAuditoria(value)}`).join(" · "); }
export function nomeCampo(chave: string) { const texto = chave.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " "); return texto.charAt(0).toUpperCase() + texto.slice(1); }
