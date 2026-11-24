import type { AvisoAcompanhamento, GestaoAcompanhamento, RegistroAcompanhamento } from "../types/gestaoAcompanhamento";

// Dados efêmeros, separados por conta. Não grava dados de estudantes no navegador.
const sessoes = new Map<number, GestaoAcompanhamento>();
const listeners = new Set<() => void>();
const vazio: GestaoAcompanhamento = { demonstracao: false, registros: [], avisos: [] };
function publicar(id: number, estado: GestaoAcompanhamento) {
  sessoes.set(id, estado);
  listeners.forEach(listener => listener());
}
function avisar(destinatario: string, titulo: string, mensagem: string): AvisoAcompanhamento {
  return { id: crypto.randomUUID(), destinatario, titulo, mensagem, data: new Date().toISOString(), lido: false };
}

export const gestaoAcompanhamentoPreview = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  consultar(id: number) { return sessoes.get(id) ?? vazio; },
  iniciar(id: number) {
    const base = { estudante: "Estudante exemplo A", matricula: "DEMO-001", curso: "Informática", responsavel: "Docente exemplo", area: "Matemática", data: "2026-10-19", situacao: "Ativo" as const };
    publicar(id, { demonstracao: true, avisos: [], registros: [
      { ...base, id: "adaptacao-1", tipo: "adaptacao", titulo: "Resolução de problemas com apoio visual", descricao: "Organizar os enunciados em etapas curtas e apresentar exemplos visuais antes da atividade individual.", conteudo: "Equações do primeiro grau e resolução de problemas do cotidiano.", recursos: "Roteiro ilustrado, material ampliado e tempo adicional.", resultado: "O estudante realizou as etapas com apoio do roteiro. Revisar a autonomia na próxima aula." },
      { ...base, id: "adaptacao-2", tipo: "adaptacao", estudante: "Estudante exemplo B", matricula: "DEMO-002", responsavel: "Docente exemplo B", area: "Língua portuguesa", titulo: "Leitura orientada", descricao: "Leitura em blocos com perguntas orientadoras e possibilidade de resposta oral.", conteudo: "Interpretação de textos e identificação das ideias principais.", recursos: "Texto digital acessível e roteiro de leitura.", resultado: "Acompanhar a compreensão em uma nova atividade.", situacao: "Inativo" },
      { ...base, id: "atendimento-1", tipo: "atendimento", responsavel: "Profissional exemplo", area: "Apoio pedagógico", titulo: "Acompanhamento durante a aula", descricao: "Apoio na organização da atividade e na compreensão das orientações durante a aula de Matemática.", conteudo: "Aula de Matemática · sala 12 · 09h às 10h", recursos: "Roteiro da atividade e alinhamento com o professor.", resultado: "Reavaliar a necessidade de apoio no próximo encontro." },
      { ...base, id: "atendimento-2", tipo: "atendimento", estudante: "Estudante exemplo B", matricula: "DEMO-002", responsavel: "Profissional exemplo B", area: "Acessibilidade", titulo: "Orientação sobre recursos acessíveis", descricao: "Orientação para utilização dos materiais acessíveis disponibilizados para a aula.", conteudo: "Aula de Língua portuguesa · biblioteca · 14h às 15h", recursos: "Leitor de tela e material digital.", resultado: "Orientações concluídas; manter registro para consulta.", situacao: "Arquivado" },
    ] });
  },
  limpar(id: number) { publicar(id, vazio); },
  salvar(id: number, registro: RegistroAcompanhamento) {
    const atual = this.consultar(id);
    if (!atual.demonstracao) return;
    publicar(id, { ...atual, registros: atual.registros.map(r => r.id === registro.id ? { ...registro } : r), avisos: [avisar(registro.responsavel, "Registro atualizado pela coordenação", `${registro.titulo} · ${registro.estudante}. Situação: ${registro.situacao}.`), ...atual.avisos] });
  },
  excluir(id: number, registro: RegistroAcompanhamento) {
    const atual = this.consultar(id);
    if (!atual.demonstracao) return;
    publicar(id, { ...atual, registros: atual.registros.filter(r => r.id !== registro.id), avisos: [avisar(registro.responsavel, "Registro excluído pela coordenação", `${registro.titulo} · ${registro.estudante}.`), ...atual.avisos] });
  },
  notificar(id: number, registro: RegistroAcompanhamento, mensagem: string) {
    const atual = this.consultar(id);
    if (!atual.demonstracao || !mensagem.trim()) return;
    publicar(id, { ...atual, avisos: [avisar(registro.responsavel, `Solicitação da coordenação · ${registro.titulo}`, mensagem.trim()), ...atual.avisos] });
  },
  ler(id: number) { const atual = this.consultar(id); publicar(id, { ...atual, avisos: atual.avisos.map(a => ({ ...a, lido: true })) }); },
  vinculo(id: number, profissional: string, estudante: string, ativo: boolean, motivo: string) {
    const atual = this.consultar(id);
    publicar(id, { ...atual, avisos: [avisar(profissional, ativo ? "Novo estudante atribuído" : "Vínculo de acompanhamento encerrado", `${estudante}. ${motivo}`), ...atual.avisos] });
  },
};
