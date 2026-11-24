# Resultado integrado dos PRs

As branches de sessão, acesso e fluxo têm base develop. O resultado conjunto deve preservar o comportamento do trabalho local original: cadastro pendente sem autenticar ou trocar a conta atual, aprovação pelo root, solicitações no sino e no painel, lembrete após 48 horas, assinatura do Plano de Ação, exportações, encaminhamentos com mensagem e permissões verificadas, notificações e vínculos dos profissionais.

Arquivos de sessão e contratos de notificação são compartilhados e idênticos nos recortes que os consomem. Isso evita implementar substitutos para o fluxo original e permite o merge sem encadear PRs. O frontend de cadastro usa o contrato de solicitação pendente do backend; atualize os dois repositórios na implantação.

A comparação com o backup original preserva o código funcional e o modelo DOCX. As diferenças restantes são a extração do alerta padrão para evitar dependência da tela de fluxo, os nomes das etapas nas notificações, a proteção para não consultar solicitações em servidores antigos que ainda não informam os campos de administração, organização de comentários e testes adicionais. O backend preserva a injeção de dependência compatível com os testes de sessão.

Os arquivos backend-*.patch preservam os patches originais como referência histórica. O código Java versionado nos PRs do backend é a fonte da implantação; não reaplique esses patches após os merges.

Validação conjunta: test:auth, test:acesso, test:fluxo, test:encaminhamento, test:documentos, test:relatorios, build e lint no frontend; suíte Maven com JDK 21 e H2 no backend. As duas combinações são montadas em worktrees temporárias, sem mesclar os PRs na develop durante a validação.
