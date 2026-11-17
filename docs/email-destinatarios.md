# Destinatário do e-mail

O formulário permite selecionar estudante ou responsável e mostra os nomes e e-mails cadastrados. Contatos ausentes ou inválidos não habilitam envio. O botão no perfil fica disponível quando pelo menos um dos contatos possui e-mail válido. A saudação padrão acompanha a seleção e textos editados são preservados para revisão.

O frontend envia apenas o tipo ESTUDANTE ou RESPONSAVEL. A API resolve o endereço no cadastro e mantém as permissões de envio e escopo. Requisições antigas sem tipo continuam usando o estudante. Os testes usam SMTP simulado e não enviam mensagens reais.
