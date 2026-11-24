import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { canAccess } from "../../../config/access";
import { useConsultaPea } from "../../../hooks/useConsultaPea";
import { adaptacoesPedagogicasService } from "../../../services/adaptacoesPedagogicasService";
import type { AdaptacaoPedagogicaResponse } from "../../../types/adaptacaoPedagogica";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import PeaEntregueModal from "../../../components/pea/PeaEntregueModal";
import { formatarDataDocumento } from "../../../config/documentos";
import { campoGestao, professoresComPeas, filtrarPeasCoordenador } from "./presentation";

type Consulta = { dados: AdaptacaoPedagogicaResponse[] | null; carregando: boolean; erro: string; recarregar: () => void };

export function ListaPeasCoordenador({ dados, carregando, erro, recarregar }: Consulta) {
  const [professorId, setProfessorId] = useState("");
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("TODOS");
  const [pagina, setPagina] = useState(1);
  const [peaId, setPeaId] = useState<number | null>(null);
  const registros = dados ?? [];
  const professores = professoresComPeas(registros);
  const filtrados = filtrarPeasCoordenador(registros, professorId, situacao, busca);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / 8));
  const paginaAtual = Math.min(pagina, totalPaginas);
  if (carregando) return <LoadingState label="Carregando PEAs disponíveis..." />;
  if (erro) return <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div>;
  if (dados === null) return null;
  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">PEAs disponíveis para consulta</h2><Button variant="secondary" onClick={recarregar}>Atualizar consulta</Button></div>
    <p className="text-sm text-slate-600">O filtro apresenta somente professores com PEAs disponíveis nesta consulta, conforme sua autorização. Ativo e arquivado são estados do documento, independentes do andamento de solicitações.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm font-semibold">Professor<select className={campoGestao} value={professorId} onChange={e => { setProfessorId(e.target.value); setPagina(1); }}><option value="">Todos os professores com PEAs disponíveis</option>{professores.map(([id,nome]) => <option key={id} value={id}>{nome} · Professor #{id}</option>)}</select></label>
      <label className="text-sm font-semibold">Buscar<input className={campoGestao} value={busca} placeholder="Estudante, matrícula, componente ou período" onChange={e => { setBusca(e.target.value); setPagina(1); }} /></label>
      <label className="text-sm font-semibold">Estado do documento<select className={campoGestao} value={situacao} onChange={e => { setSituacao(e.target.value); setPagina(1); }}><option value="TODOS">Todos</option><option value="ATIVO">Ativo</option><option value="ARQUIVADO">Arquivado</option></select></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-slate-600">{filtrados.length} PEA(s) encontrado(s).</p><Button variant="soft" onClick={() => { setProfessorId(""); setBusca(""); setSituacao("TODOS"); setPagina(1); }}>Limpar filtros</Button></div>
    {!registros.length ? <p role="status">Nenhum PEA disponível para consulta.</p> : !filtrados.length ? <p role="status">Nenhum PEA encontrado para os filtros selecionados.</p> : <ul className="space-y-4">{filtrados.slice((paginaAtual-1)*8,paginaAtual*8).map(p => <li key={p.id} className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-semibold">PEA #{p.id} · {p.componenteCurricular}</h3><span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.arquivado ? "bg-slate-100 text-slate-700" : "bg-green-50 text-green-800"}`}>Documento {p.arquivado ? "arquivado" : "ativo"}</span></div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{[["Professor",`${p.professorNome} · #${p.professorId}`],["Estudante",p.estudanteNome],["Matrícula",p.estudanteMatricula],["Curso",p.estudanteCurso],["Período",p.semestreAno],["Data de registro",formatarDataDocumento(p.dataCriacao)]].map(([titulo,valor]) => <div key={titulo}><dt className="text-xs text-slate-500">{titulo}</dt><dd className="break-words">{valor || "Não informado"}</dd></div>)}</dl>
      <Button variant="secondary" onClick={() => setPeaId(p.id)}>Consultar PEA #{p.id}</Button>
    </li>)}</ul>}
    {filtrados.length > 0 && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-sm">Página {paginaAtual} de {totalPaginas}</span><div className="flex gap-2"><Button variant="secondary" disabled={paginaAtual<=1} onClick={() => setPagina(paginaAtual-1)}>Anterior</Button><Button variant="secondary" disabled={paginaAtual>=totalPaginas} onClick={() => setPagina(paginaAtual+1)}>Próxima</Button></div></footer>}
    {peaId !== null && registros.some(p => p.id === peaId) && <PeaEntregueModal key={peaId} id={peaId} titulo="Consulta de Plano de Ensino Adaptado (PEA)" onClose={() => setPeaId(null)} />}
  </section>;
}

function ConsultaAutorizada() {
  const consultar = useCallback((signal: AbortSignal) => adaptacoesPedagogicasService.listarTodos(signal), []);
  const consulta = useConsultaPea(consultar);
  return <ListaPeasCoordenador {...consulta} />;
}
export default function ConsultaPeasCoordenador() {
  const { usuario } = useAuth();
  useEffect(() => { document.title = "Adaptações pedagógicas | Portal Incluir"; }, []);
  if (!usuario || usuario.perfil !== "COORDENADOR" || !canAccess(usuario,"pedagogico.consultar")) return <p role="alert">Você não tem autorização para consultar estes PEAs.</p>;
  return <div className="mx-auto max-w-[1600px] space-y-6 pb-6">
    <header><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-700">Gestão da coordenação</p><h1 data-page-title className="text-2xl font-bold text-primary sm:text-[28px]">Adaptações pedagógicas</h1><p className="mt-2 text-sm text-slate-600">Consulte os PEAs registrados pelos professores e o conteúdo completo de cada documento, em modo somente leitura.</p></header>
    <nav aria-label="Acompanhamento pedagógico" className="flex flex-wrap gap-2"><Link to="/coordenador/adaptacoes" aria-current="page" className="rounded-xl border border-primary bg-green-50 px-4 py-3 text-sm font-semibold text-primary">Adaptações pedagógicas</Link>{canAccess(usuario,"academico.gerar") && <Link to="/coordenador/conteudo-academico" className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-primary">Conteúdo acadêmico</Link>}</nav>
    <ConsultaAutorizada key={usuario.id} />
  </div>;
}
