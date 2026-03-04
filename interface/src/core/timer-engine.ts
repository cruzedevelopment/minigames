export class TimerEngine {
  private durationMs: number;
  private onTick: (progress: number) => void;
  private onExpire: () => void;
  private startedAt: number | null = null;
  private frozen = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickRate: number;

  constructor(
    durationMs: number,
    onTick: (progress: number) => void,
    onExpire: () => void,
    tickRate = 1000
  ) {
    this.durationMs = durationMs;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.tickRate = tickRate;
  }

  start(): void {
    this.stop();
    this.startedAt = Date.now();
    this.frozen = false;
    this.intervalId = setInterval(() => this.tick(), this.tickRate);
  }

  private tick(): void {
    if (!this.startedAt || this.frozen) return;
    const elapsed = Date.now() - this.startedAt;
    const progress = Math.min(elapsed / this.durationMs, 1) * 100;
    this.onTick(progress);
    if (progress >= 100) {
      this.onExpire();
      this.stop();
    }
  }

  freeze(): void {
    this.tick();
    this.frozen = true;
  }

  elapsed(): number {
    if (!this.startedAt) return 0;
    return Date.now() - this.startedAt;
  }

  progress(): number {
    if (!this.startedAt) return 0;
    return Math.min(this.elapsed() / this.durationMs, 1);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimerEngine(
  durationMs: number,
  onExpire: () => void,
  tickRate = 1000
): {
  progress: number;
  restart: () => void;
  freeze: () => void;
} {
  const [progress, setProgress] = useState(0);
  const engineRef = useRef<TimerEngine | null>(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const engine = new TimerEngine(
      durationMs,
      setProgress,
      () => onExpireRef.current(),
      tickRate
    );
    engineRef.current = engine;
    engine.start();
    return () => engine.stop();
  }, [durationMs, tickRate]);

  const restart = useCallback(() => {
    setProgress(0);
    engineRef.current?.start();
  }, []);

  const freeze = useCallback(() => {
    engineRef.current?.freeze();
  }, []);

  return { progress, restart, freeze };
}
