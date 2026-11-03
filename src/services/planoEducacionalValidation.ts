import { canAccess } from "../config/access";
import type { Usuario } from "../types/auth";
import type { EstudanteResponse } from "../types/estudante";
import type { PlanoEducacionalConteudo, PlanoEducacionalRequest, PlanoEducacionalResponse } from "../types/planoEducacional";

export const camposPei = [
  { name: "semestreAno", label: "Semestre/ano", limite: 20 },
  { name: "historico", label: "Histórico", limite: 5000 },
  { name: "necessidadesEspecificas", label: "Necessidades específicas", limite: 5000 },
  { name: "conhecimentosHabilidadesInteresses", label: "Conhecimentos, habilidades e interesses", limite: 5000 },
  { name: "dificuldadesApresentadas", label: "Dificuldades apresentadas", limite: 5000 },
  { name: "propostasAdaptacoesCurriculares", label: "Propostas de adaptações curriculares", limite: 5000 },
] as const;

export function exigirEdicaoPei(original: PlanoEducacionalResponse, estudanteId: number) {
  if (original.estudanteId !== estudanteId) throw new Error("Este PEI não pertence ao estudante do fluxo.");
  if (original.arquivado) throw new Error("Este PEI está arquivado e disponível somente para consulta.");
}

export function prepararPei(
  conteudo: PlanoEducacionalConteudo,
  estudante: EstudanteResponse,
  usuario: Usuario | null,
  original: PlanoEducacionalResponse | null = null,
): PlanoEducacionalRequest {
  if (usuario?.perfil !== "COORDENADOR" || !Number.isSafeInteger(usuario.perfilId) || usuario.perfilId <= 0 || !canAccess(usuario, "pei.editar")) {
    throw new Error("É necessário entrar como coordenador com permissão para editar PEIs.");
  }
  if (!Number.isSafeInteger(estudante.id) || estudante.id <= 0) throw new Error("Estudante inválido.");
  if (estudante.concluido) throw new Error("O histórico deste estudante está concluído e disponível somente para consulta.");
  if (original) exigirEdicaoPei(original, estudante.id);
  const dados: PlanoEducacionalRequest = {
    estudanteId: estudante.id, coordenadorId: original?.coordenadorId ?? usuario.perfilId,
    semestreAno: "", historico: "", necessidadesEspecificas: "", conhecimentosHabilidadesInteresses: "",
    dificuldadesApresentadas: "", propostasAdaptacoesCurriculares: "",
  };
  for (const campo of camposPei) {
    const valor = conteudo[campo.name].trim();
    if (!valor) throw new Error(`Preencha o campo ${campo.label}.`);
    if (conteudo[campo.name].length > campo.limite) throw new Error(`${campo.label} deve ter no máximo ${campo.limite} caracteres.`);
    dados[campo.name] = valor;
  }
  return dados;
}
