import assert from 'node:assert/strict';
import { createServer } from 'vite';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { getMenuItems } = await server.ssrLoadModule('/src/components/layout/navigation/menu.ts');
  const { getNavigationGroups, matchesNavigationPath } = await server.ssrLoadModule('/src/components/layout/navigation/navigationGroups.ts');
  const base = { id: 1, perfilId: 1, nome: 'Teste', email: 'teste@example.invalid' };
  const contas = [
    ...['COORDENADOR', 'ADMINISTRADOR', 'PROFESSOR', 'EQUIPE_MULTIDISCIPLINAR'],
    { ...base, perfil: 'COORDENADOR', root: true },
    { ...base, perfil: 'COORDENADOR', permissoes: [] },
    { ...base, perfil: 'PROFESSOR', permissoes: ['usuarios', 'pedagogico.editar'] },
  ];
  for (const conta of contas) {
    const antes = getMenuItems(conta).flatMap(item => [...(item.groupOnly ? [] : [item.path]), ...(item.children ?? []).map(child => child.path)]).sort();
    const groups = getNavigationGroups(conta);
    const depois = groups.flatMap(group => group.tabs.length ? group.tabs.map(tab => tab.path) : [...(group.item.groupOnly ? [] : [group.item.path]), ...(group.item.children ?? []).map(child => child.path)]).sort();
    assert.deepEqual(depois, antes, 'Every permitted destination must remain reachable through section navigation');
    groups.forEach((group, index) => {
      const original = getMenuItems(conta)[index];
      if ((original.children?.length ?? 0) <= 2) {
        assert.deepEqual(group.item, original, 'Small submenus must remain unchanged');
        assert.equal(group.tabs.length, 0);
      } else {
        assert.equal(group.item.children, undefined);
        assert.ok(group.tabs.length > 2);
        assert.ok(group.tabs.some(tab => tab.path === group.item.path));
      }
    });
  }
  assert.equal(matchesNavigationPath('/coordenador/administracao/usuarios-extra', '/coordenador/administracao/usuarios'), false);
  assert.equal(matchesNavigationPath('/coordenador/estudantes/42', '/coordenador/estudantes'), true);
  const root = getNavigationGroups({ ...base, perfil: 'COORDENADOR', root: true });
  assert.equal(root.filter(group => group.tabs.length).length, 1);
  assert.ok(root.find(group => group.item.path.includes('/administracao/')).tabs.length > 2);
  console.log('Navigation: compact sidebar, section tabs, destination coverage and permission filtering verified for all profiles.');
} finally { await server.close(); }
