export type TipoNecessidadeEspecifica =
  | "CEGUEIRA_TOTAL"
  | "VISAO_MONOCULAR"
  | "BAIXA_VISAO"
  | "SURDEZ_LINGUA_ORAL_LEITURA_LABIAL"
  | "SURDEZ_USA_LIBRAS"
  | "SURDEZ_SEM_LIBRAS_OU_ORALIZACAO"
  | "PERDA_AUDITIVA_PARCIAL_COM_APARELHO"
  | "PERDA_AUDITIVA_PARCIAL"
  | "SURDOCEGUEIRA"
  | "DEFICIENCIA_FISICA_MOBILIDADE"
  | "DEFICIENCIA_FISICA_ATIVIDADES_MANUAIS"
  | "DEFICIENCIA_INTELECTUAL"
  | "DEFICIENCIAS_MULTIPLAS"
  | "AUTISMO"
  | "ALTAS_HABILIDADES"
  | "TDAH"
  | "DISLEXIA"
  | "DIFICULDADE_APRENDIZAGEM"
  | "OUTRA";

export type TipoCondicaoAssociada =
  | "EPILEPSIA"
  | "ESQUIZOFRENIA"
  | "TRANSTORNO_OPOSITOR_DESAFIADOR"
  | "TOC"
  | "TRANSTORNO_BIPOLAR"
  | "ANSIEDADE"
  | "DEPRESSAO"
  | "BORDERLINE"
  | "INTOLERANCIA_ALIMENTAR"
  | "DISTURBIO_COMPORTAMENTO"
  | "OUTRA";

export type TipoAtendimentoCampus =
  | "TRADUTOR_INTERPRETE_LIBRAS"
  | "CUIDADOR"
  | "LEDOR_AUDIODESCRITOR"
  | "MATERIAL_BRAILLE"
  | "ALFABETIZADOR_JOVENS_ADULTOS";

export type TipoAcessibilidadeFisica =
  | "SALA_TERREO_AMBIENTE_ACESSIVEL"
  | "TODAS_DISCIPLINAS_MESMA_SALA"
  | "BANHEIRO_ADAPTADO"
  | "OUTRA";

export type EstudanteResponse = {
  id: number;
  ativo: boolean;
  concluido: boolean;
  dataConclusao: string | null;
  dataLimiteRetencao: string | null;
  nomeCompleto: string;
  dataNascimento: string | null;
  curso: string;
  matricula: string;
  periodoIngresso: string;
  telefone: string;
  email: string;
  nomeResponsavel: string;
  telefoneResponsavel: string;
  emailResponsavel: string;

  possuiNecessidadeEspecifica: boolean | null;
  necessidadesEspecificas: TipoNecessidadeEspecifica[];
  outraNecessidadeEspecifica: string | null;
  condicoesAssociadas: TipoCondicaoAssociada[];
  outraCondicaoAssociada: string | null;
  atendimentosCampus: TipoAtendimentoCampus[];
  acessibilidadesFisicas: TipoAcessibilidadeFisica[];
  outraAcessibilidadeFisica: string | null;
  possuiOutraNecessidadeAtendimento: boolean | null;
  descricaoOutraNecessidadeAtendimento: string | null;
};

export type Estudante = {
  id: number;
  nome: string;
  matricula: string;
  ano: string;
  curso: string;
  deficiencia: string;
  status: string;

  possuiNecessidadeEspecifica: boolean | null;
  necessidadesEspecificas: TipoNecessidadeEspecifica[];
  condicoesAssociadas: TipoCondicaoAssociada[];
  atendimentosCampus: TipoAtendimentoCampus[];
  acessibilidadesFisicas: TipoAcessibilidadeFisica[];
  possuiOutraNecessidadeAtendimento: boolean | null;
};

const nomesNecessidades: Record<TipoNecessidadeEspecifica, string> = {
  CEGUEIRA_TOTAL: "Cegueira total",
  VISAO_MONOCULAR: "Visão monocular",
  BAIXA_VISAO: "Baixa visão",
  SURDEZ_LINGUA_ORAL_LEITURA_LABIAL: "Surdez com leitura labial/oral",
  SURDEZ_USA_LIBRAS: "Surdez com uso de Libras",
  SURDEZ_SEM_LIBRAS_OU_ORALIZACAO: "Surdez sem Libras/oralização",
  PERDA_AUDITIVA_PARCIAL_COM_APARELHO: "Perda auditiva com aparelho",
  PERDA_AUDITIVA_PARCIAL: "Perda auditiva parcial",
  SURDOCEGUEIRA: "Surdocegueira",
  DEFICIENCIA_FISICA_MOBILIDADE: "Deficiência física - mobilidade",
  DEFICIENCIA_FISICA_ATIVIDADES_MANUAIS: "Deficiência física - atividades manuais",
  DEFICIENCIA_INTELECTUAL: "Deficiência intelectual",
  DEFICIENCIAS_MULTIPLAS: "Deficiências múltiplas",
  AUTISMO: "Autismo",
  ALTAS_HABILIDADES: "Altas habilidades",
  TDAH: "TDAH",
  DISLEXIA: "Dislexia",
  DIFICULDADE_APRENDIZAGEM: "Dificuldade de aprendizagem",
  OUTRA: "Outra necessidade",
};

export type EstudanteRequest = {
  anamneseConcluida?: boolean;
   nomeCompleto: string;
   dataNascimento: string;
   curso: string;
   matricula: string;
   periodoIngresso: string;

   telefone: string;
   email: string;
   nomeResponsavel: string;
   telefoneResponsavel: string;
   emailResponsavel: string;

   possuiNecessidadeEspecifica: boolean | null;
   necessidadesEspecificas: TipoNecessidadeEspecifica[];
   outraNecessidadeEspecifica: string | null;

   condicoesAssociadas: TipoCondicaoAssociada[];
   outraCondicaoAssociada: string | null;

   atendimentosCampus: TipoAtendimentoCampus[];

   acessibilidadesFisicas: TipoAcessibilidadeFisica[];
   outraAcessibilidadeFisica: string | null;

   possuiOutraNecessidadeAtendimento: boolean | null;
   descricaoOutraNecessidadeAtendimento: string | null;
 };

export function mapearEstudante(
  estudante: EstudanteResponse,
): Estudante {
  const necessidades = estudante.necessidadesEspecificas ?? [];

  return {
    id: estudante.id,
    nome: estudante.nomeCompleto,
    matricula: estudante.matricula,
    ano: estudante.periodoIngresso,
    curso: estudante.curso,
    deficiencia:
      necessidades.length > 0
        ? necessidades
            .map((necessidade) => nomesNecessidades[necessidade] ?? necessidade)
            .join(", ")
        : estudante.possuiNecessidadeEspecifica === false
          ? "Não possui"
          : "Não informado",
    status: estudante.concluido
      ? "Concluído"
      : estudante.ativo
        ? "Ativo"
        : "Inativo",

    possuiNecessidadeEspecifica:
      estudante.possuiNecessidadeEspecifica ?? null,
    necessidadesEspecificas: necessidades,
    condicoesAssociadas: estudante.condicoesAssociadas ?? [],
    atendimentosCampus: estudante.atendimentosCampus ?? [],
    acessibilidadesFisicas: estudante.acessibilidadesFisicas ?? [],
    possuiOutraNecessidadeAtendimento:
      estudante.possuiOutraNecessidadeAtendimento ?? null,
  };
}
