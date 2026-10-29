import Swal, { type SweetAlertOptions } from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { getOverlayToolsHost } from "./overlayTools";
import { fluxoEstudanteService, type EtapaFluxo } from "./fluxoEstudanteService";
import { nomesEtapas, permissoesEtapa } from "./fluxoEstudanteValidation";
import { permissionCatalog } from "../config/permissionCatalog";
import { mensagemErro } from "./apiError";
import { mensagemErroFluxo } from "./fluxoEstudanteError";

export function alertaFluxo(opcoes: SweetAlertOptions) {
  return Swal.fire({ target: getOverlayToolsHost(), heightAuto: false, allowOutsideClick: false, focusCancel: true, confirmButtonColor: "#287535", cancelButtonColor: "#64748b", confirmButtonText: "Entendi", cancelButtonText: "Cancelar", ...opcoes });
}

export async function oferecerEncaminhamento(pendencias: string[], podeAtribuir: boolean): Promise<boolean> {
  const resultado = await alertaFluxo({
    titleText: "Ainda há campos obrigatórios pendentes",
    text: `${pendencias.join("; ")}. ${podeAtribuir ? "Deseja destinar esta tarefa a um profissional específico? O preenchimento será salvo como rascunho e a etapa continuará pendente." : "Preencha os campos indicados para concluir esta etapa."}`,
    icon: "warning", showCancelButton: podeAtribuir,
    confirmButtonText: podeAtribuir ? "Sim, escolher profissional" : "Continuar preenchendo", cancelButtonText: "Continuar preenchendo",
  });
  return podeAtribuir && resultado.isConfirmed;
}

export async function encaminharEtapa(estudanteId: number, etapa: EtapaFluxo, base: string, planoId?: number): Promise<boolean> {
  try {
    const profissionais = await fluxoEstudanteService.candidatos(estudanteId);
    if (!profissionais.length) { await alertaFluxo({ titleText: "Nenhum profissional disponível", text: "Cadastre ou ative um profissional antes de encaminhar a tarefa.", icon: "info" }); return false; }
    const conteudo = document.createElement("div"); conteudo.className = "space-y-4 text-left text-sm";
    const label = document.createElement("label"); label.textContent = "Profissional responsável"; label.className = "block font-semibold";
    const select = document.createElement("select"); select.className = "mt-2 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal";
    select.append(new Option("Selecione um profissional", ""));
    profissionais.forEach(p => select.append(new Option(p.nome, String(p.usuarioId)))); label.append(select);
    const aviso = document.createElement("p"); aviso.setAttribute("role", "status"); aviso.className = "rounded-lg bg-amber-50 p-3 text-sm text-amber-900"; aviso.hidden = true;
    const link = document.createElement("a"); link.textContent = "Abrir permissões em outra aba"; link.target = "_blank"; link.rel = "noopener noreferrer"; link.className = "block font-semibold text-green-800 underline"; link.hidden = true;
    const mensagemLabel = document.createElement("label"); mensagemLabel.textContent = "Mensagem ao profissional"; mensagemLabel.className = "block font-semibold";
    const mensagem = document.createElement("textarea"); mensagem.maxLength = 2000; mensagem.rows = 4; mensagem.placeholder = "Explique o que precisa ser preenchido para concluir esta etapa."; mensagem.className = "mt-2 w-full rounded-lg border border-slate-300 p-3 text-sm font-normal"; mensagemLabel.append(mensagem);
    function faltantes() { const p = profissionais.find(p => p.usuarioId === Number(select.value)); return p ? permissoesEtapa[etapa].filter(c => !p.permissoes?.includes(c)) : []; }
    select.addEventListener("change", () => {
      const permissoes = faltantes(); aviso.hidden = !permissoes.length; link.hidden = !permissoes.length;
      aviso.textContent = `Conceda primeiro as permissões e depois atribua a tarefa: ${permissoes.map(c => permissionCatalog.find(p => p.codigo === c)?.nome ?? c).join(", ")}. Após salvar os acessos, cancele e abra novamente esta seleção para atualizar a consulta.`;
      link.href = `${base}/administracao/permissoes?usuario=${select.value}`;
    });
    conteudo.append(label, aviso, link, mensagemLabel);
    const resultado = await alertaFluxo({
      titleText: `Encaminhar ${nomesEtapas[etapa]}`, html: conteudo, icon: "question", showCancelButton: true,
      confirmButtonText: "Atribuir e enviar notificação", showLoaderOnConfirm: true,
      allowEscapeKey: () => !Swal.isLoading(),
      preConfirm: async () => {
        if (!select.value) { Swal.showValidationMessage("Selecione um profissional."); return false; }
        if (faltantes().length) { Swal.showValidationMessage("Conceda as permissões indicadas antes de atribuir a tarefa."); return false; }
        if (!mensagem.value.trim()) { Swal.showValidationMessage("Adicione uma mensagem ao profissional."); return false; }
        try { await fluxoEstudanteService.atribuir(estudanteId, etapa, Number(select.value), mensagem.value.trim(), planoId); return true; }
        catch (erro) { Swal.showValidationMessage(mensagemErro(erro)); return false; }
      },
    });
    if (resultado.isConfirmed) await alertaFluxo({ titleText: "Tarefa encaminhada", text: "O profissional foi atribuído e receberá a mensagem nas notificações do portal. A etapa permanece pendente até ser concluída.", icon: "success" });
    return resultado.isConfirmed;
  } catch (erro) { await alertaFluxo({ titleText: "Não foi possível encaminhar a tarefa", text: mensagemErroFluxo(erro), icon: "error" }); return false; }
}
