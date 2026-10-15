import type { Usuario } from "../types/auth";
import { isUsuario } from "./sessionStorage";

type Message =
  | { type: "request"; requestId: string; sourceTab?: string }
  | { type: "session"; requestId: string; usuario: unknown }
  | { type: "return-request"; requestId: string; sourceTab: string }
  | { type: "return-ready"; requestId: string }
  | { type: "logout"; userId: number };

let tabId: string | undefined;
export function getSessionTabId(): string {
  return tabId ??= crypto.randomUUID();
}

/** Same-origin navigation identity only, without passwords/tokens or persistent storage. */
export function connectSessionTabs(read: () => Usuario | null, receive: (usuario: Usuario | null) => void, sourceTab?: string) {
  if (typeof BroadcastChannel === "undefined") return { close() {}, logout(_userId: number) { void _userId; } };
  const channel = new BroadcastChannel("portal-session-tabs");
  const requestId = crypto.randomUUID();
  let pending = !read();
  channel.onmessage = (event: MessageEvent<Message>) => {
    const message = event.data;
    if (!message || typeof message !== "object") return;
    if (message.type === "return-request" && message.sourceTab === getSessionTabId() && typeof message.requestId === "string") {
      window.focus();
      channel.postMessage({ type: "return-ready", requestId: message.requestId } satisfies Message);
    } else if (message.type === "request" && typeof message.requestId === "string") {
      const usuario = read();
      if (usuario && (!message.sourceTab || message.sourceTab === getSessionTabId())) channel.postMessage({ type: "session", requestId: message.requestId, usuario } satisfies Message);
    } else if (message.type === "session" && pending && message.requestId === requestId && !read() && isUsuario(message.usuario)) {
      pending = false;
      receive(message.usuario);
    } else if (message.type === "logout" && read()?.id === message.userId) {
      pending = false;
      receive(null);
    }
  };
  if (pending) channel.postMessage({ type: "request", requestId, sourceTab } satisfies Message);
  return {
    close() { pending = false; channel.close(); },
    logout(userId: number) { pending = false; channel.postMessage({ type: "logout", userId } satisfies Message); },
  };
}

/** Check that the source still exists before closing the document tab. */
export function requestSourceTabFocus(sourceTab: string): Promise<boolean> {
  if (typeof BroadcastChannel === "undefined") return Promise.resolve(false);
  return new Promise(resolve => {
    const channel = new BroadcastChannel("portal-session-tabs");
    const requestId = crypto.randomUUID();
    const finish = (found: boolean) => { clearTimeout(timeout); channel.close(); resolve(found); };
    const timeout = setTimeout(() => finish(false), 700);
    channel.onmessage = (event: MessageEvent<Message>) => {
      if (event.data?.type === "return-ready" && event.data.requestId === requestId) finish(true);
    };
    channel.postMessage({ type: "return-request", requestId, sourceTab } satisfies Message);
  });
}
