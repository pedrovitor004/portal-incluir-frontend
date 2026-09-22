import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <p className="font-semibold text-emerald-700">404</p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Página não encontrada
        </h1>

        <p className="mt-4 text-slate-600">
          O endereço acessado não existe no Portal Incluir.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
