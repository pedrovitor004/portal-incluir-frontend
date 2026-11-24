export const cursosInstitucionais = [
  "Técnico Integrado em Informática",
  "Técnico Integrado em Instrumento Musical",
  "Técnico Integrado em Edificações",
  "Tecnólogo em Análise e Desenvolvimento de Sistemas",
  "Bacharel em Engenharia Civil",
];

export const atuacaoBncc = "Base comum do ensino médio (BNCC)";
export const atuacoesDocentes = [...cursosInstitucionais, atuacaoBncc];

export function professorAtuaNoCurso(atuacoes: string[], curso: string) {
  const normalizado = normalizarCurso(curso);
  return atuacoes.includes(normalizado) || atuacoes.includes(atuacaoBncc) && cursosInstitucionais.slice(0, 3).includes(normalizado);
}

export const areasEquipe = [
  "Psicologia", "Serviço social", "Pedagogia", "Atendimento educacional especializado (AEE)",
  "Tradução e interpretação de Libras", "Cuidador e apoio às atividades diárias",
  "Leitura e audiodescrição", "Apoio em Braille", "Alfabetização de jovens e adultos",
  "Fonoaudiologia", "Terapia ocupacional", "Fisioterapia", "Enfermagem", "Nutrição", "Outra área de apoio",
];

export function normalizarCurso(curso: string) {
  const chave = (valor: string) => valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
  return cursosInstitucionais.find(opcao => chave(opcao) === chave(curso)) ?? (["analise e desenvolvimento de sistemas", "ads", "tecnologia em analise e desenvolvimento de sistemas"].includes(chave(curso)) ? cursosInstitucionais[3] : curso);
}
