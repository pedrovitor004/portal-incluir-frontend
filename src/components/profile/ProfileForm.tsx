import { useId, useRef, useState, type FormEvent } from "react";
import { validateProfile, serializeProfile } from "./profileValidation";
import type { ProfileAdapter, ProfileData, ProfileErrors, ProfileValues } from "../../types/profile";

type Props = {
  perfil: ProfileData;
  adapter: ProfileAdapter;
  loginEmail: string;
  saving: boolean;
  onSave: (request: ProfileValues) => Promise<void>;
  onCancel: () => void;
};

export default function ProfileForm({ perfil, adapter, loginEmail, saving, onSave, onCancel }: Props) {
  const id = useId();
  const fields = adapter.fields;
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(field => [field.name, perfil.values[field.name] ?? ""])));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxBirthDate = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const validation = validateProfile(draft, fields, todayIso);
    setErrors(validation);
    setSubmitted(true);
    if (Object.keys(validation).length) {
      const first = fields.find(field => validation[field.name]);
      if (first) formRef.current?.querySelector<HTMLInputElement>(`[name="${first.name}"]`)?.focus();
      return;
    }
    await onSave(serializeProfile(draft, fields));
  }

  return (
    <form ref={formRef} noValidate onSubmit={submit} aria-busy={saving}>
      <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        <svg aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m12 3 10 18H2L12 3ZM12 9v5M12 17v1" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div><p className="font-semibold">{adapter.emailChangesLogin ? "Atenção aos seus dados de acesso" : "Esta edição altera somente seu cadastro"}</p><p className="mt-1 text-sm">{adapter.emailChangesLogin ? "Ao alterar o e-mail, você também altera o endereço usado para entrar no sistema. No próximo acesso, use o novo e-mail. Sua senha permanece a mesma." : <>Por enquanto, alterar o e-mail aqui não muda seu acesso ao sistema. Continue entrando com {loginEmail}. Sua senha também permanece a mesma.</>}</p></div>
      </div>
      {Object.keys(errors).length > 0 && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800">Revise os campos destacados abaixo antes de salvar.</p>}
      <p className="mb-5 text-xs text-slate-500">Os campos com * são obrigatórios.</p>
      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2 disabled:opacity-70">
        {fields.map(field => (
          <div key={field.name} className={field.fullWidth ? "sm:col-span-2" : ""}>
            <label htmlFor={`${id}-${field.name}`} className="mb-1.5 block text-sm font-semibold text-slate-700">{field.label}{field.required ? " *" : " (opcional)"}</label>
            <input
              id={`${id}-${field.name}`} name={field.name} type={field.type}
              value={draft[field.name]} required={field.required}
              maxLength={field.maxLength}
              autoComplete={field.autoComplete}
              max={field.type === "date" ? maxBirthDate : undefined}
              pattern={field.type === "tel" ? "[0-9\\(\\)\\+\\s\\-]{8,20}" : field.type === "text" && field.required ? ".*\\S.*" : undefined}
              title={field.type === "tel" ? "Use de 8 a 20 caracteres: números, espaços, parênteses, + ou hífen." : undefined}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={[errors[field.name] ? `${id}-${field.name}-error` : "", field.type === "email" ? `${id}-email-help` : ""].filter(Boolean).join(" ") || undefined}
              onBlur={() => { if (submitted) setErrors(validateProfile(draft, fields, todayIso)); }}
              onChange={event => {
                const next = { ...draft, [field.name]: event.target.value };
                setDraft(next);
                if (submitted) setErrors(validateProfile(next, fields, todayIso));
              }}
              className={`min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-800 outline-none focus:ring-2 ${errors[field.name] ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-[#dce5dc] focus:border-primary focus:ring-primary/20"}`}
            />
            {errors[field.name] && <p id={`${id}-${field.name}-error`} className="mt-1.5 text-xs font-medium text-red-700">{errors[field.name]}</p>}
            {field.type === "email" && <p id={`${id}-email-help`} className="mt-1.5 text-xs leading-relaxed text-slate-500">{adapter.emailChangesLogin ? "Após salvar, use o e-mail informado aqui para entrar no sistema." : <>O e-mail de acesso continua sendo {loginEmail}, mesmo após salvar.</>}</p>}
          </div>
        ))}
      </fieldset>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" disabled={saving} onClick={onCancel} className="min-h-11 rounded-lg border border-[#dce5dc] px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Cancelar edição</button>
        <button type="submit" disabled={saving} className="min-h-11 rounded-lg bg-[#287535] px-5 py-2 font-semibold text-white hover:bg-[#205e2b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60">{saving ? "Salvando…" : "Salvar alterações"}</button>
      </div>
    </form>
  );
}
