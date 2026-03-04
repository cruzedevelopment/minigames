type Callback<T = unknown> = (data: T) => void;

interface NuiEnvelope<T = unknown> {
  action: string;
  data: T;
}

class EventBusService {
  private listeners = new Map<string, Set<Callback>>();
  private attached = false;

  constructor() {
    this.attach();
  }

  private attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('message', (event: MessageEvent<NuiEnvelope>) => {
      const { action, data } = event.data ?? {};
      if (action) {
        this.dispatch(action, data);
      }
    });
  }

  on<T = unknown>(action: string, handler: Callback<T>): () => void {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, new Set());
    }
    const handlers = this.listeners.get(action)!;
    handlers.add(handler as Callback);
    return () => {
      handlers.delete(handler as Callback);
    };
  }

  off<T = unknown>(action: string, handler: Callback<T>): void {
    this.listeners.get(action)?.delete(handler as Callback);
  }

  dispatch(action: string, data?: unknown): void {
    this.listeners.get(action)?.forEach((fn) => fn(data));
  }

  simulate(events: Array<{ action: string; data: unknown }>, delayMs = 1000): void {
    events.forEach((evt, i) => {
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent('message', { data: evt })
        );
      }, delayMs * i);
    });
  }
}

export const eventBus = new EventBusService();
