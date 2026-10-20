import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { acoesDocumento, type AcaoDocumento } from "../config/documentActions";
import { colorThemes } from "../config/uiThemes";
import { getOverlayToolsHost } from "./overlayTools";
import type { Documento } from "../types/documento";
export async function confirmarAcaoDocumento(acao: AcaoDocumento, documento: Documento): Promise<boolean> {
  const config = acoesDocumento[acao];
  const resultado = await Swal.fire({
    target: getOverlayToolsHost(), titleText: `${config.botao} este documento?`,
    text: `${documento.nome} de ${documento.estudanteNome}. ${config.descricao}`,
    icon: acao === "excluir" ? "warning" : "question",
    iconColor: colorThemes[config.tom]["--accent-main"],
    confirmButtonColor: colorThemes[config.tom]["--accent-main"], cancelButtonColor: "#64748b",
    showCancelButton: true, confirmButtonText: `Sim, ${config.botao.toLowerCase()}`, cancelButtonText: "Cancelar",
    focusCancel: true, allowOutsideClick: false, heightAuto: false,
  });
  return resultado.isConfirmed;
}
