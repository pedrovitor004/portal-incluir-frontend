import { useState } from "react";
import Modal from "../../../components/common/Modal";
import ResourceIcon from "../../../components/icons/ResourceIcon";

export default function RecentNotifications() {
  const [open, setOpen] = useState(false);
  return (
    <>
    <section className="min-w-0 rounded-md border border-[#dce5dc] bg-white p-4 sm:p-5">
      <h2 className="flex items-center gap-2 border-b border-slate-100 px-1 pb-4 text-base font-bold text-[#26332b]">
        <span className="text-sky-600"><ResourceIcon name="bell" /></span>
        Notificações recentes
      </h2>
      <div className="space-y-6 px-1 py-5">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600"><ResourceIcon name="bell" /></span><p className="text-sm leading-relaxed text-slate-500">As notificações ainda não estão disponíveis.</p></div>
        <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"><ResourceIcon name="bell" />Ver detalhes <span aria-hidden="true">→</span></button>
      </div>
    </section>
    <Modal tone="blue" icon={<ResourceIcon name="bell" className="h-8 w-8" />} open={open} onClose={() => setOpen(false)} title="Notificações recentes" description="Um espaço para acompanhar os avisos do portal.">
      <div className="rounded-xl bg-[#f5f8f4] p-5"><h3 className="font-semibold text-[#26332b]">Esta função ainda não está disponível</h3><p className="mt-2 text-slate-600">O painel ainda não recebe notificações. Por isso, não é possível consultar avisos por aqui neste momento.</p></div>
    </Modal>
    </>
  );
}
