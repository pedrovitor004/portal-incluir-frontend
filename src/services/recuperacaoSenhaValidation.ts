export function tokenRecuperacaoValido(token: string) { return /^[A-Za-z0-9_-]{43}$/.test(token); }

export function validarNovaSenha(senha: string, confirmacao: string): string | null {
  if (!senha.trim() || senha.length < 6 || senha.length > 72) return "A senha deve ter entre 6 e 72 caracteres.";
  if (new TextEncoder().encode(senha).length > 72) return "Reduza o tamanho da senha: o limite é de 72 bytes, e alguns caracteres ocupam mais de um byte.";
  if (senha !== confirmacao) return "As senhas não coincidem.";
  return null;
}
