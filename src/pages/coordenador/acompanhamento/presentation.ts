export const campoGestao = "mt-1.5 min-h-11 min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-800 sm:text-sm focus:outline-2 focus:outline-primary disabled:bg-slate-50";
export const dataGestao = (data: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${data}T12:00:00Z`));
