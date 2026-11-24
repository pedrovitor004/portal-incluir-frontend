import { ClipboardIcon, DocumentIcon } from "../../components/icons/AppIcons";
import { filtrarOcorrencias } from "../../services/ocorrenciasService";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { canAccess } from "../../config/access";
import { ocorrenciasService } from "../../services/ocorrenciasService";
import { mensagemErro } from "../../services/apiError";
import type { Ocorrencia } from "../../types/ocorrencia";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import LoadingState from "../../components/common/LoadingState";

const dataHora = (valor: string) => new Date(valor).toLocaleString("pt-BR");
const campo = "min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-800 shadow-sm transition focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-100";

function DetalheOcorrencia({ id, onClose }: { id: number; onClose: () => void }) {
  const [registro, setRegistro] = useState<Ocorrencia | null>(null);
  const [erro, setErro] = useState("");
  const [baixando, setBaixando] = useState(false);
  useEffect(() => {
    const c = new AbortController();
    ocorrenciasService.consultar(id, c.signal).then(o => { if (!c.signal.aborted) setRegistro(o); }).catch(e => { if (!c.signal.aborted) setErro(mensagemErro(e)); });
    return () => c.abort();
  }, [id]);
  async function baixar() {
    if (!registro || baixando) return;
    setBaixando(true); setErro("");
    try { await ocorrenciasService.baixar(registro); } catch (e) { setErro(mensagemErro(e)); }
    finally { setBaixando(false); }
  }
  return <Modal open onClose={onClose} title="Registro de ocorrência" size="wide" tone="amber" description="Informações registradas pela equipe multidisciplinar.">
    {erro && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-4 text-red-800">{erro}</p>}
    {!registro && !erro && <LoadingState label="Carregando ocorrência..." />}
    {registro && <div className="space-y-5"><div className="rounded-xl bg-amber-50 p-4"><h2 className="font-bold text-slate-800">{registro.estudanteNome}</h2><p className="mt-1 text-sm text-slate-600">Matrícula: {registro.estudanteMatricula}</p></div><dl className="grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Quando aconteceu</dt><dd className="mt-1 font-semibold">{dataHora(registro.ocorridaEm)}</dd></div><div><dt className="text-slate-500">Registrado por</dt><dd className="mt-1 font-semibold">{registro.autorNome}</dd></div></dl><div><h3 className="mb-2 font-semibold">O que aconteceu</h3><p className="whitespace-pre-wrap break-words leading-relaxed text-slate-700">{registro.descricao}</p></div>{registro.arquivoNome && <div className="rounded-xl border border-slate-200 p-4"><p className="mb-3 break-words text-sm">Anexo: {registro.arquivoNome}</p><Button variant="secondary" disabled={baixando} onClick={() => void baixar()}>{baixando ? "Baixando..." : "Baixar anexo"}</Button></div>}<p className="text-xs text-slate-500">Registro salvo em {dataHora(registro.registradaEm)} · Horários de Brasília.</p><div className="flex justify-end"><Button onClick={onClose}>Fechar</Button></div></div>}
  </Modal>;
}

export default function OcorrenciasPage({ relatorio = false, estudanteId }: { relatorio?: boolean; estudanteId?: number }) {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const [mes, setMes] = useState("");
  const [busca, setBusca] = useState("");
  const [autor, setAutor] = useState("");
  const [lista, setLista] = useState<Ocorrencia[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [exportando, setExportando] = useState(false);
  const exportacao = useRef(false);
  const [detalhe, setDetalhe] = useState<number | null>(null);
  const chave = `${usuario?.id}-${relatorio}-${estudanteId}-${mes}-${tentativa}`;
  const [carregada, setCarregada] = useState("");
  useEffect(() => {
    const c = new AbortController();
    ocorrenciasService.listar({ estudanteId, mes: mes || undefined }, c.signal, relatorio)
      .then(dados => { if (!c.signal.aborted) { setLista(dados); setErro(""); setCarregada(chave); } })
      .catch(e => { if (!c.signal.aborted) { setLista([]); setErro(mensagemErro(e)); setCarregada(chave); } })
      .finally(() => { if (!c.signal.aborted) setCarregando(false); });
    return () => c.abort();
  }, [estudanteId, mes, relatorio, chave]);
  const pendente = carregando || carregada !== chave;
  const filtrados = filtrarOcorrencias(pendente ? [] : lista, busca, autor);
  const paginas = Math.max(1, Math.ceil(filtrados.length / 10));
  const atual = Math.min(pagina, paginas);
  const equipe = usuario?.perfil === "EQUIPE_MULTIDISCIPLINAR";
  const coordenador = usuario?.perfil === "COORDENADOR" || usuario?.perfil === "ADMINISTRADOR";
  const podeRelatorio = !!usuario && (equipe || coordenador) && canAccess(usuario, "relatorios");
  const idUrl = Number(params.get("id"));
  const selecionado = detalhe ?? (!estudanteId && Number.isSafeInteger(idUrl) && idUrl > 0 ? idUrl : null);
  function fechar() { setDetalhe(null); if (!estudanteId) { const novos = new URLSearchParams(params); novos.delete("id"); novos.delete("registrada"); setParams(novos, { replace: true }); } }
  async function gerarPdf() {
    if (exportacao.current) return;
    exportacao.current = true; setExportando(true); setErro("");
    try {
      const atualizada = await ocorrenciasService.listar({ estudanteId, mes: mes || undefined }, undefined, true);
      setLista(atualizada);
      const registros = filtrarOcorrencias(atualizada, busca, autor);
      if (!registros.length) { setErro("Nenhuma ocorrência encontrada para gerar o relatório."); return; }
      const { exportarOcorrencias } = await import("../../services/exportarOcorrencias");
      await exportarOcorrencias(registros, mes, busca, autor);
    } catch (e) { setErro(mensagemErro(e)); }
    finally { exportacao.current = false; setExportando(false); }
  }
  return <section className="mx-auto max-w-6xl space-y-5 pb-8" aria-label="Ocorrências dos estudantes">
    <header className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><ClipboardIcon className="h-6 w-6" /></span><div>{estudanteId ? <h2 className="text-xl font-bold text-primary">Ocorrências do estudante</h2> : <h1 data-page-title className="text-2xl font-bold text-primary">{relatorio ? "Relatórios de ocorrências" : equipe ? "Minhas ocorrências" : "Ocorrências"}</h1>}<p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{equipe ? "Consulte os registros que você fez durante o acompanhamento dos estudantes." : coordenador ? "Consulte as ocorrências registradas pela equipe para todos os estudantes." : "Registros da equipe multidisciplinar para os estudantes vinculados a você."}</p></div></div><div className="flex flex-wrap gap-3">{equipe && usuario && canAccess(usuario, "suporte.registrar") && <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" to={`/equipe/ocorrencias/nova${estudanteId ? `?estudanteId=${estudanteId}` : ""}`}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 5H5v16h14V5h-4M9 3h6v4H9zM8 12h8M8 16h5" /></svg>Registrar ocorrência</Link>}</div></header>
    {!estudanteId && params.get("registrada") === "1" && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-5 font-semibold text-green-900">Ocorrência registrada! Os alertas foram enviados à coordenação e aos professores vinculados.</p>}
    <div className="space-y-4 rounded-2xl border border-[#dce5dc] bg-white p-5 shadow-[0_4px_24px_rgba(24,91,50,0.04)]"><div className={`grid gap-4 ${coordenador ? "md:grid-cols-3" : "md:grid-cols-2"}`}><label className="space-y-2 text-sm font-semibold text-slate-700"><span className="block">{relatorio ? "Mês do relatório" : "Mês da ocorrência"}</span><input type="month" className={campo} value={mes} disabled={exportando} onChange={e => { setMes(e.target.value); setPagina(1); }} /><span className="block text-xs font-normal text-slate-500">Escolha um mês para o relatório mensal ou deixe vazio para o geral.</span></label><label className="space-y-2 text-sm font-semibold text-slate-700"><span className="block">Buscar estudante ou ocorrência</span><input type="search" className={campo} value={busca} disabled={exportando} onChange={e => { setBusca(e.target.value); setPagina(1); }} placeholder="Nome, matrícula ou descrição" /></label>{coordenador && <label className="space-y-2 text-sm font-semibold text-slate-700"><span className="block">Profissional que registrou</span><input type="search" className={campo} value={autor} disabled={exportando} onChange={e => { setAutor(e.target.value); setPagina(1); }} placeholder="Nome do profissional" /></label>}</div><div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-slate-600">{pendente ? "Consultando ocorrências..." : erro ? "Consulta indisponível" : `${filtrados.length} ocorrência(s) · ${mes || "Todo o período"}`}</p><div className="flex flex-wrap gap-2"><Button variant="soft" disabled={exportando} onClick={() => { setMes(""); setBusca(""); setAutor(""); setPagina(1); }}>Todo o período</Button><Button variant="secondary" disabled={pendente || exportando} onClick={() => setTentativa(t => t + 1)}>Atualizar</Button>{podeRelatorio && <Button icon={<DocumentIcon className="h-4 w-4" />} disabled={pendente || exportando || !filtrados.length} onClick={() => void gerarPdf()}>{exportando ? "Gerando relatório..." : "Baixar relatório em PDF"}</Button>}</div></div></div>
    {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{erro} <button type="button" className="min-h-11 font-semibold underline" onClick={() => setTentativa(t => t + 1)}>Tentar novamente</button></p>}
    {pendente ? <LoadingState label="Carregando ocorrências..." /> : !erro && !filtrados.length ? <p role="status" className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">Nenhuma ocorrência encontrada neste período.</p> : <ul className="space-y-3">{filtrados.slice((atual - 1) * 10, atual * 10).map(o => <li key={o.id} className="rounded-2xl border border-[#dce5dc] border-l-4 border-l-amber-300 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold text-slate-800">{o.estudanteNome}</h3><p className="mt-1 text-xs text-slate-500">{dataHora(o.ocorridaEm)} · Por {o.autorNome}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">Ocorrência</span></div><p className="mt-3 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{o.descricao}</p><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><DocumentIcon className="h-4 w-4" />{o.arquivoNome ? "Possui anexo" : "Sem anexo"}</span><Button variant="secondary" onClick={() => setDetalhe(o.id)} aria-label={`Ver ocorrência de ${o.estudanteNome} em ${dataHora(o.ocorridaEm)}`}>Ver ocorrência</Button></div></li>)}</ul>}
    {!pendente && paginas > 1 && <nav aria-label="Paginação de ocorrências" className="flex items-center justify-between gap-3"><p className="text-sm text-slate-500">Página {atual} de {paginas}</p><div className="flex gap-2"><Button variant="secondary" disabled={atual <= 1} onClick={() => setPagina(atual - 1)}>Anterior</Button><Button variant="secondary" disabled={atual >= paginas} onClick={() => setPagina(atual + 1)}>Próxima</Button></div></nav>}
    {selecionado !== null && <DetalheOcorrencia key={selecionado} id={selecionado} onClose={fechar} />}
  </section>;
}
