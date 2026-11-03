import LoadingState from "../common/LoadingState";
import Button from "../common/Button";
export default function ConsultaPeaState({ carregando, erro, onRetry }: { carregando: boolean; erro: string; onRetry: () => void }) {
  if (carregando) return <LoadingState label="Consultando solicitações de PEA..." />;
  if (erro) return <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-800"><p>{erro}</p><Button variant="secondary" onClick={onRetry}>Tentar novamente</Button></div>;
  return null;
}
