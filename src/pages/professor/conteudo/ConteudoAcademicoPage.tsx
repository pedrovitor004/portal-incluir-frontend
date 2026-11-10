import ConteudoIcone from "./ConteudoIcone";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { canAccess } from "../../../config/access";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import { conteudosAcademicosService as api } from "../../../services/conteudosAcademicosService";
import { mensagemErro } from "../../../services/apiError";
import type { ConteudoAcademicoResponse } from "../../../types/conteudoAcademico";
import ConteudoAcademicoLista from "./ConteudoAcademicoLista";
import ConteudoDetalhesModal from "./ConteudoDetalhesModal";
import ConteudoFormModal from "./ConteudoFormModal";
import { confirmarUsuario } from "../../../services/usuarioConfirmation";
import { notificationService } from "../../../services/notificationService";
import { campoConteudo, filtrarConteudos, ordenarPorCadastro, tiposConteudo } from "./apresentacao";
import AbasConteudo, { type AbaConteudo } from "./AbasConteudo";

function Biblioteca({ professorId }: { professorId: number }) {
  const [materiais, setMateriais] = useState<ConteudoAcademicoResponse[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<AbaConteudo>("");
  const [componente, setComponente] = useState("");
  const [pagina, setPagina] = useState(1);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<{ id?: number } | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [favoritando, setFavoritando] = useState(false);
  const painelId = useId();
  const ocupado = excluindo || favoritando;
  const [erroAcao, setErroAcao] = useState("");
  const operando = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    api.listar(controller.signal).then(dados => {
      if (controller.signal.aborted) return;
      if (!Array.isArray(dados)) { setErro("Não foi possível consultar a lista de materiais. Tente novamente."); return; }
      setMateriais(dados.filter(m => m.professorId === professorId));
    }).catch((e: unknown) => { if (!controller.signal.aborted) setErro(mensagemErro(e)); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [professorId, tentativa]);
  const filtrados = ordenarPorCadastro(filtrarConteudos(materiais, busca, tipo, componente));
  const favoritos = filtrados.filter(m => m.favorito);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / 8));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const componentes = [...new Set(materiais.map(m => m.componenteCurricular))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  function recarregar() { setCarregando(true); setErro(""); setSelecionado(null); setTentativa(t => t + 1); }
  function limpar() { setTipo(""); setBusca(""); setComponente(""); setPagina(1); }
  async function favoritar(id: number) {
    const material = materiais.find(m => m.id === id);
    if (!material || operando.current) return;
    operando.current = true; setFavoritando(true); setErroAcao("");
    try {
      const atualizado = await api.definirFavorito(id, material.versao, !material.favorito);
      setMateriais(anteriores => anteriores.map(m => m.id === atualizado.id ? atualizado : m));
      void notificationService.success(atualizado.favorito ? "Material adicionado aos favoritos." : "Material removido dos favoritos.");
    } catch (e) { setErroAcao(`${mensagemErro(e)} Se o material foi alterado, atualize a lista antes de tentar novamente.`); }
    finally { operando.current = false; setFavoritando(false); }
  }
  function lista(registros: ConteudoAcademicoResponse[]) {
    return <ConteudoAcademicoLista materiais={registros} onVisualizar={setSelecionado} onEditar={id => setFormulario({ id })} onExcluir={id => void excluir(id)} onFavorito={id => void favoritar(id)} ocupado={ocupado} />;
  }
  async function excluir(id: number) {
    if (operando.current) return;
    operando.current = true; setExcluindo(true); setErroAcao("");
    try {
      const atual = await api.buscarPorId(id);
      if (atual.professorId !== professorId) { setErroAcao("Você não pode excluir este material."); return; }
      if (!await confirmarUsuario("Excluir material?", `${atual.titulo}. O material e seu anexo serão excluídos. A operação pode ser irreversível.`, true)) return;
      await api.excluir(id, atual.versao);
      setMateriais(anteriores => anteriores.filter(m => m.id !== id));
      recarregar(); void notificationService.success("Material excluído com sucesso.");
    } catch (e) { setErroAcao(mensagemErro(e)); }
    finally { operando.current = false; setExcluindo(false); }
  }

  return <main className="mx-auto max-w-[1100px] space-y-6 pb-10">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 data-page-title className="text-2xl font-bold text-primary">Conteúdo acadêmico</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">Organize suas provas, atividades e materiais de apoio adaptados para o ensino.</p></div><Button variant="secondary" icon={<ConteudoIcone nome="atualizar" />} disabled={carregando || ocupado} onClick={recarregar}>Atualizar materiais</Button></header>
    <AbasConteudo aba={tipo} onChange={aba => { setTipo(aba); setPagina(1); }} materiais={materiais} carregando={carregando || !!erro} painelId={painelId} />
    <section role="tabpanel" id={painelId} aria-label={tipo ? tiposConteudo[tipo] : "Visão geral"} className="space-y-6">
    {tipo === "" && <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6"><div><h2 className="font-bold text-primary">Sua biblioteca de materiais adaptados</h2><p className="mt-2 max-w-xl text-sm text-slate-600">Cadastre novos conteúdos e marque a estrela dos materiais que deseja manter em destaque.</p></div><Button icon={<ConteudoIcone nome="adicionar" />} disabled={ocupado} onClick={() => setFormulario({})}>Adicionar conteúdo</Button></section>}
    {tipo !== "" && <div className="flex justify-end"><Button icon={<ConteudoIcone nome="adicionar" />} disabled={ocupado} onClick={() => setFormulario({})}>Adicionar conteúdo</Button></div>}
    {excluindo && <p role="status" className="text-sm text-slate-600">Preparando exclusão do material...</p>}
    {favoritando && <p role="status" className="text-sm text-slate-600">Atualizando favoritos...</p>}
    {erroAcao && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{erroAcao}</p>}
    <section aria-label="Filtros de materiais" className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Buscar material<input type="search" className={campoConteudo} placeholder="Título, estudante ou matrícula" value={busca} onChange={e => { setBusca(e.target.value); setPagina(1); }} /></label>
        <label className="text-sm font-semibold text-slate-700">Componente curricular<select className={campoConteudo} value={componente} onChange={e => { setComponente(e.target.value); setPagina(1); }}><option value="">Todos os componentes</option>{componente && !componentes.includes(componente) && <option value={componente}>{componente}</option>}{componentes.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
      </div><div className="mt-4 flex flex-wrap items-center justify-between gap-3">{!carregando && !erro && <p role="status" className="text-xs text-slate-500">{filtrados.length} material(is) encontrado(s).</p>}<Button variant="soft" icon={<ConteudoIcone nome="limpar" />} onClick={limpar}>Limpar filtros</Button></div>
    </section>
    {carregando ? <LoadingState label="Carregando seus materiais..." /> : erro ? <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-5"><p className="text-sm text-red-700">{erro}</p><Button variant="secondary" onClick={recarregar}>Tentar novamente</Button></div> : materiais.length === 0 ? <div role="status" className="rounded-2xl border border-[#dce5dc] bg-white p-8 text-center"><h2 className="font-semibold text-slate-800">Nenhum material cadastrado</h2><p className="mt-2 text-sm text-slate-500">Seus conteúdos acadêmicos adaptados serão exibidos aqui.</p></div> : filtrados.length === 0 ? <div role="status" className="rounded-2xl border border-[#dce5dc] bg-white p-8 text-center"><h2 className="font-semibold text-slate-800">Nenhum material encontrado para estes filtros</h2><p className="mt-2 text-sm text-slate-500">Altere a busca ou limpe os filtros para consultar os materiais.</p></div> : <>
      {tipo === "" ? <>
        <section aria-label="Materiais favoritos" className="space-y-4"><div><h2 className="text-lg font-bold text-primary">Favoritos</h2><p className="mt-1 text-sm text-slate-500">Seus materiais em destaque, salvos na sua conta.</p></div>{favoritos.length ? lista(favoritos) : <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-5 text-sm text-slate-600">Nenhum favorito encontrado. Use a estrela de um material para destacá-lo aqui.</p>}</section>
        <section aria-label="Últimos materiais cadastrados" className="space-y-4"><div><h2 className="text-lg font-bold text-primary">Últimos materiais cadastrados</h2><p className="mt-1 text-sm text-slate-500">Os seis cadastros mais recentes para os filtros selecionados. Consulte cada aba para ver todos os materiais do tipo.</p></div>{lista(filtrados.slice(0, 6))}</section>
      </> : <>
        {lista(filtrados.slice((paginaAtual - 1) * 8, paginaAtual * 8))}
        <nav aria-label="Paginação de materiais" className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">Página {paginaAtual} de {totalPaginas}</p><div className="flex gap-2"><Button variant="secondary" disabled={paginaAtual <= 1} onClick={() => setPagina(paginaAtual - 1)}>Anterior</Button><Button variant="secondary" disabled={paginaAtual >= totalPaginas} onClick={() => setPagina(paginaAtual + 1)}>Próxima</Button></div></nav>
      </>}
    </>}
    </section>
    {selecionado !== null && <ConteudoDetalhesModal key={selecionado} id={selecionado} professorId={professorId} onClose={() => setSelecionado(null)} />}
    {formulario && <ConteudoFormModal key={formulario.id ?? "novo"} id={formulario.id} professorId={professorId} onClose={() => setFormulario(null)} onAlterado={recarregar} onSalvo={() => { setFormulario(null); recarregar(); void notificationService.success(formulario.id === undefined ? "Material cadastrado com sucesso." : "Material atualizado com sucesso."); }} />}
  </main>;
}

export default function ConteudoAcademicoPage() {
  const { usuario } = useAuth();
  if (!usuario || usuario.perfil !== "PROFESSOR" || !canAccess(usuario, "academico.gerar")) return <p role="alert">Você não tem permissão para consultar conteúdos acadêmicos nesta área.</p>;
  return <Biblioteca key={`${usuario.id}-${usuario.perfilId}`} professorId={usuario.perfilId} />;
}
