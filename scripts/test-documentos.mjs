import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  globalThis.sessionStorage = { getItem: () => JSON.stringify({ id: 1, perfilId: 1, nome: "Teste", email: "teste@example.invalid", perfil: "COORDENADOR" }) };
  const { documentosService, mapearDocumento, mapearAnamnese } = await server.ssrLoadModule("/src/services/documentosService.ts");
  const { http } = await server.ssrLoadModule("/src/services/http.ts");
  const { formatarDataDocumento } = await server.ssrLoadModule("/src/config/documentos.ts");
  const plano = { id: 7, estudanteId: 2, estudanteNome: "Estudante de teste", estudanteMatricula: "0001", estudanteCurso: "Curso de teste", arquivado: false, possuiComorbidade: false };
  const estudante = { id: 2, nomeCompleto: "Estudante de teste", matricula: "0001", curso: "Curso de teste", periodoIngresso: "2026.1" };
  const anamnese = mapearAnamnese(estudante);
  assert.equal(anamnese.chave, "ANAMNESE-2");
  assert.equal(anamnese.dataRegistro, null);
  const pei = mapearDocumento(plano, "PEI");
  const assinado = mapearDocumento({ ...plano, status: "ASSINADO", arquivado: true }, "PLANO_ACAO");
  assert.notEqual(pei.chave, assinado.chave, "IDs iguais em entidades diferentes não devem colidir na tabela");
  assert.equal(assinado.assinado, true);
  assert.equal(assinado.status, "Arquivado · Assinado", "Arquivamento não deve esconder que o documento está assinado");
  assert.equal(pei.dataRegistro, null, "Uma data ausente não deve ser inventada");
  assert.equal(formatarDataDocumento(null), "Não informada");
  assert.equal(formatarDataDocumento("inválida"), "Não informada");
  assert.equal(pei.detalhes.find(d => d.titulo === "Possui comorbidade")?.valor, "Não", "Respostas negativas devem ser preservadas na visualização");

  const get = http.get;
  const { gerarArquivoDocumento } = await server.ssrLoadModule("/src/services/exportarDocumentoPreenchido.ts");
  const { mapearPea } = await server.ssrLoadModule("/src/services/documentosService.ts");
  const { unzipSync, strFromU8 } = await import("fflate");
  const longo = `${"Texto longo com quebra de linha.\n".repeat(150)}FIM_DO_CONTEUDO`;
  const documentosExportacao = [
    mapearDocumento({ ...plano, coordenadorNome: "Coordenador de teste", semestreAno: "2026.2", historico: longo,
      necessidadesEspecificas: "Necessidades registradas", conhecimentosHabilidadesInteresses: "Habilidades registradas",
      dificuldadesApresentadas: "Dificuldades registradas", propostasAdaptacoesCurriculares: "Propostas registradas" }, "PEI"),
    mapearPea({ ...plano, professorId: 3, professorNome: "Professor de teste", semestreAno: "2026.2",
      componenteCurricular: "Componente de teste", objetivoGeral: longo, objetivosEspecificos: "Objetivos registrados",
      conteudosProgramaticos: "Conteudos registrados", metodologia: "Metodologia registrada", avaliacao: "Avaliacao registrada",
      bibliografiaBasica: "Bibliografia basica registrada", bibliografiaComplementar: "Bibliografia complementar registrada",
      dataCriacao: "2026-11-09T10:00:00", dataAtualizacao: "2026-11-09T11:00:00" }),
  ];
  try {
    http.get = async () => { throw new Error("Exportacao nao deve consultar outros dados do estudante"); };
    for (const documento of documentosExportacao) {
      const word = await gerarArquivoDocumento(documento, "docx");
      const pacote = unzipSync(new Uint8Array(await word.arrayBuffer()));
      const xml = strFromU8(pacote["word/document.xml"]);
      for (const campo of documento.detalhes) {
        for (const linha of campo.valor.split(/\r?\n/)) assert.ok(xml.includes(linha), `${documento.tipo}: Word deve incluir todo o conteudo`);
      }
      assert.ok(xml.includes(documento.estudanteNome));
      assert.ok(xml.includes(documento.periodo));
      const pdf = await gerarArquivoDocumento(documento, "pdf");
      const textoPdf = Buffer.from(await pdf.arrayBuffer()).toString("latin1");
      assert.ok(textoPdf.startsWith("%PDF-"));
      const assinaturas = [
        "Assinatura do Setor Pedagógico (responsável):", "Assinatura da Assistência Estudantil (responsável):",
        "Assinatura do Docente:", "Assinatura da CLAI:", "Assinatura do(a) Coordenador(a) de Curso:",
        "Assinatura do Estudante ou Responsável:",
      ];
      assert.equal(xml.includes("ANEXO III"), documento.tipo === "PEI");
      assert.equal(textoPdf.includes("ANEXO III"), documento.tipo === "PEI");
      for (const assinatura of assinaturas) {
        assert.equal(xml.includes(assinatura), documento.tipo === "PEI");
        const textoEscapado = assinatura.replace(/[()]/g, "\\$&");
        assert.equal(textoPdf.includes(textoEscapado), documento.tipo === "PEI");
      }
      if (documento.tipo === "PEI") {
        assert.ok(xml.indexOf("ANEXO III") < xml.indexOf("PLANO EDUCACIONAL"));
        assert.ok(xml.indexOf(assinaturas[0]) > xml.indexOf("Propostas registradas"));
        assert.ok(xml.includes('w:leader="underscore"'), "Word deve conter linhas para assinatura");
      }
      assert.ok(textoPdf.includes("FIM_DO_CONTEUDO"), "PDF nao deve cortar textos longos");
      assert.ok((textoPdf.match(/\/Type \/Page\b/g) || []).length > 1, "Textos longos devem ocupar varias paginas");
      for (const campo of documento.detalhes.filter(campo => !campo.valor.includes("\n"))) {
        for (const palavra of campo.valor.split(/\s+/)) assert.ok(textoPdf.includes(palavra), `${documento.tipo}: PDF deve incluir o campo ${campo.titulo}`);
      }
    }
    await assert.rejects(() => gerarArquivoDocumento(anamnese, "pdf"));
    console.log("PEA e PEI: PDF multipagina e Word preservam campos e textos longos sem novas consultas HTTP.");
  } finally { http.get = get; }
  const del = http.delete;
  const post = http.post;
  try {
    http.get = async url => {
      if (url === "/estudantes") return { data: [estudante] };
      if (url === "/planos-educacionais") return { data: [plano] };
      throw new Error("Fonte de planos indisponível");
    };
    const consulta = await documentosService.listar();
    assert.equal(consulta.documentos.length, 2, "Falha em uma fonte não deve apagar documentos carregados de outra");
    assert.deepEqual(consulta.tiposDisponiveis, ["PEI", "ANAMNESE"]);
    assert.equal(consulta.falhas[0].tipo, "PLANO_ACAO");
    assert.equal(consulta.documentos.filter(d => d.tipo === "ANAMNESE").length, 1);
    const { acaoPermitida } = await server.ssrLoadModule("/src/config/documentActions.ts");
    assert.equal(acaoPermitida(anamnese, "excluir"), false);
    assert.equal(acaoPermitida(assinado, "excluir"), false);
    assert.equal(acaoPermitida(assinado, "desarquivar"), true);
    http.get = async url => {
      assert.equal(url, "/planos-educacionais/7");
      return { data: { ...plano, historico: "Registro atualizado depois de carregar a lista" } };
    };
    const atual = await documentosService.buscar(pei);
    assert.equal(atual.detalhes.find(c => c.titulo === "Hist\u00f3rico")?.valor, "Registro atualizado depois de carregar a lista");
    const chamadas = [];
    http.post = async url => { chamadas.push(url); return { data: { ...plano, arquivado: url.endsWith("/arquivar"), status: "RASCUNHO" } }; };
    assert.equal((await documentosService.executar(pei, "arquivar")).arquivado, true);
    assert.equal((await documentosService.executar({ ...pei, arquivado: true }, "desarquivar")).arquivado, false);
    assert.deepEqual(chamadas, ["/planos-educacionais/7/arquivar", "/planos-educacionais/7/desarquivar"]);
    await assert.rejects(() => documentosService.executar(pei, "assinar"));
    await assert.rejects(() => documentosService.executar(assinado, "assinar"));
    assert.equal(chamadas.length, 2, "Ações indisponíveis não devem chamar a API");
    http.post = async () => { throw new Error("Servidor indisponível"); };
    await assert.rejects(() => documentosService.executar(pei, "arquivar"), /Servidor indisponível/);
    let excluido;
    http.delete = async url => { excluido = url; };
    await documentosService.excluir(pei);
    assert.equal(excluido, "/planos-educacionais/7");
    excluido = undefined;
    await assert.rejects(() => documentosService.excluir({ ...pei, tipo: "RAI" }));
    assert.equal(excluido, undefined, "Um tipo sem integração não deve disparar exclusão para outro endpoint");
  } finally { http.get = get; http.delete = del; http.post = post; }
  console.log("Documentos: normalização, estados, consulta parcial e exclusão verificados com chamadas HTTP simuladas.");
} finally { delete globalThis.sessionStorage; await server.close(); }
