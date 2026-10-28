export type PerfilUsuario = "COORDENADOR" | "PROFESSOR" | "ADMINISTRADOR" | "EQUIPE_MULTIDISCIPLINAR";

export interface Usuario {
  id: number;
  root?: boolean;
  administracaoAprovada?: boolean;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  perfilId: number;
  permissoes?: import("../config/access").Permission[];
}

export interface LoginRequest { email: string; senha: string }
export interface SolicitacaoAcesso {
  id: number; tipo: "CADASTRO" | "ADMINISTRACAO"; nome: string; email: string; perfil: PerfilUsuario;
  status: "PENDENTE" | "APROVADA" | "RECUSADA";
  criadaEm: string; prazoAnalise: string; diasPendente: number; atrasada: boolean;
  analisadaEm?: string; usuarioId?: number; motivo?: string; dados?: Record<string, unknown>;
}

interface CadastroBase {
  nome: string;
  email: string;
  senha: string;
  matricula: string;
  telefone?: string;
  dataNascimento?: string | null;
  setor: string;
}

export type CadastroRequest = CadastroBase & (
  | { perfil: "COORDENADOR"; cargo: string }
  | { perfil: "PROFESSOR"; disciplina?: string; cursosAtuacao: string[] }
  | { perfil: "EQUIPE_MULTIDISCIPLINAR"; cargo: string; areaAtuacao: string }
);
