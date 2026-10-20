import brasaoRepublica from "../../assets/logos/brasao-republica.jpg";
import logoIfpb from "../../assets/logos/logo-ifpb.png";
import logoClai from "../../assets/logos/logo-clai.png";
import { exigirAcessoRelatorios } from "./relatoriosService";
import type { RelatorioInstitucional } from "../../types/relatorio";
async function imagem(url:string) { const response=await fetch(url); if(!response.ok)throw new Error("Não foi possível carregar a identidade visual do relatório."); const blob=await response.blob(); return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error("Falha ao carregar logomarca."));reader.readAsDataURL(blob);}); }
export async function exportarRelatorio(r:RelatorioInstitucional, formato:"pdf"|"xlsx") {
  exigirAcessoRelatorios(); if(!r.linhas.length || !r.campos.length)throw new Error("Não há dados ou indicadores selecionados para exportar.");
  const nome=`relatorio-institucional-${r.modelo}-${r.consultadoEm.slice(0,10)}`;
  let blob:Blob;
  if(formato==="pdf"){const [{criarPdfRelatorio},ifpb,clai,brasao]=await Promise.all([import("./exportarPdf"),imagem(logoIfpb),imagem(logoClai),imagem(brasaoRepublica)]);blob=criarPdfRelatorio(r,{ifpb,clai,brasao}).output("blob");}
  else {const {criarExcelRelatorio}=await import("./exportarExcel"); const buffer=await criarExcelRelatorio(r);blob=new Blob([new Uint8Array(buffer).buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});}
  exigirAcessoRelatorios(); const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`${nome}.${formato}`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
