import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import "../styles/accessibility.css";
import logoClai from "../assets/logos/logo-clai.png";
import logoIfpb from "../assets/logos/logo-ifpb.png";

type Preferences = { size: number; contrast: boolean; motion: boolean; spacing: boolean; persistent: boolean };
type Notice = { id: number; message: string; kind: string };
const defaults: Preferences = { size: 100, contrast: false, motion: false, spacing: false, persistent: false };
const storageKey = "portal-accessibility";
const labels: Record<string, string> = { success: "Sucesso", error: "Erro", warning: "Atenção", info: "Informação" };

function loadPreferences(): Preferences {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
    return {
      size: [100, 125, 150, 175, 200].includes(saved?.size) ? saved.size : 100,
      contrast: saved?.contrast === true, motion: saved?.motion === true,
      spacing: saved?.spacing === true, persistent: saved?.persistent === true,
    };
  } catch { return defaults; }
}

export default function Accessibility() {
  const [preferences, setPreferences] = useState(loadPreferences);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [speech, setSpeech] = useState<"idle" | "playing" | "paused">("idle");
  const [speechError, setSpeechError] = useState("");
  const [rate, setRate] = useState(1);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const speechGeneration = useRef(0);
  const location = useLocation();
  const speechAvailable = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${preferences.size}%`;
    root.dataset.contrast = String(preferences.contrast);
    root.dataset.reducedMotion = String(preferences.motion);
    root.dataset.readingSpacing = String(preferences.spacing);
    root.dataset.persistentNotices = String(preferences.persistent);
    try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* Preferences still work without storage. */ }
  }, [preferences]);

  useEffect(() => {
    function open() {
      if (!dialog.current?.open) {
        returnFocus.current = document.activeElement as HTMLElement | null;
        dialog.current?.showModal();
      }
    }
    function notice(event: Event) {
      const detail = (event as CustomEvent<{ message: string; kind: string }>).detail;
      setNotices(current => [...current.slice(-19), { ...detail, id: Date.now() + Math.random() }]);
    }
    window.addEventListener("portal:accessibility", open);
    window.addEventListener("portal:notice", notice);
    return () => {
      window.removeEventListener("portal:accessibility", open);
      window.removeEventListener("portal:notice", notice);
    };
  }, []);

  useEffect(() => {
    const generationState = speechGeneration;
    generationState.current++;
    if (speechAvailable) window.speechSynthesis.cancel();
    const frame = requestAnimationFrame(() => {
      setSpeech("idle");
      if (location.pathname === "/") setNotices([]);
      dialog.current?.close();
      const main = document.querySelector<HTMLElement>("main");
      const heading = main?.querySelector<HTMLElement>("[data-page-title]") || main?.querySelector<HTMLElement>("h1, h2");
      document.title = `${heading?.textContent?.trim() || "Página"} | Portal Incluir`;
      if (main) { main.id = "main-content"; main.tabIndex = -1; }
      const target = heading || main;
      if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    });
    return () => { cancelAnimationFrame(frame); generationState.current++; if (speechAvailable) window.speechSynthesis.cancel(); };
  }, [location.pathname, speechAvailable]);

  function stop() {
    speechGeneration.current++;
    if (speechAvailable) window.speechSynthesis.cancel();
    utterance.current = null;
    setSpeech("idle");
  }

  function read() {
    if (!speechAvailable) return;
    stop();
    const generation = speechGeneration.current;
    setSpeechError("");
    const main = document.querySelector("main");
    // Only visible text is read: input values (including passwords) are never collected.
    const text = (main as HTMLElement | null)?.innerText.trim();
    if (!text) { setSpeechError("Não há conteúdo disponível para leitura nesta página."); return; }
    const chunks = text.match(/[^.!?\n]+[.!?]?/g)?.flatMap(part => part.match(/.{1,180}(?:\s|$)|\S{1,180}/g) || []) || [text];
    let index = 0;
    function next() {
      if (generation !== speechGeneration.current) return;
      if (index >= chunks.length) { setSpeech("idle"); utterance.current = null; return; }
      const item = new SpeechSynthesisUtterance(chunks[index++]);
      item.lang = "pt-BR";
      item.rate = rate;
      item.onend = next;
      item.onerror = event => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          setSpeechError("Não foi possível reproduzir a leitura. Verifique as vozes disponíveis no dispositivo.");
          setSpeech("idle");
        }
      };
      utterance.current = item;
      window.speechSynthesis.speak(item);
    }
    setSpeech("playing");
    next();
  }

  function toggle(key: Exclude<keyof Preferences, "size">) {
    setPreferences(current => ({ ...current, [key]: !current[key] }));
  }

  return <>
    <a className="skip-link" href="#main-content" onClick={() => document.querySelector<HTMLElement>("main")?.focus()}>Pular para o conteúdo</a>
    <button ref={trigger} className="accessibility-trigger" onClick={() => window.dispatchEvent(new Event("portal:accessibility"))} aria-haspopup="dialog" aria-label="Acessibilidade" title="Acessibilidade">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="2" /><path d="M4 8l8 2 8-2M12 10v5m0 0-4 6m4-6 4 6" /></svg>
    </button>
    <dialog ref={dialog} className="accessibility-panel" aria-labelledby="accessibility-title" onClose={() => (returnFocus.current?.isConnected ? returnFocus.current : trigger.current)?.focus()}>
      <div className="accessibility-heading">
        <div className="accessibility-institution">
          <img src={logoIfpb} alt="Instituto Federal da Paraíba" />
          <img src={logoClai} alt="Coordenação Local de Acessibilidade e Inclusão" />
          <div><strong>IFPB Campus Monteiro</strong><span>CLAI · Portal Incluir</span></div>
        </div>
        <button className="accessibility-close" onClick={() => dialog.current?.close()} aria-label="Fechar acessibilidade" title="Fechar">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div className="accessibility-intro">
        <span className="accessibility-eyebrow">Um portal para todas as pessoas</span>
        <h2 id="accessibility-title">Acessibilidade e inclusão</h2>
        <p>A CLAI e o IFPB Campus Monteiro promovem um ambiente educacional inclusivo. Aqui, você pode adaptar a leitura e a navegação às suas necessidades.</p>
        <span className="accessibility-save-note"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 12 4 4L19 6" /></svg>Preferências salvas automaticamente neste navegador</span>
      </div>
      <div className="accessibility-content">
      <fieldset>
        <legend>Leitura e exibição</legend>
        <label htmlFor="accessibility-size">Tamanho do texto</label>
        <select id="accessibility-size" value={preferences.size} onChange={e => setPreferences(current => ({ ...current, size: Number(e.target.value) }))}>
          {[100, 125, 150, 175, 200].map(size => <option key={size} value={size}>{size}%</option>)}
        </select>
        <label><input type="checkbox" checked={preferences.contrast} onChange={() => toggle("contrast")} /><span><strong>Alto contraste</strong><small>Fundo escuro e informações em destaque.</small></span></label>
        <label><input type="checkbox" checked={preferences.spacing} onChange={() => toggle("spacing")} /><span><strong>Espaçamento ampliado</strong><small>Mais espaço entre linhas e palavras.</small></span></label>
        <label><input type="checkbox" checked={preferences.motion} onChange={() => toggle("motion")} /><span><strong>Reduzir animações</strong><small>Uma navegação com menos movimento.</small></span></label>
        <label><input type="checkbox" checked={preferences.persistent} onChange={() => toggle("persistent")} /><span><strong>Notificações persistentes</strong><small>As mensagens ficam abertas até você fechar.</small></span></label>
      </fieldset>
      <fieldset>
        <legend>Leitura em voz alta</legend>
        <div className="accessibility-audio-symbol" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m11 5-6 4H2v6h3l6 4V5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></svg></div>
        <h3>Ouça o conteúdo da página</h3>
        <p>Use a voz do seu dispositivo para acompanhar os textos no seu ritmo.</p>
        {speechAvailable ? <>
          <label htmlFor="speech-rate">Velocidade da leitura</label>
          <select id="speech-rate" value={rate} onChange={e => setRate(Number(e.target.value))}>
            <option value={0.75}>Lenta</option><option value={1}>Normal</option><option value={1.25}>Rápida</option>
          </select>
          <div className="accessibility-actions">
            <button className="accessibility-play" onClick={read}>Ouvir página</button>
            <button disabled={speech === "idle"} onClick={() => {
              if (speech === "paused") { window.speechSynthesis.resume(); setSpeech("playing"); }
              else { window.speechSynthesis.pause(); setSpeech("paused"); }
            }}>{speech === "paused" ? "Continuar leitura" : "Pausar leitura"}</button>
            <button disabled={speech === "idle"} onClick={stop}>Parar leitura</button>
          </div>
          <p role="status">{speech === "playing" ? "Leitura em andamento." : speech === "paused" ? "Leitura pausada." : "Leitura parada."}</p>
        </> : <p>Este navegador não oferece leitura em voz alta. Você pode usar o leitor de tela do dispositivo.</p>}
        {speechError && <p role="alert">{speechError}</p>}
        <p className="accessibility-audio-note">A velocidade é aplicada ao iniciar. Os valores digitados nos campos não são lidos.</p>
      </fieldset>
      <details className="accessibility-details">
        <summary>Orientações de navegação e Libras</summary>
        <div>
        <p>Use Tab e Shift + Tab para percorrer os controles, Enter para ativar botões e links, e Escape para fechar janelas. Nos grupos de opções, use as setas.</p>
        <p>Você pode usar o leitor de tela ou o controle por voz do dispositivo. Diga o nome que aparece no botão. O portal não precisa acessar seu microfone.</p>
        <p>Para tradução automática em Libras, use o botão do VLibras na lateral. A disponibilidade depende do serviço externo.</p>
        </div>
      </details>
      <details className="accessibility-details">
        <summary>Mensagens desta sessão <span className="accessibility-count">{notices.length}</span></summary>
        <div>
        <p>As últimas 20 mensagens ficam disponíveis enquanto esta página estiver aberta.</p>
        {notices.length ? <><ul>{notices.map(notice => <li key={notice.id}><strong>{labels[notice.kind] || "Mensagem"}:</strong> {notice.message}</li>)}</ul><button onClick={() => setNotices([])}>Limpar mensagens</button></> : <p>Nenhuma mensagem nesta sessão.</p>}
        </div>
      </details>
      </div>
      <footer className="accessibility-footer"><span>Suas escolhas, seu jeito de navegar.<small>CLAI · IFPB Campus Monteiro</small></span><button onClick={() => setPreferences(defaults)}>Restaurar preferências</button></footer>
    </dialog>
  </>;
}
