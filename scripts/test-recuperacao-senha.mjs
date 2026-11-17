import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Carrega os modulos reais, substituindo o transporte HTTP; nao acessa API nem banco.
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { tokenRecuperacaoValido, validarNovaSenha } = await server.ssrLoadModule('/src/services/recuperacaoSenhaValidation.ts');
  assert.equal(tokenRecuperacaoValido('a'.repeat(43)), true);
  for (const token of ['', 'a'.repeat(42), 'a'.repeat(44), '!'.repeat(43)]) {
    assert.equal(tokenRecuperacaoValido(token), false);
  }
  assert.equal(validarNovaSenha('senha123', 'senha123'), null);
  assert.equal(validarNovaSenha(' a123 ', ' a123 '), null, 'Espacos da senha devem ser preservados');
  for (const senha of ['', '      ', '12345', 'a'.repeat(73), 'á'.repeat(37)]) {
    assert.notEqual(validarNovaSenha(senha, senha), null);
  }
  assert.equal(validarNovaSenha('á'.repeat(36), 'á'.repeat(36)), null);
  assert.notEqual(validarNovaSenha('senha123', 'outra123'), null);

  const { http } = await server.ssrLoadModule('/src/services/http.ts');
  const { authService } = await server.ssrLoadModule('/src/services/authService.ts');
  const chamadas = [];
  http.defaults.adapter = async config => {
    chamadas.push({ url: config.url, method: config.method, dados: JSON.parse(config.data) });
    return { data: { message: 'Resposta simulada' }, status: 200, statusText: 'OK', headers: {}, config };
  };
  assert.equal((await authService.recuperarSenha({ email: 'pessoa@example.invalid' })).message, 'Resposta simulada');
  await authService.redefinirSenha({ token: 'a'.repeat(43), novaSenha: ' a123 ' });
  assert.deepEqual(chamadas, [
    { url: '/auth/recuperar-senha', method: 'post', dados: { email: 'pessoa@example.invalid' } },
    { url: '/auth/redefinir-senha', method: 'post', dados: { token: 'a'.repeat(43), novaSenha: ' a123 ' } },
  ]);
  console.log('Recuperacao: formato de token, senhas, limites UTF-8 e contrato HTTP verificados com transporte simulado.');
} finally {
  await server.close();
}
