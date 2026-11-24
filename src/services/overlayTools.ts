import "../styles/overlay-tools.css";

const dialogs: HTMLDialogElement[] = [];
let observer: MutationObserver | undefined;
let toolsHost: HTMLElement | undefined;

/** One stable portal target: moving it preserves widget, toast and React state. */
export function getOverlayToolsHost(): HTMLElement {
  // React can detach a dialog before its effect cleanup runs. Keep the same
  // host even while detached: existing React portals still target this node.
  let host = toolsHost ?? document.getElementById("portal-overlay-tools");
  if (!host) {
    host = document.createElement("div");
    host.id = "portal-overlay-tools";
  }
  toolsHost = host;
  if (!host.isConnected) document.body.append(host);
  const target = host;
  const attachVLibras = () => {
    const widget = document.querySelector<HTMLElement>("[vw]");
    if (widget && !target.contains(widget)) target.append(widget);
  };
  attachVLibras();
  if (!observer) {
    observer = new MutationObserver(records => {
      if (records.some(record => Array.from(record.addedNodes).some(node =>
        node instanceof Element && (node.matches("[vw]") || node.querySelector("[vw]"))))) attachVLibras();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  return host;
}

function placeTools() {
  const host = getOverlayToolsHost();
  const active = [...dialogs].reverse().find(dialog => dialog.isConnected && dialog.open);
  (active ?? document.body).append(host);
}

/** Native modal descendants stay interactive; z-index alone cannot escape inertness. */
export function registerOverlayDialog(dialog: HTMLDialogElement): () => void {
  dialogs.push(dialog);
  placeTools();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const index = dialogs.lastIndexOf(dialog);
    if (index !== -1) dialogs.splice(index, 1);
    placeTools();
  };
}
