export type StatusPlanoAcao = "RASCUNHO" | "ASSINADO";

export type PlanoAcaoRequest = {
 estudanteId: number;
 coordenadorResponsavelId: number;
 periodoLetivo: string;


 nomeResponsavel: string;
 grauParentesco: string;
 telefoneResponsavel: string;
 emailResponsavel: string;


 possuiComorbidade: boolean;
 comorbidades: string;


 usaMedicacaoContinua: boolean;
 medicacoes: string;


 frequentaServicoApoio: boolean;
 servicosApoio: string;


 possuiDocumentosComprobatorios: boolean;
 documentosComprobatorios: string;


 necessidadesEspecificas: string;
 consideracoes: string;
 avancosDificuldadesPotencialidades: string;
 principaisDemandas: string;
 propostasIntervencao: string;
};


export type PlanoAcaoResponse = {
 id: number;


 estudanteId: number;
 estudanteNome: string;
 estudanteMatricula: string;
 estudantePeriodoIngresso: string;
 estudanteCurso: string;
 estudanteDataNascimento: string;
 estudanteTelefone: string;
 estudanteEmail: string;


 coordenadorResponsavelId: number;
 coordenadorResponsavelNome: string;


 periodoLetivo: string;
 status: StatusPlanoAcao;
 arquivado: boolean;


 dataCriacao: string | null;
 dataAtualizacao: string | null;
 dataAssinatura: string | null;


 nomeResponsavel: string;
 grauParentesco: string;
 telefoneResponsavel: string;
 emailResponsavel: string;


 possuiComorbidade: boolean | null;
 comorbidades: string | null;


 usaMedicacaoContinua: boolean | null;
 medicacoes: string | null;


 frequentaServicoApoio: boolean | null;
 servicosApoio: string | null;


 possuiDocumentosComprobatorios: boolean | null;
 documentosComprobatorios: string | null;


 necessidadesEspecificas: string;
 consideracoes: string;
 avancosDificuldadesPotencialidades: string;
 principaisDemandas: string;
 propostasIntervencao: string;
};

