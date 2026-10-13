export interface EstudanteResumo {
  id: number;
  nome: string;
  curso: string;
  matricula: string;
  ativo: boolean;
}
export interface DashboardCoordenadorData {
  estudantesAtivos: number;
  professoresAtivos: number;
  planosAtivos: number;
  planosArquivados: number;
  estudantesRecentes: EstudanteResumo[];
}
