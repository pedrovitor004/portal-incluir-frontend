import type { Usuario } from "../types/auth";
import type { EstudanteResponse } from "../types/estudante";
import type { AdaptacaoPedagogicaConteudo, AdaptacaoPedagogicaRequest, AdaptacaoPedagogicaResponse } from "../types/adaptacaoPedagogica";
import { canAccess } from "../config/access";

export const camposPea = [
  { name: "componenteCurricular", label: "Componente curricular", limite: 150 },
  { name: "semestreAno", label: "Semestre/ano", limite: 20 },
  { name: "objetivoGeral", label: "Objetivo geral", limite: 5000 },
  { name: "objetivosEspecificos", label: "Objetivos específicos", limite: 5000 },
  { name: "conteudosProgramaticos", label: "Conteúdos programáticos", limite: 5000 },
  { name: "metodologia", label: "Metodologia", limite: 5000 },
  { name: "avaliacao", label: "Avaliação", limite: 5000 },
  { name: "bibliografiaBasica", label: "Bibliografia básica", limite: 5000 },
  { name: "bibliografiaComplementar", label: "Bibliografia complementar", limite: 5000 },
] as const;

export function exigirEdicaoPea(pea: AdaptacaoPedagogicaResponse, usuario: Usuario | null) {
  if (!usuario || usuario.perfil !== "PROFESSOR" || !canAccess(usuario, "pedagogico.editar") || pea.professorId !== usuario.perfilId) {
    throw new Error("Você não tem permissão para editar este PEA.");
  }
  if (pea.arquivado) throw new Error("Este PEA está arquivado e disponível somente para consulta.");
}

export function prepararEdicaoPea(conteudo: AdaptacaoPedagogicaConteudo, pea: AdaptacaoPedagogicaResponse, estudantes: EstudanteResponse[], usuario: Usuario | null) {
  exigirEdicaoPea(pea, usuario);
  return prepararCadastroPea(conteudo, pea.estudanteId, estudantes, usuario);
}

export function prepararCadastroPea(
  conteudo: AdaptacaoPedagogicaConteudo,
  estudanteId: number,
  estudantes: EstudanteResponse[],
  usuario: Usuario | null,
): AdaptacaoPedagogicaRequest {
  if (!usuario || usuario.perfil !== "PROFESSOR" || !Number.isSafeInteger(usuario.perfilId) || usuario.perfilId <= 0) {
    throw new Error("Não foi possível identificar o professor. Entre novamente para continuar.");
  }
  if (!canAccess(usuario, "pedagogico.editar")) throw new Error("Você não tem permissão para cadastrar o PEA.");
  const estudante = estudantes.find(item => item.id === estudanteId);
  if (!estudante) throw new Error("Selecione um estudante disponível para seu acompanhamento.");
  if (estudante.concluido) throw new Error("O histórico deste estudante está concluído e não permite novos registros.");
  const dados = { ...conteudo };
  for (const campo of camposPea) {
    const valor = conteudo[campo.name].trim();
    if (!valor) throw new Error(`Preencha o campo ${campo.label}.`);
    if (conteudo[campo.name].length > campo.limite) throw new Error(`${campo.label} deve ter no máximo ${campo.limite} caracteres.`);
    dados[campo.name] = valor;
  }
  // Cadastro independente: não incluir planoEducacionalId.
  return { ...dados, estudanteId, professorId: usuario.perfilId };
}
