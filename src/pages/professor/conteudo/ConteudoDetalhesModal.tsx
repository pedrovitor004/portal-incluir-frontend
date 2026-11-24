import { useEffect, useRef, useState } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import LoadingState from "../../../components/common/LoadingState";
import { conteudosAcademicosService as api } from "../../../services/conteudosAcademicosService";
import { mensagemErro } from "../../../services/apiError";
import { formatarDataDocumento } from "../../../config/documentos";
import type { ConteudoAcademicoResponse } from "../../../types/conteudoAcademico";
import { linkSeguro, tamanhoArquivo, tiposConteudo } from "./apresentacao";
import { useAuth } from "../../../hooks/useAuth";
import { canAccess } from "../../../config/access";

export function DetalhesConteudo({ material }: { material: ConteudoAcademicoResponse }) {
  const link = linkSeguro(material.link);
  const identificacao = [
    ["Tipo", tiposConteudo[material.tipo]], ["Componente curricular", material.componenteCurricular],
    ["Professor responsável", material.professorNome],
    ["Estudante", material.estudanteId === null ? "Sem estudante associado · Material reutilizável" : material.estudanteNome],
    ...(material.estudanteId === null ? [] : [["Matrícula", material.estudanteMatricula]]),
    ["Cadastrado em", formatarDataDocumento(material.dataCriacao)], ["Atualizado em", formatarDataDocumento(material.dataAtualizacao)],
  ];
  return <div className="space-y-6">
    <dl className="grid gap-4 sm:grid-cols-2">{identificacao.map(([label, valor]) => <div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium text-slate-800">{valor || "Não informado"}</dd></div>)}</dl>
    <section className="border-t border-slate-100 pt-5"><h3 className="font-semibold text-slate-800">Descrição do material</h3><p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{material.descricao}</p></section>
    <section><h3 className="font-semibold text-slate-800">Orientações de adaptação</h3><p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{material.orientacoesAdaptacao || "Nenhuma orientação adicional informada."}</p></section>
    {material.arquivoNome && <section className="rounded-xl bg-slate-50 p-4"><h3 className="font-semibold text-slate-800">Arquivo anexado</h3><p className="mt-2 break-words">{material.arquivoNome}</p><p className="mt-1 text-xs text-slate-500">{tamanhoArquivo(material.arquivoTamanho)} · {material.arquivoTipo}</p></section>}
    {material.link && <section><h3 className="font-semibold text-slate-800">Link do material</h3>{link ? <a href={link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block min-h-11 break-all font-semibold text-green-800 underline">Abrir material em nova aba</a> : <p className="mt-2 text-slate-500">Link indisponível.</p>}</section>}
  </div>;
}

type Props = { id: number; onClose: () => void } & (
  { professorId: number; consultaCoordenador?: false } | { consultaCoordenador: true; professorId?: never }
);

export default function ConteudoDetalhesModal({ id, professorId, onClose, consultaCoordenador = false }: Props) {
  const { usuario } = useAuth();
  const autorizado = !!usuario && canAccess(usuario, "academico.gerar") && (consultaCoordenador
    ? usuario.perfil === "COORDENADOR" : usuario.perfil === "PROFESSOR" && usuario.perfilId === professorId);
  const [material, setMaterial] = useState<ConteudoAcademicoResponse | null>(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const [baixando, setBaixando] = useState(false);
  const [erroDownload, setErroDownload] = useState("");
  const download = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!autorizado) return;
    const controller = new AbortController();
    api.buscarPorId(id, controller.signal).then(dados => {
      if (controller.signal.aborted) return;
      if (dados.id !== id || (!consultaCoordenador && dados.professorId !== professorId)) { setErro("Material indisponível para consulta."); return; }
      setMaterial(dados);
    }).catch((e: unknown) => { if (!controller.signal.aborted) setErro(mensagemErro(e)); })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false); });
    return () => controller.abort();
  }, [id, professorId, tentativa, autorizado, consultaCoordenador]);
  useEffect(() => () => download.current?.abort(), []);

  async function baixar() {
    if (!autorizado || !material?.arquivoNome || download.current) return;
    const controller = new AbortController(); download.current = controller;
    setBaixando(true); setErroDownload("");
    try {
      const blob = await api.baixarArquivo(id, controller.signal);
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      try {
        const anchor = document.createElement("a"); anchor.href = url;
        anchor.download = material.arquivoNome.replace(/[\\/\r\n]/g, "_");
        document.body.append(anchor); anchor.click(); anchor.remove();
      } finally { setTimeout(() => URL.revokeObjectURL(url), 60000); }
    } catch (e) { if (!controller.signal.aborted) setErroDownload(mensagemErro(e)); }
    finally { download.current = null; if (!controller.signal.aborted) setBaixando(false); }
  }

  if (!autorizado) return <p role="alert">Você não tem autorização para consultar este material.</p>;
  return <Modal open onClose={onClose} size="wide" title={material?.titulo || "Visualizar material"} description="Conteúdo acadêmico adaptado · Dados salvos"
    footer={<div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row"><Button variant="secondary" onClick={onClose}>Fechar</Button>{!carregando && !erro && material?.arquivoNome && <Button disabled={baixando} onClick={() => void baixar()}>{baixando ? "Baixando..." : "Baixar arquivo"}</Button>}</div>}>
    {carregando ? <LoadingState compact label="Carregando material..." /> : erro ? <div role="alert" className="space-y-3"><p className="text-red-700">{erro}</p><Button variant="secondary" onClick={() => { setErro(""); setMaterial(null); setCarregando(true); setTentativa(t => t + 1); }}>Tentar novamente</Button></div> : material && <DetalhesConteudo material={material} />}
    {erroDownload && <p role="alert" className="mt-4 text-sm text-red-700">{erroDownload}</p>}
  </Modal>;
}
