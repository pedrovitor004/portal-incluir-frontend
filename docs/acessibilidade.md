# Acessibilidade do Portal Incluir

Meta de desenvolvimento: WCAG 2.2 nível AA. Esta implementação não representa certificação ou declaração de conformidade.

## Recursos implementados

- Painel global acessível por teclado, com fechamento por Escape e retorno do foco ao controle de origem.
- Preferências de tamanho de texto (100–200%), alto contraste, espaçamento, redução de movimento e notificações persistentes. Preferências salvas localmente, sem dados pessoais.
- Respeito à preferência de movimento reduzido do sistema operacional.
- Link para pular ao conteúdo, títulos de página e foco após navegação entre rotas.
- Paleta original do portal preservada no modo padrão; alterações globais de contraste ocorrem somente ao ativar alto contraste. A medição de contraste da paleta padrão permanece no roteiro de auditoria.
- Botão flutuante com símbolo de acessibilidade e nome acessível. Painel com identificação visual do IFPB e da CLAI, apresentação sobre inclusão e recursos organizados em cartões.
- Formulários com rótulos, preenchimento automático, campos obrigatórios/opcionais, instrução de senha e identificação do erro de confirmação. Validação nativa para campos vazios, e-mail e comprimento de senha.
- Controles de mostrar/ocultar senha com ícone de olho dentro do campo e nome acessível, sem bloquear colagem ou gerenciadores de senhas.
- Menu móvel com diálogo nativo: foco contido, fundo inerte e fechamento por Escape.
- Leitura opcional do texto visível com voz pt-BR, velocidade, pausa, continuação e parada. Os valores digitados nos campos não são coletados para leitura. A voz e sua disponibilidade dependem do navegador e do dispositivo; não há upload implementado pelo portal.
- Últimas 20 notificações acessíveis no painel, somente em memória; limpeza ao retornar ao login, botão para limpar e opção de impedir fechamento automático dos próximos toasts.
- Integração VLibras existente preservada. Consulte `integracao.md`.

## Verificação manual antes de publicar

1. Percorrer login, cadastro, painel e dashboard apenas com Tab, Shift+Tab, Enter, Espaço e setas. Conferir foco visível e ordem coerente.
2. Abrir/fechar painel e menu móvel; conferir contenção e retorno de foco, inclusive Escape.
3. Usar NVDA com Chrome/Firefox, VoiceOver com Safari e TalkBack com Chrome. Conferir nomes, obrigatoriedade, erros, carregamento e anúncios dos toasts.
4. Testar 200% de texto, zoom de 400%, viewport de 320 CSS px e espaçamento aumentado, sem conteúdo inacessível ou sobreposição do botão flutuante.
5. Verificar contraste de cada estado (normal, hover, foco, erro e desabilitado), inclusive telas autenticadas, com ferramenta de medição. Não depender exclusivamente das cores.
6. Testar leitura longa, pausa, continuação, parada e mudança de rota. Conferir também dispositivos sem síntese de voz.
7. Habilitar notificações persistentes, gerar mensagem e consultar o histórico. Validar sua limpeza ao sair da sessão.
8. Testar o VLibras sem duplicação do widget e com indisponibilidade do serviço externo.
9. Usar controle por voz do sistema para acionar controles por seus nomes visíveis. Não há reconhecedor de fala próprio nem solicitação de microfone.
10. Realizar testes com usuários PCD e registrar barreiras encontradas.

## Itens que dependem de conteúdo e validação externa

- Legendas, transcrições e audiodescrição devem acompanhar futuros vídeos/áudios; não há mídia audiovisual nas telas atuais.
- Traduções em Libras de conteúdos institucionais críticos precisam de revisão humana; tradução automática não substitui essa revisão.
- PDFs e documentos futuramente disponibilizados precisam de estrutura acessível, ordem de leitura e descrição de imagens.
- Formulários futuros devem manter esses padrões e associar erros de campo retornados pela API, quando o contrato oferecer essa informação.
- Auditoria automatizada, testes com leitores de tela reais e pesquisa com usuários são necessários para avaliar conformidade completa.

Referências: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [formulários WAI](https://www.w3.org/WAI/tutorials/forms/) e [autenticação acessível](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html).
