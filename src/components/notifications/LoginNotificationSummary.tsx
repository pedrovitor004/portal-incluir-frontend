import { useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { notificacoesService } from '../../services/notificacoesService';
import { podeAnalisarAcesso, solicitacoesAcessoService } from '../../services/solicitacoesAcessoService';
import { notificationService } from '../../services/notificationService';

export default function LoginNotificationSummary() {
  const { usuario, carregando } = useAuth();
  const conta = usuario?.id;
  const pode = podeAnalisarAcesso(usuario);
  const avisada = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (carregando) return;
    if (!conta) { avisada.current = undefined; return; }
    if (avisada.current === conta) return;
    const controller = new AbortController();
    async function avisar() {
      const resultados = await Promise.allSettled([
        notificacoesService.listar(controller.signal),
        pode ? solicitacoesAcessoService.listar(false, controller.signal) : Promise.resolve([]),
      ]);
      await notificationService.aguardarLogin();
      if (controller.signal.aborted) return;
      avisada.current = conta;
      if (resultados.some(r => r.status === 'rejected')) return;
      const [mensagens, pedidos] = resultados;
      if (mensagens.status !== 'fulfilled' || pedidos.status !== 'fulfilled') return;
      const pendentes = pedidos.value.filter(p => p.status === 'PENDENTE');
      const total = mensagens.value.filter(n => !n.lida).length + pendentes.length;
      if (!total) return;
      const atrasadas = pendentes.filter(p => p.atrasada).length;
      void notificationService.info(`Você tem ${total} ${total === 1 ? 'notificação pendente' : 'notificações pendentes'}.${atrasadas ? ` ${atrasadas} ${atrasadas === 1 ? 'solicitação ultrapassou' : 'solicitações ultrapassaram'} o prazo de análise.` : ''} Consulte o sino no topo da tela.`);
    }
    void avisar();
    return () => controller.abort();
  }, [conta, pode, carregando]);
  return null;
}
