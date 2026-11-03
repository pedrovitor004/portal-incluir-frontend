import { useCallback } from "react";
import { adaptacoesPedagogicasService } from "../../services/adaptacoesPedagogicasService";
import { mapearPea } from "../../services/documentosService";
import { useConsultaPea } from "../../hooks/useConsultaPea";
import DocumentDetails from "../../pages/coordenador/documentos/components/DocumentDetails";
import ConsultaPeaState from "./ConsultaPeaState";
import Modal from "../common/Modal";
export default function PeaEntregueModal({ id, onClose, titulo = "PEA entregue por solicitação" }: { id: number; onClose: () => void; titulo?: string }) {
  const consultar = useCallback((signal: AbortSignal) => adaptacoesPedagogicasService.buscarPorId(id, signal), [id]);
  const consulta = useConsultaPea(consultar);
  return <Modal open onClose={onClose} title={titulo} size="wide">
    <ConsultaPeaState rotuloCarregamento="Carregando PEA..." {...consulta} onRetry={consulta.recarregar} />
    {!consulta.carregando && !consulta.erro && consulta.dados && <DocumentDetails documento={mapearPea(consulta.dados)} />}
  </Modal>;
}
