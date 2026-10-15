# feat: adiciona recursos de acessibilidade ao Portal Incluir

## Contexto e resultado

O Portal Incluir passa a oferecer preferências de leitura e navegação nas telas existentes. Por exemplo, o usuário pode ampliar o texto até 200%, ativar alto contraste, reduzir animações e manter notificações abertas até fechá-las. As preferências ficam salvas no navegador e são reaplicadas ao retornar ao portal.

Este PR também melhora a identificação de formulários, o gerenciamento de foco e a apresentação das notificações. A integração VLibras, já presente na develop, é preservada.

Base: `develop`. Branch: `feature/recursos-acessibilidade`.

## Implementações

### 1. Painel global de acessibilidade

- Botão flutuante com símbolo de acessibilidade, nome acessível e indicação de abertura de diálogo.
- Janela nativa com fechamento por Escape, contenção do foco e retorno ao controle de origem.
- Cabeçalho institucional com logos da CLAI e do IFPB, apresentação sobre inclusão e identificação dos recursos.
- Opções organizadas em duas colunas quando há espaço, com adaptação para uma coluna em telas menores.
- Orientações de teclado, controle por voz do dispositivo e Libras em área expansível.
- Remoção dos acessos duplicados abaixo dos formulários; o botão global continua disponível.

### 2. Preferências de leitura e exibição

- Ampliação de texto em 100%, 125%, 150%, 175% e 200%.
- Alto contraste opcional com fundo escuro e destaque de controles e foco.
- Espaçamento ampliado entre linhas e palavras.
- Redução de animações por escolha do usuário e respeito à preferência do sistema operacional.
- Persistência em localStorage, validação das preferências carregadas e funcionamento mesmo quando o armazenamento está indisponível.
- Restauração das preferências padrão.
- Paleta original preservada no modo padrão, sem escurecimento global obrigatório.

### 3. Leitura em voz alta

- Síntese de voz em português do Brasil, iniciada somente mediante ação do usuário.
- Controles de iniciar, pausar, continuar, parar e selecionar velocidade.
- Leitura dividida em trechos e interrompida ao trocar de rota.
- Informação de estado e tratamento de indisponibilidade ou erro de reprodução.
- Valores digitados nos campos não são coletados para leitura; textos visíveis da página podem incluir informações do usuário autenticado.
- A disponibilidade e o processamento da voz dependem do navegador e do dispositivo. Não foi implementado serviço próprio de reconhecimento de fala nem acesso ao microfone.

### 4. Navegação e foco

- Link “Pular para o conteúdo”.
- Títulos do documento identificando a página e o Portal Incluir.
- Foco no título principal após mudanças de rota e correção da hierarquia de títulos de login/cadastro.
- Indicadores visíveis de foco nos controles.
- Menu móvel em diálogo nativo, com fundo inerte, fechamento por Escape e ajuste ao breakpoint de desktop.

### 5. Formulários e autenticação

- Identificação de campos obrigatórios e opcionais no cadastro.
- Preenchimento automático para dados pessoais e senhas.
- Instrução de comprimento da senha e uso da validação nativa dos campos.
- Confirmação de senha divergente identificada com mensagem associada ao campo, indicação de invalidade e direcionamento do foco.
- Indicação de processamento com aria-busy.
- Controle de mostrar/ocultar senha com ícone de olho, nome acessível e estado pressionado, sem bloquear colagem ou gerenciadores de senhas.

### 6. Notificações

- Toasts alinhados à identidade visual: verde da marca, fundo branco, sombra discreta, ícones compactos, foco no fechamento e barra de tempo fina.
- Opção de manter os próximos toasts abertos até fechamento manual.
- Histórico das últimas 20 mensagens no painel, em memória, com limpeza manual e ao retornar ao login.
- Histórico não persistido em localStorage. Mensagens continuam tratadas como texto.

### 7. Identidade visual e layout

- Logos do IFPB e da CLAI ampliadas nos cabeçalhos de login, cadastro, área do coordenador e painel.
- Remoção do espaço extra no rodapé que provocava rolagem desnecessária no cadastro.
- Rolagem preservada quando necessária para conteúdo maior ou texto ampliado.

## Relação com acessibilidade e WCAG 2.2

As relações abaixo indicam critérios apoiados pelas alterações, não conformidade certificada do sistema. A avaliação deve considerar páginas completas, fluxos e tecnologias assistivas. Referência: [WCAG 2.2 — W3C](https://www.w3.org/TR/WCAG22/).

| Implementação | Critérios relacionados | Nível |
| --- | --- | --- |
| Rótulos, grupos e instruções | 1.3.1 — Informações e relações | A |
| Autocomplete de dados pessoais | 1.3.5 — Identificar propósito de entrada | AA |
| Ampliação de texto | 1.4.4 — Redimensionar texto | AA |
| Layout adaptável | 1.4.10 — Refluxo | AA |
| Ajustes de espaçamento | 1.4.12 — Espaçamento de texto | AA |
| Controles nativos e Escape | 2.1.1 — Teclado; 2.1.2 — Sem bloqueio do teclado | A |
| Notificações persistentes | 2.2.1 — Ajuste de tempo | A |
| Redução de movimento | 2.3.3 — Animação de interações | AAA |
| Link para conteúdo | 2.4.1 — Ignorar blocos | A |
| Título do documento e foco | 2.4.2 — Página com título; 2.4.3 — Ordem do foco | A |
| Títulos, rótulos e foco visível | 2.4.6 — Cabeçalhos e rótulos; 2.4.7 — Foco visível | AA |
| Erros e instruções dos campos | 3.3.1 — Identificação de erros; 3.3.2 — Rótulos ou instruções | A |
| Gerenciadores de senha e colagem | 3.3.8 — Autenticação acessível | AA |
| Nomes e estados dos controles | 4.1.2 — Nome, função e valor | A |
| Estados de leitura e mensagens | 4.1.3 — Mensagens de status | AA |

O alto contraste é um recurso complementar: a opção, isoladamente, não comprova atendimento a 1.4.3 e 1.4.11. A paleta padrão e todos os estados ainda precisam de medição. A leitura em voz alta também complementa o uso de leitores de tela, sem substituí-los. O VLibras mantido neste PR não comprova, por si só, atendimento aos requisitos de mídia em Libras.

## Validação realizada

- `npm run build`: aprovado.
- `npm run lint`: aprovado, sem erros ou avisos.
- Verificação visual do painel no navegador.
- Conferência da árvore de acessibilidade: nomes, campos, títulos e estados.
- Abertura e fechamento do painel por Escape, com retorno do foco.
- Expansão das orientações por teclado.
- Ampliação de 200%, ativação do alto contraste e restauração de preferências.
- Validação nativa de campos obrigatórios e controle de mostrar/ocultar senha.
- Verificação de altura do cadastro: ausência de rolagem excedente no viewport testado.

## Validações pendentes e limites

- Testes completos com NVDA, VoiceOver, TalkBack e usuários PCD.
- Auditoria automatizada e medição de contraste em todos os estados.
- Refluxo e ausência de sobreposição em 320 CSS px, zoom de 400% e todas as combinações de preferências.
- Menu e fluxos autenticados com sessão de coordenador; a inspeção de código não substitui o teste desses fluxos.
- Reprodução de voz em diferentes navegadores, vozes e dispositivos, inclusive textos longos.
- Erros de campo adicionais dependem da informação disponibilizada pela API.
- Legendas, transcrições, audiodescrição e documentos acessíveis devem acompanhar futuros conteúdos. Traduções institucionais importantes em Libras precisam de revisão humana.

O PR estabelece recursos e melhorias com meta de WCAG 2.2 AA; não declara conformidade integral, eMAG, ABNT ou conformidade legal. O roteiro de avaliação contínua está em `docs/acessibilidade.md`.
