import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import { useAuth } from "../../../hooks/useAuth";
import { canAccess } from "../../../config/access";
import { conteudosAcademicosService as api } from "../../../services/conteudosAcademicosService";
import { estudantesService } from "../../../services/estudantesService";
import { vinculosEstudanteService } from "../../../services/vinculosEstudanteService";
import { mensagemErro } from "../../../services/apiError";
import { confirmarUsuario } from "../../../services/usuarioConfirmation";
import type { ConteudoAcademicoResponse } from "../../../types/conteudoAcademico";
import type { EstudanteResponse } from "../../../types/estudante";
import { campoConteudo, tiposConteudo } from "./apresentacao";
import { formatosArquivo, formularioInicial, limitesConteudo, prepararRequest, validarFormulario, type OrigemConteudo } from "./formulario";

type Props = { id?: number; professorId: number; onClose: () => void; onAlterado: () => void; onSalvo: () => void };

function Formulario({ original: inicial, professorId, onClose, onAlterado, onSalvo }: Omit<Props, "id"> & { original?: ConteudoAcademicoResponse }) {
  const { usuario } = useAuth();
  const [original, setOriginal] = useState(inicial);
  const [form, setForm] = useState(() => formularioInicial(inicial));
  const [origem, setOrigem] = useState<OrigemConteudo>(inicial?.arquivoNome ? "arquivo" : inicial?.link ? "link" : "texto");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [estudantes, setEstudantes] = useState<EstudanteResponse[]>([]);
  const [carregandoEstudantes, setCarregandoEstudantes] = useState(!inicial && !!usuario && canAccess(usuario, "estudantes.consultar"));
  const [erroEstudantes, setErroEstudantes] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const operando = useRef(false);
  const formId = useId();
  useEffect(() => {
    if (inicial || !usuario || !canAccess(usuario, "estudantes.consultar")) return;
    let ativo = true;
    estudantesService.listarTodos().then(dados => { if (ativo) setEstudantes(dados.filter(e => !e.concluido)); })
      .catch((e: unknown) => { if (ativo) setErroEstudantes(mensagemErro(e)); })
      .finally(() => { if (ativo) setCarregandoEstudantes(false); });
    return () => { ativo = false; };
  }, [inicial, usuario]);

  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (operando.current) return;
    const novosErros = validarFormulario(form, origem, arquivo, original);
    if (!original && form.estudanteId && !estudantes.some(e => String(e.id) === form.estudanteId)) novosErros.estudanteId = "Selecione um estudante disponível.";
    setErros(novosErros); setErro("");
    if (Object.keys(novosErros).length) return;
    operando.current = true; setOcupado(true);
    let metadadosSalvos = false;
    try {
      if (!usuario || usuario.perfil !== "PROFESSOR" || usuario.perfilId !== professorId || !canAccess(usuario, "academico.gerar")) { setErro("Sua sessão não permite salvar este material."); return; }
      if (!original && form.estudanteId) {
        const vinculos = await vinculosEstudanteService.listar(Number(form.estudanteId));
        if (!vinculos.some(v => v.ativo && v.profissional.perfil === "PROFESSOR" && v.profissional.perfilId === professorId)) { setErro("É necessário vínculo de acompanhamento ativo com o estudante selecionado."); return; }
      }
      const request = prepararRequest(form, origem, original);
      if (original) {
        const atualizado = await api.atualizar(original.id, { ...request, versao: original.versao });
        setOriginal(atualizado); metadadosSalvos = true;
        if (origem === "arquivo" && arquivo) {
          const comArquivo = await api.enviarArquivo(atualizado.id, atualizado.versao, arquivo);
          setOriginal(comArquivo);
        }
      } else if (origem === "arquivo" && arquivo) await api.criarComArquivo(request, arquivo);
      else await api.criar(request);
      onSalvo();
    } catch (e) {
      setErro(metadadosSalvos ? `Os dados do material foram salvos, mas o anexo não foi atualizado. Seus campos e arquivo selecionado foram preservados para tentar novamente. ${mensagemErro(e)}` : mensagemErro(e));
      if (metadadosSalvos) onAlterado();
    } finally { operando.current = false; setOcupado(false); }
  }

  async function removerAnexo() {
    if (!original?.arquivoNome || operando.current) return;
    operando.current = true; setOcupado(true); setErro("");
    try {
      if (!await confirmarUsuario("Remover o anexo?", "O arquivo atual será removido imediatamente. Essa operação não será desfeita ao cancelar a edição.", true)) return;
      const atualizado = await api.removerArquivo(original.id, original.versao);
      setOriginal(atualizado); setArquivo(null); setOrigem("texto"); onAlterado();
    } catch (e) { setErro(mensagemErro(e)); }
    finally { operando.current = false; setOcupado(false); }
  }
  const erroCampo = (campo: string) => erros[campo] ? <p id={`${formId}-${campo}-erro`} className="mt-1 text-xs text-red-700">{erros[campo]}</p> : null;
  return <Modal open onClose={onClose} busy={ocupado} size="wide" title={original ? "Editar material" : "Adicionar conteúdo"} description="Conteúdo acadêmico adaptado"
    footer={<div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row"><Button variant="secondary" disabled={ocupado} onClick={onClose}>Cancelar</Button><Button type="submit" form={formId} disabled={ocupado}>{ocupado ? "Salvando..." : original ? "Salvar alterações" : "Cadastrar material"}</Button></div>}>
    <form id={formId} onSubmit={salvar} noValidate className="space-y-5">
      <div className="rounded-xl bg-slate-50 p-4 text-sm"><p className="font-semibold">Professor responsável</p><p className="mt-1">{inicial?.professorNome || usuario?.nome}</p><p className="mt-2 text-xs text-slate-500">A autoria é identificada pela sessão autenticada.</p></div>
      <fieldset disabled={ocupado} className="space-y-5">
        {([['titulo', 'Título', 1], ['componenteCurricular', 'Componente curricular', 1], ['descricao', 'Descrição do material', 4], ['orientacoesAdaptacao', 'Orientações de adaptação (opcional)', 4]] as const).map(([campo, label, rows]) => <label key={campo} className="block text-sm font-semibold text-slate-700">{label}{campo !== "orientacoesAdaptacao" && " *"}
          {rows === 1 ? <input className={campoConteudo} value={form[campo]} maxLength={limitesConteudo[campo]} required onChange={e => setForm({ ...form, [campo]: e.target.value })} aria-invalid={!!erros[campo]} aria-describedby={erros[campo] ? `${formId}-${campo}-erro` : undefined} /> : <textarea className={campoConteudo} rows={rows} value={form[campo]} maxLength={limitesConteudo[campo]} required={campo !== "orientacoesAdaptacao"} onChange={e => setForm({ ...form, [campo]: e.target.value })} aria-invalid={!!erros[campo]} aria-describedby={erros[campo] ? `${formId}-${campo}-erro` : undefined} />}
          <span className="mt-1 block text-xs font-normal text-slate-500">{form[campo].length}/{limitesConteudo[campo]} caracteres</span>{erroCampo(campo)}
        </label>)}
        <label className="block text-sm font-semibold text-slate-700">Tipo *<select className={campoConteudo} value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as typeof form.tipo })}>{Object.entries(tiposConteudo).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{erroCampo("tipo")}</label>
        {inicial ? <div className="rounded-xl bg-slate-50 p-4"><p className="font-semibold">Estudante</p><p className="mt-1">{inicial.estudanteId === null ? "Sem estudante associado · Material reutilizável" : `${inicial.estudanteNome} · ${inicial.estudanteMatricula}`}</p><p className="mt-2 text-xs text-slate-500">A associação original é mantida durante a edição.</p></div> : <label className="block text-sm font-semibold text-slate-700">Estudante (opcional)<select disabled={carregandoEstudantes || !!erroEstudantes} className={campoConteudo} value={form.estudanteId} onChange={e => setForm({ ...form, estudanteId: e.target.value })}><option value="">Sem estudante · Material reutilizável</option>{estudantes.map(e => <option key={e.id} value={e.id}>{e.nomeCompleto} · Matrícula {e.matricula}</option>)}</select><span className="mt-1 block text-xs font-normal text-slate-500">A associação exige vínculo ativo de acompanhamento. Você também pode cadastrar sem estudante.</span>{carregandoEstudantes && <span role="status" className="mt-2 block text-xs">Carregando estudantes...</span>}{erroEstudantes && <span role="alert" className="mt-2 block text-xs text-red-700">Não foi possível consultar estudantes. {erroEstudantes} O cadastro sem estudante continua disponível.</span>}{erroCampo("estudanteId")}</label>}
        <label className="block text-sm font-semibold text-slate-700">Origem do material<select className={campoConteudo} value={origem} onChange={e => { setOrigem(e.target.value as OrigemConteudo); setArquivo(null); }}><option value="texto" disabled={!!original?.arquivoNome}>Somente texto</option><option value="link" disabled={!!original?.arquivoNome}>Link</option><option value="arquivo">Arquivo</option></select></label>
        {origem === "link" && <label className="block text-sm font-semibold text-slate-700">Link *<input type="url" className={campoConteudo} maxLength={2000} value={form.link} placeholder="https://" onChange={e => setForm({ ...form, link: e.target.value })} aria-invalid={!!erros.link} />{erroCampo("link")}</label>}
        {origem === "arquivo" && <div className="space-y-3">{original?.arquivoNome && <div className="rounded-xl border border-slate-200 p-3"><p className="break-words text-sm">Anexo atual: {original.arquivoNome}</p><Button variant="soft" className="mt-2" onClick={() => void removerAnexo()}>Remover anexo atual</Button><p className="mt-2 text-xs text-slate-500">Para usar link ou somente texto, remova primeiro o anexo.</p></div>}<label className="block text-sm font-semibold text-slate-700">{original?.arquivoNome ? "Substituir arquivo (opcional)" : "Arquivo *"}<input key={`${origem}-${original?.arquivoNome ?? "novo"}`} type="file" accept={formatosArquivo} className={campoConteudo} onChange={e => setArquivo(e.target.files?.[0] ?? null)} aria-invalid={!!erros.arquivo} /><span className="mt-1 block text-xs font-normal text-slate-500">PDF, DOCX, TXT, PNG ou JPEG, até 10 MB. O formato também será validado pelo servidor.</span>{erroCampo("arquivo")}</label></div>}
      </fieldset>
      {Object.keys(erros).length > 0 && <p role="alert" className="text-sm text-red-700">Confira os campos destacados antes de salvar.</p>}
      {erro && <p role="alert" className="whitespace-pre-wrap text-sm text-red-700">{erro}</p>}
      <p className="text-xs text-slate-500">* Campos obrigatórios.</p>
    </form>
  </Modal>;
}

export default function ConteudoFormModal(props: Props) {
  const [original, setOriginal] = useState<ConteudoAcademicoResponse | null>(null);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  useEffect(() => {
    if (props.id === undefined) return;
    const controller = new AbortController();
    api.buscarPorId(props.id, controller.signal).then(material => {
      if (controller.signal.aborted) return;
      if (material.id !== props.id || material.professorId !== props.professorId) { setErro("Material indisponível para este professor."); return; }
      setOriginal(material);
    }).catch((e: unknown) => { if (!controller.signal.aborted) setErro(mensagemErro(e)); });
    return () => controller.abort();
  }, [props.id, props.professorId, tentativa]);
  if (props.id === undefined || original) return <Formulario {...props} original={original ?? undefined} />;
  return <Modal open onClose={props.onClose} size="wide" title="Editar material">{erro ? <div role="alert" className="space-y-3"><p className="text-red-700">{erro}</p><Button variant="secondary" onClick={() => { setErro(""); setTentativa(t => t + 1); }}>Tentar novamente</Button></div> : <LoadingState compact label="Carregando material para edição..." />}</Modal>;
}
