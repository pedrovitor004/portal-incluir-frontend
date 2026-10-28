import ResourceIcon from "../icons/ResourceIcon";
import { useNotificacoes } from "../../hooks/useNotificacoes";
import NotificationsList from "../notifications/NotificationsList";
export default function RecentNotifications() {
  const dados = useNotificacoes();
  return <section className="min-w-0 overflow-hidden rounded-xl border border-[#dce5dc] bg-white"><h2 className="flex items-center gap-2 border-b border-slate-100 p-5 text-base font-bold text-slate-800"><ResourceIcon name="bell" />Notificações recentes</h2><NotificationsList dados={dados} /></section>;
}
