# Alertas de ocorrência

Professores vinculados e coordenação recebem a notificação da ocorrência registrada pela equipe, com autor, estudante, horário e resumo. O aviso ATENÇÃO aparece no topo, permanece até abertura ou dispensa e permite abrir os detalhes. Dispensa visual não marca como lido. Ao abrir a central de notificações, o aviso flutuante fica oculto, evitando sobreposição.

O controle de som é apenas um ícone de alto-falante ao lado do sino, com rótulo acessível e descrição ao passar o mouse. A ativação testa o som. Novas ocorrências usam três sinais mais audíveis, sem repetição em cada atualização. Pendências aparecem ao entrar, sem reproduzir som de avisos antigos. O navegador exige interação para liberar o áudio; a preferência é individual por conta.

A consulta ocorre a cada cinco segundos enquanto a aba está visível. Registro em outra aba da mesma origem também dispara atualização. Som é reproduzido na janela com foco. Os avisos permanecem na central e não substituem os canais institucionais de atendimento.

Verificação: npm run test:alertas-ocorrencia; npm run test:notificacoes; OcorrenciaTest no backend.
