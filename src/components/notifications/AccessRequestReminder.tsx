import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { podeAnalisarAcesso, solicitacoesAcessoService } from '../../services/solicitacoesAcessoService';
import { accessProfiles } from '../../config/access';
import { alertaPadrao as alertaFluxo } from '../../services/alertaPadrao';
export default function AccessRequestReminder() {
  const { usuario,carregando }=useAuth(); const navigate=useNavigate(); const pode=podeAnalisarAcesso(usuario);
  const conta=usuario?.id; const perfil=usuario?.perfil;
  const entradaAvisada=useRef<number | undefined>(undefined);
  useEffect(()=>{
    if (carregando || !conta) { entradaAvisada.current=undefined; return; }
    if (entradaAvisada.current===conta) return;
    if (!pode || carregando || !perfil) return;
    const c=new AbortController();
    solicitacoesAcessoService.listar(false,c.signal).then(async lista=>{
      const atrasadas=lista.filter(s=>s.atrasada);
      if(c.signal.aborted) return;
      entradaAvisada.current=conta;
      if(!atrasadas.length) return;
      const antiga=atrasadas[0];
      const resultado=await alertaFluxo({titleText:'Solicitação de acesso aguardando análise',text:`Solicitação de acesso e cadastro feita há ${antiga.diasPendente} dias. Clique para analisar.${atrasadas.length>1 ? ` Há ${atrasadas.length} pedidos fora do prazo de 48 horas.` : ''}`,icon:'warning',showCancelButton:true,confirmButtonText:'Analisar solicitação',cancelButtonText:'Analisar depois'});
      if(!c.signal.aborted && resultado.isConfirmed) navigate(`${accessProfiles[perfil].basePath}/administracao/solicitacoes?pedido=${antiga.id}`);
    }).catch(()=>{/* A consulta e a opção de tentar novamente continuam disponíveis no sino e na página de solicitações. */});
    return ()=>c.abort();
  },[conta,perfil,pode,carregando,navigate]);
  return null;
}
