import { useState, type FormEvent } from "react";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import type { RegistroAcompanhamento } from "../../../types/gestaoAcompanhamento";

import { campoGestao, dataGestao } from "./presentation";

export default function RecordDialog({ registro, modo, onClose, onSave, onNotify }: {
  registro: RegistroAcompanhamento; modo: "detalhes" | "editar" | "notificar";
  onClose: () => void; onSave: (registro: RegistroAcompanhamento) => void; onNotify: (mensagem: string) => void;
}) {
  const [rascunho, setRascunho] = useState({ ...registro });
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const adaptacao = registro.tipo === "adaptacao";
  const editavel = modo === "editar";
  const formId = `registro-${registro.id}`;
  function salvar(event: FormEvent) {
    event.preventDefault();
    if (modo === "notificar") {
      if (!mensagem.trim()) { setErro("Descreva a orientação ou solicitação antes de continuar."); return; }
      onNotify(mensagem.trim());
    } else {
      if (![rascunho.titulo, rascunho.descricao, rascunho.conteudo].every(valor => valor.trim())) { setErro("Preencha os campos obrigatórios com o conteúdo do registro."); return; }
      onSave({ ...rascunho, titulo: rascunho.titulo.trim(), descricao: rascunho.descricao.trim(), conteudo: rascunho.conteudo.trim() });
    }
  }
  const campos = [
    ["titulo", "Título", true],
    ["descricao", adaptacao ? "Adaptação pedagógica e estratégia utilizada" : "Descrição do atendimento / ocorrência", true],
    ["conteudo", adaptacao ? "Conteúdo acadêmico trabalhado" : "Aula, local e horário", true],
    ["recursos", "Recursos e materiais utilizados", false],
    ["resultado", adaptacao ? "Resultados e próximos passos" : "Encaminhamentos e acompanhamento", false],
  ] as const;
  return <Modal open onClose={onClose} size="wide" title={modo === "notificar" ? "Notificar responsável" : editavel ? "Editar registro" : adaptacao ? "Adaptação e conteúdo acadêmico" : "Detalhes do atendimento"}
    description={`${registro.estudante} · ${registro.matricula} · ${registro.responsavel}`}
    footer={modo === "detalhes" ? undefined : <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form={formId}>{modo === "notificar" ? "Simular notificação" : "Salvar na prévia"}</Button></div>}>
    {modo === "notificar" ? <form id={formId} onSubmit={salvar} className="space-y-4">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Prévia para {registro.responsavel}. Esta mensagem não será entregue ao profissional.</p>
      <label className="block font-semibold">Orientação ou solicitação<textarea required maxLength={2000} rows={5} className={campoGestao} value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Descreva o que precisa ser revisado ou acompanhado." /></label>
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
    </form> : <form id={formId} onSubmit={salvar} className="space-y-5">
      <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">{[["Estudante", registro.estudante], ["Curso", registro.curso], [adaptacao ? "Professor" : "Profissional", registro.responsavel], [adaptacao ? "Disciplina" : "Área", registro.area], ["Data do registro", dataGestao(registro.data)], ["Situação", registro.situacao]].map(([label, valor]) => <div key={label} className="min-w-0 break-words"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{valor}</p></div>)}</div>
      {campos.map(([chave, titulo, obrigatorio]) => editavel ? <label key={chave} className="block font-semibold">{titulo}{obrigatorio ? " *" : ""}{chave === "titulo" ? <input required maxLength={160} className={campoGestao} value={rascunho[chave]} onChange={e => setRascunho({ ...rascunho, [chave]: e.target.value })} /> : <textarea required={obrigatorio} maxLength={4000} rows={3} className={campoGestao} value={rascunho[chave]} onChange={e => setRascunho({ ...rascunho, [chave]: e.target.value })} />}</label> : <section key={chave}><h3 className="font-semibold text-slate-800">{titulo}</h3><p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{registro[chave] || "Não informado"}</p></section>)}
      {editavel && <p className="text-xs text-slate-500">* Campos obrigatórios. Alterações ficam apenas nesta prévia.</p>}
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
    </form>}
  </Modal>;
}
