import LoadingState from "../common/LoadingState";
import { useEffect, useState } from "react";
import Modal from "../common/Modal";
import { useAuth } from "../../hooks/useAuth";
import { accessProfiles } from "../../config/access";
import { profileService } from "../../services/profileService";
import type { ProfileAdapter } from "../../types/profile";
import { mensagemErro } from "../../services/apiError";
import { notificationService } from "../../services/notificationService";
import type { Usuario } from "../../types/auth";
import type { ProfileData, ProfileValues } from "../../types/profile";
import ProfileForm from "./ProfileForm";

type Props = { adapter: ProfileAdapter; usuario: Usuario; initialEditing: boolean; onClose: () => void };

export default function ProfileModal({ adapter, usuario, initialEditing, onClose }: Props) {
  const { atualizarDadosPerfil } = useAuth();
  const [perfil, setPerfil] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(initialEditing);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    profileService.read(usuario.perfil, usuario.perfilId, controller.signal)
      .then(data => { if (!controller.signal.aborted) setPerfil(data); })
      .catch(error => { if (!controller.signal.aborted) setLoadError(mensagemErro(error)); });
    return () => controller.abort();
  }, [usuario.perfil, usuario.perfilId, attempt]);

  async function save(request: ProfileValues) {
    setSaving(true);
    setSaveError("");
    setSuccess(false);
    try {
      const updated = await profileService.update(usuario.perfil, usuario.perfilId, request);
      setPerfil(updated);
      atualizarDadosPerfil(usuario.perfil, usuario.perfilId, { nome: updated.values.nome ?? usuario.nome, ...(adapter.emailChangesLogin && updated.values.email ? { email: updated.values.email } : {}) });
      setEditing(false);
      setSuccess(true);
      notificationService.success("Seus dados foram atualizados!");
    } catch (error) {
      setSaveError(mensagemErro(error));
    } finally {
      setSaving(false);
    }
  }

  const details = perfil ? [
    ["Perfil de acesso", accessProfiles[usuario.perfil].label],
    ...adapter.fields.map(field => {
      const value = perfil.values[field.name];
      return [field.label, field.type === "date" && value ? value.split("-").reverse().join("/") : value];
    }),
    ["Situação", perfil.active ? "Ativo" : "Inativo"],
  ] : [];

  return (
    <Modal position="top" size="wide" open onClose={() => { if (!saving) onClose(); }} busy={saving} title={editing ? "Editar meus dados" : "Meu perfil"} description="Consulte e mantenha suas informações de cadastro atualizadas.">
      {loadError ? <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800"><p>{loadError}</p><button type="button" onClick={() => { setLoadError(""); setAttempt(value => value + 1); }} className="mt-3 min-h-11 rounded-lg bg-white px-4 py-2 font-semibold">Tentar novamente</button></div>
        : !perfil ? <LoadingState label="Carregando seus dados..." />
        : <>
          {saving && <LoadingState compact label="Salvando seus dados..." />}
          {success && <p role="status" className="mb-4 rounded-lg bg-green-50 p-3 text-green-800">Dados atualizados com sucesso.</p>}
          {saveError && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">{saveError}</p>}
          {editing ? <ProfileForm adapter={adapter} perfil={perfil} loginEmail={usuario.email} saving={saving} onSave={save} onCancel={() => { setEditing(false); setSaveError(""); }} />
            : <>
              <dl className="grid gap-3 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-xl bg-[#f5f8f4] p-4"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-[#26332b]">{value || "Não informado"}</dd></div>)}</dl>
              <button type="button" onClick={() => { setEditing(true); setSuccess(false); }} className="mt-5 min-h-11 w-full rounded-lg bg-[#287535] px-5 py-3 font-semibold text-white hover:bg-[#205e2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Editar meus dados</button>
            </>}
        </>}
    </Modal>
  );
}
