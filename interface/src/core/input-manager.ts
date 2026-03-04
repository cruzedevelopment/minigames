type KeyHandler = (key: string) => void;

interface Binding {
  keys: string[];
  handler: KeyHandler;
}

class InputManagerService {
  private bindings: Binding[] = [];
  private attached = false;

  constructor() {
    this.attach();
  }

  private attach(): void {
    if (this.attached) return;
    this.attached = true;
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      for (const binding of this.bindings) {
        if (binding.keys.some((k) => event.key === k)) {
          event.preventDefault();
          binding.handler(event.key);
          break;
        }
      }
    });
  }

  bind(keys: string[], handler: KeyHandler): () => void {
    const binding: Binding = { keys, handler };
    this.bindings.push(binding);
    return () => {
      const idx = this.bindings.indexOf(binding);
      if (idx >= 0) this.bindings.splice(idx, 1);
    };
  }

  unbindAll(): void {
    this.bindings.length = 0;
  }
}

export const inputManager = new InputManagerService();

import { useEffect, useRef } from 'react';

export function useInputBinding(
  keys: string[],
  handler: KeyHandler,
  enabled = true
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    return inputManager.bind(keys, (key) => handlerRef.current(key));
  }, [keys, enabled]);
}
