import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { podeAnalisarAcesso, solicitacoesAcessoService } from '../../services/solicitacoesAcessoService';
import { accessProfiles } from '../../config/access';
import { alertaPadrao as alertaFluxo } from '../../services/alertaPadrao';
export default function AccessRequestReminder() {
  const { usuario }=useAuth(); const navigate=useNavigate(); const pode=podeAnalisarAcesso(usuario);
  const [total, setTotal] = useState(0);
  const conta=usuario?.id; const perfil=usuario?.perfil;
  const entradaAvisada=useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!pode || !conta) return;
    const controller = new AbortController();
    const atualizar = () => { void solicitacoesAcessoService.listar(false, controller.signal).then(lista => { if (!controller.signal.aborted) setTotal(lista.length); }).catch(() => {}); };
    window.addEventListener('portal:access-requests-changed', atualizar);
    window.addEventListener('focus', atualizar);
    return () => { controller.abort(); window.removeEventListener('portal:access-requests-changed', atualizar); window.removeEventListener('focus', atualizar); };
  }, [pode, conta]);
  useEffect(()=>{
    if (!conta) { entradaAvisada.current=undefined; return; }
    if (entradaAvisada.current===conta) return;
    if (!pode || !perfil) return;
    const c=new AbortController();
    solicitacoesAcessoService.listar(false,c.signal).then(async lista=>{
      const atrasadas=lista.filter(s=>s.atrasada);
      if(c.signal.aborted) return;
      setTotal(lista.length);
      entradaAvisada.current=conta;
      if(!atrasadas.length) return;
      const antiga=atrasadas[0];
      const resultado=await alertaFluxo({titleText:'Solicitação de acesso aguardando análise',text:`Solicitação de acesso e cadastro feita há ${antiga.diasPendente} dias. Clique para analisar.${atrasadas.length>1 ? ` Há ${atrasadas.length} pedidos fora do prazo de 48 horas.` : ''}`,icon:'warning',showCancelButton:true,confirmButtonText:'Analisar solicitação',cancelButtonText:'Analisar depois'});
      if(!c.signal.aborted && resultado.isConfirmed) navigate(`${accessProfiles[perfil].basePath}/administracao/solicitacoes?pedido=${antiga.id}`);
    }).catch(()=>{/* A consulta e a opção de tentar novamente continuam disponíveis no sino e na página de solicitações. */});
    return ()=>c.abort();
  },[conta,perfil,pode,navigate]);
  return pode && perfil && total > 0 ? <Link role="status" to={`${accessProfiles[perfil].basePath}/administracao/solicitacoes`} className="fixed bottom-5 right-5 z-40 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-950 shadow-lg">Solicitações de acesso: {total} · Clique para analisar</Link> : null;
}
