let pending = 0;
const listeners = new Set<() => void>();
export const dataConsultation = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  getSnapshot: () => pending > 0,
  start() {
    pending += 1;
    listeners.forEach(listener => listener());
    let finished = false;
    return () => {
      if (finished) return;
      finished = true;
      pending -= 1;
      listeners.forEach(listener => listener());
    };
  },
};
