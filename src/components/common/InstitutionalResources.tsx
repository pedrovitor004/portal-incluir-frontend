import { useState } from "react";
import { Link } from "react-router";
import { routes } from "../../config/routes";
import { getSessionTabId } from "../../services/sessionTabs";
import Modal from "./Modal";
import ResourceIcon from "../icons/ResourceIcon";
import { colorThemes, type ColorTheme } from "../../config/uiThemes";

const institutionalResources = [
  "Manual do usuário",
  "Legislação",
  "LGPD",
  "Acessibilidade",
];
const resourceStyles = [
  { tone: "amber", icon: "book" },
  { tone: "red", icon: "scales" },
  { tone: "blue", icon: "shield" },
  { tone: "green", icon: "accessibility" },
] as const satisfies readonly { tone: ColorTheme; icon: "book" | "scales" | "shield" | "accessibility" }[];


export default function InstitutionalResources() {
  const [selected, setSelected] = useState<string | null>(null);
  const guidance: Record<string, { intro: string; steps: string[] }> = {
    "Manual do usuário": { intro: "Veja como se orientar no Portal Incluir.", steps: ["Use o menu lateral para encontrar as áreas disponíveis para o seu perfil.", "Selecione Ver detalhes nos cartões para entender as informações.", "Use Fechar e voltar para retornar à página. Você também pode apertar Escape no teclado."] },
    "Acessibilidade": { intro: "Você pode navegar pelo portal com o mouse ou pelo teclado.", steps: ["Use Tab para avançar entre botões e links. Use Shift + Tab para voltar.", "Use Enter para abrir links e Enter ou Espaço para acionar botões.", "Nos modais, use o botão Fechar e voltar ou aperte Escape.", "Se precisar, aumente o zoom pelas opções do seu navegador."] },
  };
  return (
    <>
    <section className="mt-4 rounded-md border border-[#dce5dc] bg-white px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <h2 className="flex shrink-0 items-center gap-2 text-sm font-bold text-primary">
          <ResourceIcon name="book" />
          Recursos institucionais
        </h2>

        <div className="flex flex-1 flex-wrap items-center gap-2">
          {institutionalResources.map((resource, index) => {
            const page = resource === "LGPD" ? routes.lgpd : resource === "Legislação" ? routes.legislacao : null;
            const className = "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md bg-[var(--accent-soft)] px-3.5 py-2 text-xs font-semibold text-[var(--accent-main)] transition hover:bg-[var(--accent-main)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-main)]";
            const content = <><ResourceIcon name={resourceStyles[index].icon} />{resource}<span aria-hidden="true" className="ml-2">↗</span></>;
            return page ? <Link key={resource} to={`${page}?fromTab=${getSessionTabId()}`} target="_blank" rel="noopener noreferrer" aria-label={`${resource} (abre em nova aba)`} style={colorThemes[resourceStyles[index].tone]} className={className}>{content}</Link> : (
            <button
              type="button"
              onClick={() => setSelected(resource)}
              aria-haspopup="dialog"
              key={resource}
              style={colorThemes[resourceStyles[index].tone]}
              className={className}
            >
              {content}
            </button>
          );})}
        </div>

        <p className="max-w-[200px] text-[11px] leading-snug text-slate-500">
          Selecione uma opção para ver orientações.
        </p>
      </div>
    </section>
    <Modal tone={selected ? resourceStyles[institutionalResources.indexOf(selected)].tone : "green"} icon={selected ? <ResourceIcon name={resourceStyles[institutionalResources.indexOf(selected)].icon} className="h-8 w-8" /> : undefined} open={selected !== null} onClose={() => setSelected(null)} title={selected ?? "Recursos institucionais"} description={selected ? guidance[selected].intro : undefined}>
      {selected && <ol className="space-y-3">{guidance[selected].steps.map((step, index) => <li key={step} className="flex items-start gap-3 rounded-xl bg-[var(--accent-soft)] p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[var(--accent-main)]">{index + 1}</span><span>{step}</span></li>)}</ol>}
    </Modal>
    </>
  );
}
