import { useState } from "react";

type Props = { name: string; label: string; autoComplete: "current-password" | "new-password"; placeholder?: string; invalid?: boolean; describedBy?: string };

export default function PasswordField({ name, label, autoComplete, placeholder, invalid, describedBy }: Props) {
  const [visible, setVisible] = useState(false);
  const id = `field-${name}`;
  return <div className="flex min-w-0 flex-col gap-2">
    <label htmlFor={id} className="text-sm font-semibold text-primary">{label}</label>
    <div className="password-control">
      <input id={id} name={name} type={visible ? "text" : "password"} required
        minLength={autoComplete === "new-password" ? 6 : undefined} maxLength={autoComplete === "new-password" ? 72 : undefined}
        autoComplete={autoComplete} placeholder={placeholder} aria-invalid={invalid || undefined} aria-describedby={describedBy}
        className="h-12 min-w-0 w-full rounded-lg border border-emerald-300 bg-white pl-3 pr-12 text-sm text-slate-700 placeholder:text-slate-500 focus:border-primary" />
      <button type="button" aria-controls={id} aria-label={`${visible ? "Ocultar" : "Mostrar"} ${label.toLowerCase()}`} aria-pressed={visible}
        title={visible ? "Ocultar senha" : "Mostrar senha"}
        onClick={() => setVisible(value => !value)} className="password-toggle">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />
          {visible && <path d="m3 3 18 18" />}
        </svg>
      </button>
    </div>
  </div>;
}
