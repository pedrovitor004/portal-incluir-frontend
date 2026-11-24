# Ordem dos PRs — 21/10/2026

As branches foram separadas por funcionalidade e dependem da anterior na tabela. Abra os PRs com a base indicada para que cada diff mostre somente seu escopo. O envio das branches não cria nem mescla PRs automaticamente.

## Backend — Lara-Menezes/portal-incluir

| Ordem | Branch / abrir PR | Base do PR |
|---|---|---|
| 1 | [feature/gestao-usuarios-permissoes](https://github.com/Lara-Menezes/portal-incluir/compare/develop...feature%2Fgestao-usuarios-permissoes?expand=1) | `develop` |
| 2 | [feature/vinculos-escopo-estudantes](https://github.com/Lara-Menezes/portal-incluir/compare/feature%2Fgestao-usuarios-permissoes...feature%2Fvinculos-escopo-estudantes?expand=1) | `feature/gestao-usuarios-permissoes` |
| 3 | [feature/consulta-auditorias](https://github.com/Lara-Menezes/portal-incluir/compare/feature%2Fvinculos-escopo-estudantes...feature%2Fconsulta-auditorias?expand=1) | `feature/vinculos-escopo-estudantes` |

## Frontend — pedrovitor004/portal-incluir-frontend

| Ordem | Branch / abrir PR | Base do PR |
|---|---|---|
| 1 | [feature/gestao-usuarios-permissoes](https://github.com/pedrovitor004/portal-incluir-frontend/compare/develop...feature%2Fgestao-usuarios-permissoes?expand=1) | `develop` |
| 2 | [feature/auditorias-coordenador](https://github.com/pedrovitor004/portal-incluir-frontend/compare/feature%2Fgestao-usuarios-permissoes...feature%2Fauditorias-coordenador?expand=1) | `feature/gestao-usuarios-permissoes` |
| 3 | [feature/gestao-estudantes](https://github.com/pedrovitor004/portal-incluir-frontend/compare/feature%2Fauditorias-coordenador...feature%2Fgestao-estudantes?expand=1) | `feature/auditorias-coordenador` |
| 4 | [feature/gestao-acompanhamento-coordenador](https://github.com/pedrovitor004/portal-incluir-frontend/compare/feature%2Fgestao-estudantes...feature%2Fgestao-acompanhamento-coordenador?expand=1) | `feature/gestao-estudantes` |

## Revisão e integração

- Integre o backend primeiro, na ordem indicada, e depois o frontend.
- Depois de mesclar o predecessor, altere a base do próximo PR para `develop`.
- Para preservar a sequência sem reapresentar commits, prefira merge commit. Se usar squash/rebase, atualize as branches dependentes antes de alterar a base.
- A infraestrutura compartilhada de sessão e autorização pertence ao primeiro PR. Os arquivos específicos de PEI e Plano de Ação do backend não foram alterados.
- A aba Plano de Ação do perfil do estudante está idêntica à de `develop`. A nova linha do tempo dessa aba foi isolada na branch **local** `reserva/pei-plano-acao`, que não foi enviada e não deve entrar nestes PRs.
- Há backups locais completos em `backup/antes-commits-2026-10-21`, nos dois repositórios. Eles não foram enviados.
- Adaptações/atendimentos/notificações do novo gerenciamento continuam como prévia identificada, conforme `GESTAO-ACOMPANHAMENTO.md`. O backend dessas novas funcionalidades não foi implementado nesta etapa.

Nenhum commit foi enviado diretamente a `develop`, `main` ou `homolog`.
