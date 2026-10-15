# LGPD e legislação

As rotas públicas `/recursos/lgpd` e `/recursos/legislacao` apresentam referências legais, orientações de uso do Portal Incluir e um visualizador de PDF. Os botões correspondentes no dashboard abrem essas páginas em uma nova aba.

As páginas não exigem sessão porque contêm apenas documentos públicos. Isso também evita que a abertura de uma aba sem cópia do `sessionStorage` redirecione o usuário para o login.

O cabeçalho reutiliza `AppHeader`. Quando a página é aberta pelos recursos do dashboard, um identificador aleatório da aba de origem permite recuperar sua identificação local por `BroadcastChannel`, restrito à mesma origem. Senhas, tokens e dados pessoais não são colocados na URL. A identificação recebida fica no `sessionStorage` da nova aba; não é criada autenticação no servidor nem armazenamento persistente. O logout é propagado às abas da mesma conta. Sem uma aba de origem ativa, as páginas continuam públicas e exibem a opção de entrar no portal.

## Arquivos

O botão “Voltar ao painel” solicita foco à guia de origem e fecha a guia do documento quando essa origem ainda está aberta. A referência é preservada ao alternar entre LGPD e Legislação. Se o navegador bloquear o fechamento, uma orientação permite fechar a guia manualmente ou abrir o painel nela. Sem a origem disponível, o retorno usa a navegação normal.

- `src/config/institutionalDocuments.ts`: títulos, textos, fontes e URLs dos documentos.
- `src/pages/institutional/InstitutionalDocumentPage.tsx`: apresentação compartilhada das páginas.
- `src/components/common/PdfViewer.tsx`: incorporação do PDF e alternativas de leitura.
- `src/config/routes.ts`: caminhos internos.

## Fontes e atualização

Os PDFs usam as URLs de **texto atualizado** da Câmara dos Deputados para a Lei nº 13.709/2018 (LGPD) e a Lei nº 13.146/2015 (Lei Brasileira de Inclusão). Não há cópia estática nem versão fixada no projeto: o visualizador consulta o documento disponibilizado pela fonte, sujeito à atualização e às regras de cache dela.

Cada página mantém links para abrir o PDF separadamente e consultar o texto em HTML no Planalto. Caso o navegador não ofereça visualização de PDF ou a fonte impeça incorporação/esteja indisponível, essas alternativas continuam visíveis. Não use o evento de carregamento do navegador como garantia de que um PDF externo foi renderizado.

A redação sobre o portal descreve recursos existentes e orientações de uso. Não declara controles de segurança não verificados nem certificação de conformidade com a LGPD.

## Validação manual

1. No dashboard, acione LGPD e Legislação e confirme a abertura de uma nova aba do sistema.
2. Abra as rotas diretamente, sem login, e confirme que os documentos públicos continuam acessíveis.
3. Confira o PDF no navegador e as alternativas de abertura e leitura em HTML.
4. Teste teclado, zoom, alto contraste e uma tela pequena. A visualização interna de PDFs depende do navegador; o link HTML é uma alternativa de leitura.
5. Confira periodicamente as fontes oficiais para identificar mudanças de URL ou disponibilidade.
