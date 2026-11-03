export function dataPedido(data?: string) {
  if (!data) return 'Não informada';
  const valor = new Date(data);
  return Number.isNaN(valor.getTime()) ? 'Não informada' : valor.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
