type Message =
  | { type: "changed" }
  | { type: "return-request"; requestId: string; sourceTab: string }
  | { type: "return-ready"; requestId: string };
let tabId: string | undefined;
export function getSessionTabId(): string { return tabId ??= crypto.randomUUID(); }

/** As abas compartilham o cookie. O aviso apenas solicita nova confirmação ao servidor. */
export function connectSessionTabs(onChanged: () => void) {
  if (typeof BroadcastChannel === "undefined") return { close() {}, changed() {} };
  const channel = new BroadcastChannel("portal-session-tabs");
  channel.onmessage = (event: MessageEvent<Message>) => {
    const message = event.data;
    if (!message || typeof message !== "object") return;
    if (message.type === "changed") onChanged();
    else if (message.type === "return-request" && message.sourceTab === getSessionTabId() && typeof message.requestId === "string") {
      window.focus(); channel.postMessage({ type: "return-ready", requestId: message.requestId } satisfies Message);
    }
  };
  return { close() { channel.close(); }, changed() { channel.postMessage({ type: "changed" } satisfies Message); } };
}
export function requestSourceTabFocus(sourceTab: string): Promise<boolean> {
  if (typeof BroadcastChannel === "undefined") return Promise.resolve(false);
  return new Promise(resolve => {
    const channel = new BroadcastChannel("portal-session-tabs");
    const requestId = crypto.randomUUID();
    const finish = (found: boolean) => { clearTimeout(timeout); channel.close(); resolve(found); };
    const timeout = setTimeout(() => finish(false), 700);
    channel.onmessage = (event: MessageEvent<Message>) => { if (event.data?.type === "return-ready" && event.data.requestId === requestId) finish(true); };
    channel.postMessage({ type: "return-request", requestId, sourceTab } satisfies Message);
  });
}
