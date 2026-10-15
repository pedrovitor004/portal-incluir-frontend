# Organização do frontend

`src/layouts/AppLayout.tsx` é o layout autenticado compartilhado por todos os perfis. Ele integra sessão, navegação e conteúdo da página. Novas páginas devem reutilizar esse layout.

## Componentes compartilhados

- `src/components/layout/AppHeader.tsx`: identidade institucional, usuário e botão do menu mobile.
- `src/components/layout/navigation/AppSidebar.tsx`: composição do menu lateral.
- `SidebarMenuItem.tsx`: link e estado de expansão dos subitens.
- `SidebarFooter.tsx`: saída da conta e logo do portal.
- `DesktopNavigation.tsx`: menu desktop e aba lateral para recolher/expandir.
- `MobileNavigation.tsx`: menu sobreposto em telas pequenas.
- `MenuIconBadge.tsx` e `menu.ts`: aparência dos ícones e transformação da configuração em itens do menu.
- `src/components/icons/AppIcons.tsx`: ícones compartilhados.
- `src/components/common/InstitutionalResources.tsx`: recursos institucionais reutilizáveis.

## Configuração por perfil

- `src/config/access.ts`: perfis, permissões e verificação de acesso no frontend.
- `src/config/navigation.ts`: rótulos, ordem, subitens e visibilidade do menu por perfil.
- `src/config/routes.ts`: destinos de entrada após autenticação.
- `src/app/routes/AppRoutes.tsx`: registro das rotas e controle de entrada por perfil.

Para alterar opções de um perfil, ajuste a configuração; evite criar uma cópia do menu ou do layout. As permissões da API continuam sendo responsabilidade do backend.

## Páginas e componentes específicos

`src/pages/coordenador/DashboardCoordenador.tsx` carrega os dados com o hook existente e compõe as seções de `src/pages/coordenador/components/`:

- `DashboardSummary.tsx`: título, carregamento, erro e indicadores.
- `RecentStudents.tsx`: estudantes recentes.
- `RecentNotifications.tsx`: notificações recentes.

Componentes usados apenas por uma página ou área ficam próximos dela. Componentes compartilhados entre perfis ficam em `src/components/`. Hooks, serviços e tipos continuam em suas pastas próprias.

## Modal reutilizável

`src/components/common/Modal.tsx` recebe `open`, `onClose`, `title`, `description` opcional e o conteúdo em `children`. Use um botão com `aria-haspopup="dialog"` para abri-lo e mantenha o estado de abertura na página que o utiliza.

O componente usa o diálogo nativo do navegador para conter o foco e bloquear interações com o fundo. Permite fechar com Escape e pelos botões de fechamento, devolve o foco ao elemento de origem e mantém o conteúdo rolável em telas pequenas.

## Ferramentas sobre os modais

`src/services/overlayTools.ts` mantém uma área compartilhada para o botão de acessibilidade, o widget VLibras e os toasts. Essa área é movida para o diálogo ativo e retorna à página ao fechar, preservando os componentes e o estado do widget. Isso permite que as ferramentas continuem interativas na camada nativa de modais do navegador.

Novos diálogos nativos devem chamar `registerOverlayDialog` depois de `showModal` e executar a função de liberação antes de fechar/desmontar. As notificações usam `getOverlayToolsHost` como destino. O conteúdo visual do modal fica separado dessa área para não recortar ou animar as ferramentas.

## Consulta e edição do perfil

Os componentes de `src/components/profile/`, os tipos em `src/types/profile.ts` e o serviço `src/services/profileService.ts` são compartilhados. Os contratos específicos das APIs ficam em `src/services/profile/adapters/`, habilitados pelo registro em `src/config/profile.ts`. Consulte [perfis.md](perfis.md) para implementar outro perfil sem duplicar os componentes.
