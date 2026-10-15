import { useState } from "react";
import Modal from "../../../components/common/Modal";
import ResourceIcon from "../../../components/icons/ResourceIcon";
import type { EstudanteResumo } from "../../../types/dashboard";

function GraduationCapIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l9-5-9-5-9 5 9 5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
      />
    </svg>
  );
}


type Props = { students: EstudanteResumo[]; loaded: boolean };

export default function RecentStudents({ students, loaded }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EstudanteResumo | null>(null);
  return (
    <>
    <section className="min-w-0 rounded-md border border-[#dce5dc] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-1 pb-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#26332b]">
          <span className="text-primary"><ResourceIcon name="students" /></span>
          Últimos estudantes cadastrados na instituição
        </h2>

        <button
          type="button"
          onClick={() => { setSelected(null); setOpen(true); }}
          aria-haspopup="dialog"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[#dce5dc] px-3 py-2 text-xs font-semibold text-primary transition hover:bg-[#edf7ee] focus:outline-none focus:ring-2 focus:ring-primary"
        >
          Ver estudantes recentes
          <GraduationCapIcon />
        </button>
      </div>

      <div className="mt-3 space-y-1">
        {loaded && students.length === 0 && <p className="p-3 text-sm text-slate-500">Nenhum estudante cadastrado.</p>}
        {students.map((student, index) => (
          <button
            type="button"
            onClick={() => { setSelected(student); setOpen(true); }}
            aria-haspopup="dialog"
            aria-label={`Ver dados de ${student.nome}`}
            key={student.id}
            className={`grid w-full cursor-pointer grid-cols-1 items-center gap-2 rounded-md px-3 py-3 text-left transition hover:bg-[#a8f5b3] focus-visible:outline-2 focus-visible:outline-primary sm:grid-cols-[minmax(100px,1fr)_minmax(90px,1fr)] sm:gap-3 sm:px-4 xl:grid-cols-[minmax(100px,1fr)_minmax(90px,1fr)_minmax(135px,1fr)] ${index % 2 ? "bg-[#b8ffbf]" : "bg-white"}`}
          >
            <span className="truncate text-xs font-semibold text-[#26332b]">
              {student.nome}
              <span className="mt-1 block text-xs font-medium text-primary">Ver dados →</span>
            </span>

            <span className="truncate text-xs text-slate-500">
              {student.curso}
            </span>

            <span className="flex flex-wrap items-center gap-2">
              <span className="max-w-full truncate rounded-full bg-[#e6f5e8] px-2.5 py-1 text-[10px] font-semibold text-primary">
                {student.matricula}
              </span>

              <span className={`inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[10px] font-semibold ${student.ativo ? "bg-[#e6f5e8] text-[#226b32]" : "bg-[#fff5d6] text-[#805b00]"}`}>
                <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                {student.ativo ? "Ativo" : "Inativo"}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
    <Modal open={open} onClose={() => setOpen(false)} title={selected ? "Dados do estudante" : "Estudantes recentes"} description={selected ? "Resumo do cadastro disponível neste painel." : "Estes são os cadastros recentes enviados ao painel, não a lista completa da instituição."}>
      {!loaded ? <p className="rounded-xl bg-slate-50 p-5">Os dados ainda não estão disponíveis. Volte ao painel para acompanhar o carregamento.</p> : selected ? <dl className="grid gap-4 sm:grid-cols-2">{[["Nome", selected.nome], ["Curso", selected.curso], ["Matrícula", selected.matricula], ["Situação do cadastro", selected.ativo ? "Ativo" : "Inativo"]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#f5f8f4] p-4"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-[#26332b]">{value || "Não informado"}</dd></div>)}</dl> : students.length ? <ul className="space-y-2">{students.map(student => <li key={student.id}><button type="button" onClick={() => setSelected(student)} className="flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-[#f5f8f4] p-4 text-left hover:bg-[#e8f5e9] focus-visible:outline-2 focus-visible:outline-primary"><span><span className="block font-semibold">{student.nome}</span><span className="text-xs text-slate-500">{student.curso || "Curso não informado"}</span></span><span className="shrink-0 text-xs font-semibold text-primary">Ver dados →</span></button></li>)}</ul> : <p className="rounded-xl bg-[#f5f8f4] p-5">Nenhum estudante recente foi informado no painel.</p>}
    </Modal>
    </>
  );
}
