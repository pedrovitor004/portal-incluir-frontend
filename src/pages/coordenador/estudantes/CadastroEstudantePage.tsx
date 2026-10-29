import FlowTimeline from "./components/FlowTimeline";
import { Link } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import { accessProfiles } from "../../../config/access";

export default function CadastroEstudantePage() {
  const { usuario } = useAuth();
  const base = accessProfiles[usuario?.perfil ?? "COORDENADOR"].basePath;
  return <main className="mx-auto max-w-5xl space-y-6 pb-10">
    <header><h1 className="text-2xl font-bold text-primary">Cadastro do estudante</h1><p className="mt-2 text-sm text-slate-500">Inicie o cadastro e organize as etapas do acompanhamento.</p></header>
    <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm sm:p-9">
      <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">Novo estudante</span>
      <h2 className="mt-5 text-xl font-bold text-slate-800">Vamos iniciar o acompanhamento?</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Comece pela anamnese, que reúne o cadastro inicial e as necessidades do estudante. Depois, continue com o plano de ação e o PEI. O RAI reúne os registros do acompanhamento. Você pode salvar o que preencheu e continuar em outro momento.</p>
      <div className="my-8"><FlowTimeline passos={[{ id: "anamnese", titulo: "Anamnese", resumo: "Cadastro inicial" }, { id: "plano", titulo: "Plano de ação" }, { id: "pei", titulo: "PEI" }, { id: "rai", titulo: "RAI", resumo: "Registro acumulativo" }]} /></div>
      <p className="mb-6 text-sm leading-6 text-slate-500">As etapas ficam vinculadas ao estudante. A coordenação pode indicar profissionais responsáveis e consultar as pendências pelo perfil.</p>
      <div className="flex flex-wrap gap-3"><Link to={`${base}/anamnese`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-green-700 px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700">Iniciar cadastro</Link><Link to={`${base}/estudantes`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-green-200 px-5 py-3 text-sm font-semibold text-green-800 hover:bg-green-50">Consultar estudantes cadastrados</Link></div>
    </section>
  </main>;
}
