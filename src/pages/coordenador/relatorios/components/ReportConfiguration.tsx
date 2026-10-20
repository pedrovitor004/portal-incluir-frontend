import { useState } from "react";
import Modal from "../../../../components/common/Modal";
import Button from "../../../../components/common/Button";
import { camposRelatorio, modelosRelatorio } from "../../../../config/relatorios";
import { confirmarRelatorio } from "../../../../services/reportConfirmation";
import type { CampoRelatorio, ModeloRelatorio } from "../../../../types/relatorio";
import ReportIcon from "./ReportIcon";

type Configuracao = { titulo: string; campos: CampoRelatorio[]; documento: string };
type Props = { modelo: ModeloRelatorio; inicial: Configuracao; onClose: () => void; onApply: (valor: Configuracao) => void };

export default function ReportConfiguration({ modelo, inicial, onClose, onApply }: Props) {
  const [valor, setValor] = useState(inicial);
  const [confirmando, setConfirmando] = useState(false);
  const atual = modelosRelatorio.find(item => item.id === modelo)!;
  async function restaurar() {
    setConfirmando(true);
    try {
      if (await confirmarRelatorio("restaurar")) setValor({
        titulo: modelo === "panorama" ? "Estudantes por curso" : "Estudantes com documentos",
        campos: [...atual.campos], documento: "",
      });
    } finally { setConfirmando(false); }
  }
  return <Modal open onClose={onClose} busy={confirmando} size="wide" title="Configurar relatório"
    description="Personalize as informações que serão exibidas na tabela, no PDF e no Excel."
    icon={<ReportIcon name="tabela" />} footer={<div className="flex w-full flex-wrap items-center justify-between gap-3">
      <Button variant="secondary" disabled={confirmando} onClick={() => void restaurar()}>Restaurar padrão</Button>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={confirmando} onClick={onClose}>Cancelar</Button>
      <Button disabled={confirmando || !valor.campos.length || !valor.titulo.trim()} onClick={() => onApply({ ...valor, titulo: valor.titulo.trim() })} icon={<ReportIcon name="check" />}>Aplicar configurações</Button></div>
    </div>}>
    <fieldset disabled={confirmando} className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/60 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700"><ReportIcon name="info" /></span><div><p className="font-semibold text-green-900">{atual.titulo}</p><p className="text-xs text-slate-600">{atual.descricao}</p></div></div>
      <label className="block font-semibold text-slate-700">Título do relatório<input value={valor.titulo} onChange={e => setValor({ ...valor, titulo: e.target.value })} maxLength={120} className="mt-2 min-h-11 w-full rounded-lg border border-[#dce5dc] px-3 text-sm font-normal focus:outline-2 focus:outline-primary" /><span className="mt-1 block text-xs font-normal text-slate-500">Este título aparecerá no cabeçalho dos arquivos exportados.</span></label>
      <fieldset><legend className="font-semibold text-slate-700">Informações incluídas</legend><div className="mb-3 mt-1 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500" aria-live="polite">{valor.campos.length} de {camposRelatorio.length} informações selecionadas</p><button type="button" onClick={() => setValor({ ...valor, campos: camposRelatorio.map(c => c.id) })} className="min-h-9 font-medium text-green-800 hover:underline">Selecionar todas</button></div>
      <div className="grid gap-3 sm:grid-cols-2">{camposRelatorio.map(c => <label key={c.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${valor.campos.includes(c.id) ? "border-green-300 bg-green-50/60" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
        <input type="checkbox" checked={valor.campos.includes(c.id)} onChange={e => setValor({ ...valor, campos: e.target.checked ? camposRelatorio.filter(item => item.id === c.id || valor.campos.includes(item.id)).map(item => item.id) : valor.campos.filter(id => id !== c.id) })} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
        <span><span className="block font-semibold text-slate-700">{c.titulo}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{c.descricao}</span></span></label>)}</div>
      {!valor.campos.length && <p role="status" className="mt-3 text-sm text-amber-800">Selecione pelo menos uma informação.</p>}</fieldset>
      <label className="block font-semibold text-slate-700">Filtrar por documento<select value={valor.documento} onChange={e => setValor({ ...valor, documento: e.target.value })} className="mt-2 min-h-11 w-full rounded-lg border border-[#dce5dc] bg-white px-3 text-sm font-normal focus:outline-2 focus:outline-primary"><option value="">Todos os estudantes</option><option value="pei">Com PEI não arquivado</option><option value="plano">Com plano de ação não arquivado</option><option value="sem">Sem PEI e plano não arquivados</option></select><span className="mt-1 block text-xs font-normal text-slate-500">Define quais estudantes entram na contagem, mantendo os demais filtros da tela.</span></label>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Colunas do relatório</p><div className="flex flex-wrap gap-2"><span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">Curso · fixo</span>{camposRelatorio.filter(c => valor.campos.includes(c.id)).map(c => <span key={c.id} className="rounded-lg border border-green-100 bg-white px-3 py-1 text-xs text-green-800">{c.titulo}</span>)}</div></div>
    </fieldset>
  </Modal>;
}
