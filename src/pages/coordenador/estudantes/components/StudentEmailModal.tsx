import { useState, type FormEvent } from "react";
import Swal from "sweetalert2";
import { colorThemes } from "../../../../config/uiThemes";
import { mensagemErro } from "../../../../services/apiError";
import { emailEstudanteService, emailValido, templateEmailAcompanhamento } from "../../../../services/emailEstudanteService";
import { getOverlayToolsHost } from "../../../../services/overlayTools";
import { notificationService } from "../../../../services/notificationService";
import Button from "../../../../components/common/Button";
import Modal from "../../../../components/common/Modal";

type Props = {
  estudanteId: number;
  nome: string;
  email: string;
  onClose: () => void;
};

export default function StudentEmailModal({ estudanteId, nome, email, onClose }: Props) {
  const templateInicial = templateEmailAcompanhamento(nome);
  const [assunto, setAssunto] = useState(templateInicial.assunto);
  const [mensagem, setMensagem] = useState(templateInicial.mensagem);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enviando) return;
    if (!emailValido(email)) {
      setErro("O estudante não possui um endereço de e-mail válido cadastrado.");
      return;
    }
    if (!assunto.trim() || !mensagem.trim()) {
      setErro("Preencha o assunto e o conteúdo da mensagem.");
      return;
    }

    const confirmacao = await Swal.fire({
      target: getOverlayToolsHost(),
      titleText: "Confirmar envio do e-mail?",
      text: `A mensagem com a logo do Portal Incluir será enviada para ${email}. Revise o destinatário, o assunto e o conteúdo antes de confirmar.`,
      icon: "question",
      iconColor: colorThemes.green["--accent-main"],
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Voltar para revisar",
      confirmButtonColor: colorThemes.green["--accent-main"],
      cancelButtonColor: "#64748b",
      focusCancel: true,
      allowOutsideClick: false,
      heightAuto: false,
    });
    if (!confirmacao.isConfirmed) return;

    setErro("");
    setEnviando(true);
    try {
      await emailEstudanteService.enviar(estudanteId, {
        assunto: assunto.trim(),
        mensagem: mensagem.trim(),
      });
      notificationService.success("E-mail enviado com sucesso!");
      onClose();
    } catch (error) {
      const texto = mensagemErro(error);
      setErro(texto);
      notificationService.error(texto);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Enviar e-mail"
      description={`Revise a mensagem para ${nome}. A logo do Portal Incluir será incluída automaticamente.`}
      busy={enviando}
      size="wide"
      footer={
        <div className="flex w-full flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button variant="secondary" disabled={enviando} onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="student-email-form" disabled={enviando}>
            {enviando ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      }
    >
      <form id="student-email-form" onSubmit={event => void enviar(event)} className="space-y-5">
        <div>
          <label htmlFor="email-destinatario" className="mb-1.5 block text-sm font-semibold text-slate-700">Destinatário</label>
          <input
            id="email-destinatario"
            type="email"
            required
            readOnly
            value={email}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          />
          <p className="mt-1 text-xs text-slate-500">Endereço de e-mail cadastrado para este estudante.</p>
        </div>
        <div>
          <label htmlFor="email-assunto" className="mb-1.5 block text-sm font-semibold text-slate-700">Assunto</label>
          <p className="mb-2 text-xs text-slate-500">Modelo padrão: acompanhamento geral. Você pode editar o assunto e a mensagem.</p>
          <input
            id="email-assunto"
            type="text"
            required
            maxLength={200}
            value={assunto}
            onChange={event => setAssunto(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 focus-visible:outline-2 focus-visible:outline-green-700"
          />
        </div>
        <div>
          <label htmlFor="email-mensagem" className="mb-1.5 block text-sm font-semibold text-slate-700">Mensagem</label>
          <textarea
            id="email-mensagem"
            required
            maxLength={10000}
            rows={8}
            value={mensagem}
            onChange={event => setMensagem(event.target.value)}
            className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800 focus-visible:outline-2 focus-visible:outline-green-700"
          />
        </div>
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
          A logo será incorporada ao e-mail. Por privacidade, evite incluir informações sensíveis desnecessárias.
        </p>
        {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{erro}</p>}
      </form>
    </Modal>
  );
}
