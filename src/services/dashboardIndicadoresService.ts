import { ocorrenciasService } from "./ocorrenciasService";
import { canAccess } from "../config/access";
import { http } from "./http";
import type { EstudanteResponse } from "../types/estudante";
import type { PlanoEducacionalResponse } from "../types/planoEducacional";
import type { AdaptacaoPedagogicaResponse } from "../types/adaptacaoPedagogica";
import type { ConteudoAcademicoResponse } from "../types/conteudoAcademico";

import { registrosUnicos } from "./dashboardService";
import type { Usuario } from "../types/auth";

export async function consultarIndicadores(usuario: Usuario, signal?: AbortSignal) {
  const opcoes = { signal, params: { _consulta: Date.now() } };
  async function estudantes() {
    const lista = registrosUnicos((await http.get<EstudanteResponse[]>("/estudantes", opcoes)).data);
    if (lista.some(e => typeof e.ativo !== "boolean")) throw new Error("Situacao dos estudantes indisponivel.");
    return lista;
  }
  if (usuario.perfil === "EQUIPE_MULTIDISCIPLINAR") {
    const alunos = canAccess(usuario, "estudantes.consultar") ? estudantes().then(lista => lista.length) : Promise.reject(new Error("Sem permissao para consultar estudantes."));
    const ocorrencias = canAccess(usuario, "suporte.consultar") && canAccess(usuario, "estudantes.consultar")
      ? ocorrenciasService.listar({}, signal).then(registrosUnicos) : Promise.reject(new Error("Sem permissao para consultar ocorrencias."));
    const mes = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit" }).format(new Date());
    return Promise.allSettled([alunos, ocorrencias.then(lista => lista.filter(o => o.ocorridaEm.startsWith(mes)).length), ocorrencias.then(lista => lista.length), ocorrencias.then(lista => lista.filter(o => !!o.arquivoNome).length)]);
  }
  if (usuario.perfil !== "PROFESSOR") {
    const lista = canAccess(usuario, "estudantes.consultar") ? estudantes() : Promise.reject(new Error("Sem permissao para consultar estudantes."));
    return Promise.allSettled([0, 1, 2, 3].map(index => lista.then(dados => [dados.length, dados.filter(e => e.ativo).length, dados.filter(e => !e.ativo).length, dados.filter(e => !!e.dataConclusao).length][index])));
  }
  const consultas = [
    () => estudantes().then(lista => lista.length),
    async () => registrosUnicos((await http.get<PlanoEducacionalResponse[]>("/planos-educacionais", opcoes)).data).filter(p => !p.arquivado).length,
    async () => registrosUnicos((await http.get<AdaptacaoPedagogicaResponse[]>(`/adaptacoes-pedagogicas/professor/${usuario.perfilId}`, opcoes)).data).filter(p => p.professorId === usuario.perfilId && !p.arquivado).length,
    async () => registrosUnicos((await http.get<ConteudoAcademicoResponse[]>("/conteudos-academicos", opcoes)).data).filter(c => c.professorId === usuario.perfilId).length,
  ];
  const permissoes = ["estudantes.consultar", "pei.consultar", "pedagogico.consultar", "academico.gerar"] as const;
  const operacoes = consultas.map((consultar, index) => canAccess(usuario, permissoes[index])
    ? consultar() : Promise.reject(new Error("Sem permissao para consultar este indicador.")));
  return Promise.allSettled(operacoes);
}
