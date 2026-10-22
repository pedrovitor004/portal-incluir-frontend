export function dataPerfil(value: string | null | undefined, horario = false) {
  if (!value) return "Não informada";
  const data = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(data.getTime()) ? "Não informada" : horario ? data.toLocaleString("pt-BR") : data.toLocaleDateString("pt-BR");
}
export function respostaPerfil(value: unknown): string {
  return value === null || value === undefined || value === "" ? "Não informado" : typeof value === "boolean" ? value ? "Sim" : "Não" : String(value);
}
export function listaPerfil(valores: string[] | undefined, opcoes: { value: string; label: string }[]): string {
  return valores?.length ? valores.map(v => opcoes.find(o => o.value === v)?.label ?? v.toLocaleLowerCase("pt-BR").replaceAll("_", " ")).join("; ") : "Nenhuma opção registrada";
}
