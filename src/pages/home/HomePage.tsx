import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
export default function HomePage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  if (!usuario) return <Navigate to="/" replace />;
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
    <section className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
      <h1 className="text-3xl font-bold text-primary">Olá, {usuario.nome}!</h1>
      <p className="mt-4">Conta criada: {usuario.email}</p>
      <p className="mt-2">Perfil: {usuario.perfil.replaceAll("_", " ")}</p>
      <p className="mt-4 text-slate-600">A área deste perfil ainda está em desenvolvimento.</p>
      {usuario.perfil === "COORDENADOR" && <Link to="/coordenador/dashboard">Abrir dashboard</Link>}
      <button className="mt-6 block text-primary underline" onClick={() => { logout(); navigate("/"); }}>Sair</button>
    </section>
  </main>;
}
