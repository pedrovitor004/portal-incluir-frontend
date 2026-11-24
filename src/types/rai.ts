export const habilidadesRai = {
  atencao: "Falta de atenção e concentração",
  processamento: "Necessidade de mais tempo para processar informações",
  comandos: "Dificuldades em obedecer a comandos",
  curiosidade: "Exibe curiosidade",
  assiduidade: "Assiduidade nas aulas",
  interacao: "Interação com a turma",
  participacao: "Participação ativa nas atividades propostas",
  grupo: "Participação nas atividades em grupo",
  perguntas: "Realização de perguntas",
} as const;
export const frequenciasRai = ["Sempre", "Às vezes", "Raramente", "Nunca"] as const;
export const adequacoesRai = ["Conteúdos", "Objetivos", "Métodos", "Recursos", "Temporalidade", "Avaliação"] as const;
export const camposTextoRai = {
  campus: "Campus", componenteCurricular: "Componente curricular", professor: "Docente responsável",
  anoLetivo: "Ano letivo", periodoLetivo: "Período letivo / bimestre",
  deficiencia: "Deficiência e/ou necessidade específica", acompanhamento: "Acompanhamento por profissional específico",
  comunicacao: "Comunicação", aprendizagem: "Dificuldades de aprendizagem", saude: "Informações do setor de saúde",
  competencias: "Desempenho quanto às competências", objetivosGerais: "Desempenho quanto aos objetivos gerais",
  objetivosEspecificos: "Desempenho quanto aos objetivos específicos", comentarios: "Considerações e comentários",
  avaliacao: "Observações sobre adequações nos critérios de avaliação", encaminhamentos: "Encaminhamentos",
  consideracoesGerais: "Considerações gerais", local: "Cidade da assinatura", data: "Data do relatório",
} as const;
export type RaiConteudo = Record<keyof typeof camposTextoRai, string> & {
  periodicidade: "BIMESTRAL" | "SEMESTRAL" | "ANUAL";
  numeroPeriodo: string;
  habilidades: Partial<Record<keyof typeof habilidadesRai, typeof frequenciasRai[number]>>;
  adequacoes: (typeof adequacoesRai[number])[];
};
export type RaiResponse = { id: number; estudanteId: number; versao: number; dados: RaiConteudo; dataAtualizacao: string; concluidoEm?: string | null };
export function novoRai(): RaiConteudo {
  const textos = Object.fromEntries(Object.keys(camposTextoRai).map(k => [k, ""])) as Record<keyof typeof camposTextoRai, string>;
  const agora = new Date();
  const hoje = [agora.getFullYear(), String(agora.getMonth()+1).padStart(2, "0"), String(agora.getDate()).padStart(2, "0")].join("-");
  return { ...textos, campus: "Monteiro", local: "Monteiro", data: hoje, periodicidade: "SEMESTRAL", numeroPeriodo: "1", habilidades: {}, adequacoes: [] };
}
