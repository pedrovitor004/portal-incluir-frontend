# Auditorias

Acesse **Administração → Auditorias** como coordenador ou administrador. A página consulta todas as tabelas `_aud` do schema `auditoria` que possuem chave primária e coluna `detalhes`.

- Filtros nativos do AG Grid nos cabeçalhos: área, operação, data/período, identificador e revisão. Aplicam-se ao histórico carregado inteiro.
- A API é consultada em lotes de 100 registros; o AG Grid pagina, filtra e ordena o histórico completo no navegador. A seleção permite 10, 20, 50 ou 100 registros por página. Para históricos muito grandes, uma evolução deve levar filtros, ordenação e indicadores para o servidor.
- Detalhes: campos alterados com antes/depois e estados completos. Estados anteriores ausentes são apresentados como indisponíveis.
- Cards apresentam dados reais da consulta: total, movimentações de hoje, áreas com registros e última atividade. A data do filtro nativo segue o dia no navegador. A atualização é manual e pede confirmação com SweetAlert, preservando filtros e ordenação.

## Integração

Backend: `GET /api/auditorias/tabelas` e `GET /api/auditorias`. A consulta aceita `tabela`, `operacao` (`ADD`, `MOD`, `DEL`), `inicio`, `fim`, `registro`, `pagina` e `tamanho` (máximo 100).

O login cria uma sessão HTTP no servidor; as chamadas de auditoria enviam o cookie com `withCredentials`. O servidor consulta o perfil atual do usuário antes de liberar a auditoria e responde com `Cache-Control: no-store`. Logout invalida a sessão. Sessões antigas do frontend precisam de um novo login após a atualização.

Os arquivos correspondentes foram aplicados em `C:\Users\pedro\Desktop\portal-incluir`: `AuditoriaService`, `AuditoriaController`, `AuthController`, `CorsConfig` e `AuditoriaControllerTest`. Reinicie o backend após a atualização.

O modelo atual `RevisaoAuditoria` armazena número da revisão e horário, sem autor da ação. Não é possível atribuir alterações antigas a usuários com esses dados.

## Validação

- API compilada em uma cópia isolada com Java 21 e Maven.
- Quatro testes de autorização passaram: usuário anônimo, perfis sem permissão, coordenador/administrador e usuário removido.
- ESLint dos arquivos alterados passou.
- TypeScript passou com `noUnusedLocals=false` e o bundle de produção do Vite foi gerado.
- Os erros anteriores de AnamnesePage e GerenciarEstudantes foram resolvidos na implementação das ações de estudantes; o build completo passou.
- Validação no navegador com dados reais: histórico carregado, filtro nativo por operação, comparação de uma alteração e atualização confirmada com preservação dos filtros. Não foram excluídos registros para testar a interface.
- `node scripts/test-auditorias.mjs`: consulta de múltiplas páginas, exclusões, falha sem resultados parciais, identidades por tabela e valores negativos/nulos.
