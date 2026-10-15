import type { MenuItem } from "./menu";

const iconColors: Record<string, string> = {
  dashboard: "bg-[#ef4444]",
  estudantes: "bg-[#0ea5e9]",
  "plano-acao": "bg-[#facc15]",
  anamnese: "bg-[#4ade80]",
  pei: "bg-[#facc15]",
  documentos: "bg-[#315b4a]",
  relatorios: "bg-[#facc15]",
  usuarios: "bg-[#7c648c]",
};

export default function MenuIconBadge({ item }: { item: MenuItem }) {
  const Icon = item.icon;
  const slug = item.path.split("/").pop() ?? "";
  return (
    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-white ${iconColors[slug] ?? "bg-[#0ea5e9]"}`}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}
