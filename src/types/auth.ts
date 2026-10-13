export type PerfilUsuario = "COORDENADOR" | "PROFESSOR" | "ADMINISTRADOR" | "EQUIPE_MULTIDISCIPLINAR";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  perfilId: number;
}

export interface LoginRequest { email: string; senha: string }

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
  | { perfil: "PROFESSOR"; disciplina: string }
  | { perfil: "ADMINISTRADOR"; cargo: string }
  | { perfil: "EQUIPE_MULTIDISCIPLINAR"; cargo: string; areaAtuacao: string }
);
