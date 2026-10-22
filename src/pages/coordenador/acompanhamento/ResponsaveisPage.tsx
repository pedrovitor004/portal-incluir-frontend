import { useEffect, useState } from "react";
import { Link } from "react-router";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import EquipeResponsavel from "./EquipeResponsavel";
import { estudantesService } from "../../../services/estudantesService";
import { mensagemErro } from "../../../services/apiError";
import type { EstudanteResponse } from "../../../types/estudante";
import { campoGestao } from "./presentation";

export default function ResponsaveisPage() {
  const [estudantes, setEstudantes] = useState<EstudanteResponse[]>([]);
  const [selecionado, setSelecionado] = useState("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [versao, setVersao] = useState(0);
  useEffect(() => { document.title = "Responsáveis pelo acompanhamento | Portal Incluir"; }, []);
  useEffect(() => {
    let ativo = true;
    estudantesService.listarTodos().then(dados => { if (ativo) setEstudantes(dados); }).catch(error => { if (ativo) setErro(mensagemErro(error)); }).finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [versao]);
  const estudante = estudantes.find(e => String(e.id) === selecionado);
  const normalizar = (valor: string) => valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const filtrados = estudantes.filter(e => normalizar(`${e.nomeCompleto} ${e.matricula} ${e.curso}`).includes(normalizar(busca)) || String(e.id) === selecionado);
  return <div className="mx-auto max-w-[1600px] space-y-6 pb-6">
    <header><Link to="/coordenador/atendimentos" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">← Voltar aos atendimentos</Link><h1 data-page-title className="mt-2 text-2xl font-bold text-primary">Responsáveis pelo acompanhamento</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">Escolha um estudante e atribua os profissionais da equipe multidisciplinar que irão acompanhá-lo. Você pode atribuir mais de um responsável e encerrar os vínculos quando necessário.</p></header>
    <section className="rounded-2xl border border-[#dce5dc] bg-white p-5 sm:p-6"><h2 className="font-bold text-slate-800">Quem será acompanhado?</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Buscar estudante<input className={campoGestao} value={busca} onChange={e => setBusca(e.target.value)} placeholder="Nome, matrícula ou curso" disabled={carregando} /></label><label className="text-sm font-semibold text-slate-700">Estudante<select className={campoGestao} disabled={carregando || !!erro} value={selecionado} onChange={e => setSelecionado(e.target.value)}><option value="">Selecione um estudante</option>{filtrados.map(e => <option key={e.id} value={e.id}>{e.nomeCompleto} · {e.matricula}</option>)}</select></label></div>
      {carregando && <LoadingState />}{erro && <div role="alert" className="mt-4 space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{erro}</p><Button variant="secondary" onClick={() => { setErro(""); setCarregando(true); setVersao(v => v + 1); }}>Tentar novamente</Button></div>}{!carregando && !erro && !filtrados.length && <p role="status" className="mt-4 text-sm text-slate-500">Nenhum estudante encontrado.</p>}
    </section>
    <p className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">Os vínculos usam a integração já existente no portal. A entrega de notificações de atribuição e encerramento aos profissionais será habilitada com a integração de notificações.</p>
    {estudante ? <EquipeResponsavel key={estudante.id} estudante={estudante} /> : !carregando && <div className="rounded-2xl border border-dashed border-[#dce5dc] p-10 text-center text-sm text-slate-500">Selecione o estudante para consultar a equipe e atribuir responsáveis.</div>}
  </div>;
}
