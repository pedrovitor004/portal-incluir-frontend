import { useState } from "react";
import colorFilters from "../../assets/logos/color-filters.svg?no-inline";
import logoAmarela from "../../assets/logos/amarela.png";
import logoAzul from "../../assets/logos/azul.png";
import logoVerde from "../../assets/logos/verde.png";
import logoVermelha from "../../assets/logos/vermelha.png";
import "../../styles/accessibility-symbols.css";

const symbols = [
  { id: "mobility", label: "Pessoa em cadeira de rodas", image: logoVermelha, filter: `url("${colorFilters}#wheelchair-blue")` },
  { id: "vision", label: "Acessibilidade visual", image: logoAzul, filter: `url("${colorFilters}#eye-red")` },
  { id: "support", label: "Mobilidade com apoio", image: logoVerde },
  { id: "puzzle", label: "Peça de quebra-cabeça", image: logoAmarela },
];

function AnimatedSymbol({ symbol }: { symbol: typeof symbols[number] }) {
  const [sequence, setSequence] = useState(0);
  const [playing, setPlaying] = useState(false);
  return <button type="button" title={symbol.label} aria-label={`Animar símbolo: ${symbol.label}`}
    onClick={() => { setSequence(value => value + 1); setPlaying(true); }}
    className={`accessibility-symbol accessibility-symbol--${symbol.id} ${playing ? "is-playing" : ""}`}>
    <span key={sequence} className="accessibility-symbol__motion" onAnimationEnd={() => setPlaying(false)}>
      <img src={symbol.image} alt="" draggable={false} style={{ filter: symbol.filter }} className="h-14 w-14 rounded-md object-contain" />
    </span>
  </button>;
}

export default function AccessibilitySymbols() {
  return <div className="flex items-center gap-5" role="group" aria-label="Símbolos de inclusão: passe o mouse, use o teclado ou clique para animar">
    {symbols.map(symbol => <AnimatedSymbol key={symbol.id} symbol={symbol} />)}
  </div>;
}
