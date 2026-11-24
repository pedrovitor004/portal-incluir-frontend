import type { TipoNecessidadeEspecifica, TipoCondicaoAssociada, TipoAtendimentoCampus, TipoAcessibilidadeFisica } from "../types/estudante";
export const necessidades: { value: TipoNecessidadeEspecifica; label: string }[] = [
  { value: "CEGUEIRA_TOTAL", label: "Cegueira total" },
  { value: "VISAO_MONOCULAR", label: "Visão monocular" },
  { value: "BAIXA_VISAO", label: "Baixa visão" },
  { value: "SURDEZ_LINGUA_ORAL_LEITURA_LABIAL", label: "Surdez com leitura labial/oral" },
  { value: "SURDEZ_USA_LIBRAS", label: "Surdez com uso de Libras" },
  { value: "SURDEZ_SEM_LIBRAS_OU_ORALIZACAO", label: "Surdez sem Libras ou oralização" },
  { value: "PERDA_AUDITIVA_PARCIAL_COM_APARELHO", label: "Perda auditiva parcial com aparelho" },
  { value: "PERDA_AUDITIVA_PARCIAL", label: "Perda auditiva parcial" },
  { value: "SURDOCEGUEIRA", label: "Surdocegueira" },
  { value: "DEFICIENCIA_FISICA_MOBILIDADE", label: "Deficiência física - mobilidade" },
  { value: "DEFICIENCIA_FISICA_ATIVIDADES_MANUAIS", label: "Deficiência física - atividades manuais" },
  { value: "DEFICIENCIA_INTELECTUAL", label: "Deficiência intelectual" },
  { value: "DEFICIENCIAS_MULTIPLAS", label: "Deficiências múltiplas" },
  { value: "AUTISMO", label: "Autismo" },
  { value: "ALTAS_HABILIDADES", label: "Altas habilidades" },
  { value: "TDAH", label: "TDAH" },
  { value: "DISLEXIA", label: "Dislexia" },
  { value: "DIFICULDADE_APRENDIZAGEM", label: "Dificuldade de aprendizagem" },
  { value: "OUTRA", label: "Outra necessidade" },
];

export const condicoes: { value: TipoCondicaoAssociada; label: string }[] = [
  { value: "EPILEPSIA", label: "Epilepsia" },
  { value: "ESQUIZOFRENIA", label: "Esquizofrenia" },
  { value: "TRANSTORNO_OPOSITOR_DESAFIADOR", label: "Transtorno opositor desafiador" },
  { value: "TOC", label: "Transtorno obsessivo-compulsivo (TOC)" },
  { value: "TRANSTORNO_BIPOLAR", label: "Transtorno bipolar" },
  { value: "ANSIEDADE", label: "Ansiedade" },
  { value: "DEPRESSAO", label: "Depressão" },
  { value: "BORDERLINE", label: "Transtorno de personalidade borderline" },
  { value: "INTOLERANCIA_ALIMENTAR", label: "Intolerância alimentar" },
  { value: "DISTURBIO_COMPORTAMENTO", label: "Distúrbio de comportamento" },
  { value: "OUTRA", label: "Outra condição" },
];

export const atendimentos: { value: TipoAtendimentoCampus; label: string }[] = [
  { value: "TRADUTOR_INTERPRETE_LIBRAS", label: "Tradutor/intérprete de Libras" },
  { value: "CUIDADOR", label: "Cuidador" },
  { value: "LEDOR_AUDIODESCRITOR", label: "Ledor/audiodescritor" },
  { value: "MATERIAL_BRAILLE", label: "Material em Braille" },
  { value: "ALFABETIZADOR_JOVENS_ADULTOS", label: "Alfabetizador de jovens e adultos" },
];

export const acessibilidades: { value: TipoAcessibilidadeFisica; label: string }[] = [
  { value: "SALA_TERREO_AMBIENTE_ACESSIVEL", label: "Sala no térreo ou ambiente acessível" },
  { value: "TODAS_DISCIPLINAS_MESMA_SALA", label: "Todas as disciplinas na mesma sala" },
  { value: "BANHEIRO_ADAPTADO", label: "Banheiro adaptado" },
  { value: "OUTRA", label: "Outra acessibilidade física" },
];
