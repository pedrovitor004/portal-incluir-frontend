import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { canAccess } from "../../../config/access";
import { conteudosAcademicosService as api } from "../../../services/conteudosAcademicosService";
import { mensagemErro } from "../../../services/apiError";
import type { ConteudoAcademicoResponse } from "../../../types/conteudoAcademico";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import ConteudoDetalhesModal from "../../professor/conteudo/ConteudoDetalhesModal";
import { filtrarConteudos, ordenarPorCadastro, tiposConteudo } from "../../professor/conteudo/apresentacao";
import { campoGestao } from "./presentation";
import { formatarDataDocumento } from "../../../config/documentos";

export function ListaConteudosCoordenador({ materiais, onVisualizar }: {
  materiais: ConteudoAcademicoResponse[]; onVisualizar: (id: number) => void;
}) {
  return <ul className="space-y-4">{materiais.map(m => <li key={m.id} className="space-y-4 rounded-xl border border-slate-200 p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="break-words font-semibold text-slate-800">{m.titulo}</h3><span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">{tiposConteudo[m.tipo]}</span></div>
    <p className="line-clamp-3 break-words text-sm text-slate-600">{m.descricao}</p>
    <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">{[
      ["Professor", `${m.professorNome} · #${m.professorId}`], ["Componente curricular", m.componenteCurricular],
      ["Estudante", m.estudanteId === null ? "Sem estudante · Material reutilizável" : m.estudanteNome],
      ["Matrícula", m.estudanteMatricula || "Não se aplica"], ["Data de registro", formatarDataDocumento(m.dataCriacao)],
      ["Material", m.arquivoNome ? "Arquivo anexado" : m.link ? "Link de apoio" : "Conteúdo textual"],
    ].map(([label, valor]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words">{valor || "Não informado"}</dd></div>)}</dl>
    <Button variant="secondary" onClick={() => onVisualizar(m.id)} aria-label={`Consultar material: ${m.titulo}`}>Consultar material</Button>
  </li>)}</ul>;
}

function ConsultaAutorizada() {
  const [materiais, setMateriais] = useState<ConteudoAcademicoResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [tipo, setTipo] = useState("");
  const [componente, setComponente] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    api.listar(controller.signal).then(dados => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(dados)) { setErro("A consulta retornou dados inválidos. Tente novamente."); return; }
      setMateriais(dados);
    }).catch((e: unknown) => { if (!controller.signal.aborted) setErro(mensagemErro(e)); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [tentativa]);
  const professores = [...new Map(materiais.map(m => [m.professorId, m.professorNome])).entries()].sort((a, b) => a[1].localeCompare(b[1], "pt-BR"));
  const componentes = [...new Set(materiais.map(m => m.componenteCurricular))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const filtrados = ordenarPorCadastro(filtrarConteudos(materiais.filter(m => !professorId || String(m.professorId) === professorId), busca, tipo, componente));
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / 8));
  const paginaAtual = Math.min(pagina, totalPaginas);
  function recarregar() { setCarregando(true); setErro(""); setSelecionado(null); setTentativa(t => t + 1); }
  if (carregando) return <LoadingState label="Carregando conteúdos acadêmicos disponíveis..." />;
  if (erro) return <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div>;
  return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Materiais disponíveis para consulta</h2><Button variant="secondary" onClick={recarregar}>Atualizar consulta</Button></div>
    <p className="text-sm text-slate-600">Consulte materiais registrados pelos professores, incluindo conteúdos reutilizáveis sem estudante associado. Esta área permite somente leitura.</p>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-semibold">Professor<select className={campoGestao} value={professorId} onChange={e => { setProfessorId(e.target.value); setPagina(1); }}><option value="">Todos com materiais disponíveis</option>{professorId && !professores.some(([id]) => String(id) === professorId) && <option value={professorId}>Professor #{professorId}</option>}{professores.map(([id, nome]) => <option key={id} value={id}>{nome} · Professor #{id}</option>)}</select></label>
      <label className="text-sm font-semibold">Buscar<input type="search" className={campoGestao} placeholder="Título, estudante ou matrícula" value={busca} onChange={e => { setBusca(e.target.value); setPagina(1); }} /></label>
      <label className="text-sm font-semibold">Tipo<select className={campoGestao} value={tipo} onChange={e => { setTipo(e.target.value); setPagina(1); }}><option value="">Todos os tipos</option>{Object.entries(tiposConteudo).map(([valor, nome]) => <option key={valor} value={valor}>{nome}</option>)}</select></label>
      <label className="text-sm font-semibold">Componente curricular<select className={campoGestao} value={componente} onChange={e => { setComponente(e.target.value); setPagina(1); }}><option value="">Todos os componentes</option>{componente && !componentes.includes(componente) && <option value={componente}>{componente}</option>}{componentes.map(c => <option key={c}>{c}</option>)}</select></label>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-slate-600">{filtrados.length} material(is) encontrado(s).</p><Button variant="soft" onClick={() => { setBusca(""); setProfessorId(""); setTipo(""); setComponente(""); setPagina(1); }}>Limpar filtros</Button></div>
    {!materiais.length ? <p role="status">Nenhum conteúdo acadêmico disponível para consulta.</p> : !filtrados.length ? <p role="status">Nenhum material encontrado para os filtros selecionados.</p> : <ListaConteudosCoordenador materiais={filtrados.slice((paginaAtual - 1) * 8, paginaAtual * 8)} onVisualizar={setSelecionado} />}
    {filtrados.length > 0 && <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><span className="text-sm">Página {paginaAtual} de {totalPaginas}</span><div className="flex gap-2"><Button variant="secondary" disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button><Button variant="secondary" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button></div></footer>}
    {selecionado !== null && <ConteudoDetalhesModal key={selecionado} id={selecionado} consultaCoordenador onClose={() => setSelecionado(null)} />}
  </section>;
}

export default function ConsultaConteudosCoordenador() {
  const { usuario } = useAuth();
  useEffect(() => { document.title = "Conteúdo acadêmico | Portal Incluir"; }, []);
  if (!usuario || usuario.perfil !== "COORDENADOR" || !canAccess(usuario, "academico.gerar")) return <p role="alert">Você não tem autorização para consultar estes materiais.</p>;
  return <div className="mx-auto max-w-[1600px] space-y-6 pb-6">
    <header><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-700">Gestão da coordenação</p><h1 data-page-title className="text-2xl font-bold text-primary sm:text-[28px]">Conteúdo acadêmico</h1><p className="mt-2 text-sm text-slate-600">Consulte os conteúdos acadêmicos adaptados cadastrados pelos professores, em modo somente leitura.</p></header>
    <nav aria-label="Acompanhamento pedagógico" className="flex flex-wrap gap-2">{canAccess(usuario, "pedagogico.consultar") && <Link to="/coordenador/adaptacoes" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-primary">Adaptações pedagógicas</Link>}<Link to="/coordenador/conteudo-academico" aria-current="page" className="rounded-xl border border-primary bg-green-50 px-4 py-3 text-sm font-semibold text-primary">Conteúdo acadêmico</Link></nav>
    <ConsultaAutorizada key={usuario.id} />
  </div>;
}
