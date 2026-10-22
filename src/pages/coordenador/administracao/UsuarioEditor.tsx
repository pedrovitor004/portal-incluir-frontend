import { areasEquipe } from "../../../config/profissionais";
import ProfessionalCoursesField from "../../../components/common/ProfessionalCoursesField";
import { useRef, useState } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import { UsersIcon } from "../../../components/icons/AppIcons";
import { accessProfiles } from "../../../config/access";
import { usuariosService, type UsuarioGerenciado } from "../../../services/usuariosService";
import { confirmarUsuario } from "../../../services/usuarioConfirmation";
import { mensagemErro } from "../../../services/apiError";
import { notificationService } from "../../../services/notificationService";
export default function UsuarioEditor({ usuario, onClose, onSave }: { usuario: UsuarioGerenciado; onClose: () => void; onSave: (usuario: UsuarioGerenciado) => void }) {
  const [dados, setDados] = useState<Record<string, string | null>>({ ...usuario.dados, email: usuario.email });
  const [cursosAtuacao, setCursosAtuacao] = useState<string[]>(usuario.cursosAtuacao ?? []);
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState("");
  const pendente = useRef(false);
  const campos = [{ key: "nome", label: "Nome completo", max: 150, required: true }, { key: "email", label: "E-mail de login", type: "email", max: 150, required: true }, { key: "matricula", label: "Matrícula", max: 30, required: true }, { key: "telefone", label: "Telefone", max: 20 }, { key: "dataNascimento", label: "Data de nascimento", type: "date" }, { key: "setor", label: "Setor", max: 120, required: true }, ...(usuario.perfil === "PROFESSOR" ? [{ key: "disciplina", label: "Disciplina (opcional)", max: 120, required: false }] : [{ key: "cargo", label: "Cargo", max: 120, required: true }]), ...(usuario.perfil === "EQUIPE_MULTIDISCIPLINAR" ? [{ key: "areaAtuacao", label: "Área de atuação", max: 100, required: true }, { key: "conselhoProfissional", label: "Conselho profissional", max: 30 }, { key: "registroProfissional", label: "Registro profissional", max: 50 }] : [])];
  async function salvar(event: React.FormEvent) {
    event.preventDefault(); if (pendente.current) return;
    if (usuario.perfil === "PROFESSOR" && !cursosAtuacao.length) { setErro("Selecione o curso de atuação."); return; }
    pendente.current = true; setBusy(true); setErro("");
    try {
      const mudouEmail = dados.email?.trim().toLowerCase() !== usuario.email;
      if (!await confirmarUsuario("Salvar alterações do usuário?", `${usuario.nome}. Os dados cadastrais serão atualizados.${mudouEmail ? ` O próximo acesso deverá ser feito com o e-mail ${dados.email}. A senha será mantida.` : ""}`)) return;
      const atualizado = await usuariosService.editar(usuario.id, { ...dados, dataNascimento: dados.dataNascimento || null, ...(usuario.perfil === "PROFESSOR" ? { cursosAtuacao } : {}) });
      onSave(atualizado); notificationService.success("Dados do usuário atualizados.");
    } catch (error) { setErro(mensagemErro(error)); }
    finally { pendente.current = false; setBusy(false); }
  }
  return <Modal open size="wide" busy={busy} onClose={onClose} title="Editar usuário" description={`${usuario.nome} · ${accessProfiles[usuario.perfil].label}`} icon={<UsersIcon className="h-7 w-7" />} footer={<div className="flex gap-3"><Button variant="secondary" disabled={busy} onClick={onClose}>Cancelar</Button><Button type="submit" form="editar-usuario" disabled={busy}>{busy ? "Aguarde..." : "Salvar alterações"}</Button></div>}>
    <p className="mb-5 rounded-xl border border-green-100 bg-green-50 p-4 text-sm text-green-900">O e-mail de login será atualizado junto ao cadastro. Confira o endereço antes de salvar e informe a pessoa sobre a mudança.</p>
    {erro && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-red-800">{erro}</p>}
    <form id="editar-usuario" onSubmit={event => void salvar(event)}><fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">{campos.map(campo => <label key={campo.key} className={`text-sm font-medium text-slate-600 ${campo.key === "nome" || campo.key === "email" ? "sm:col-span-2" : ""}`}>{campo.label}{campo.required && " *"}{campo.key === "areaAtuacao" ? <select required value={dados.areaAtuacao ?? ""} onChange={event => setDados(atual => ({ ...atual, areaAtuacao: event.target.value }))} className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-800"><option value="">Selecione uma área</option>{dados.areaAtuacao && !areasEquipe.includes(dados.areaAtuacao) && <option value={dados.areaAtuacao}>{dados.areaAtuacao} (cadastro atual)</option>}{areasEquipe.map(area => <option key={area} value={area}>{area}</option>)}</select> : <input className="mt-1.5 min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100" type={campo.type ?? "text"} maxLength={campo.max} required={campo.required} value={dados[campo.key] ?? ""} onChange={event => setDados(atual => ({ ...atual, [campo.key]: event.target.value }))} />}</label>)}{usuario.perfil === "PROFESSOR" && <ProfessionalCoursesField value={cursosAtuacao} onChange={setCursosAtuacao} disabled={busy} />}</fieldset></form>
  </Modal>;
}
