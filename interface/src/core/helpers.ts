export const isNuiRuntime = (): boolean =>
  !!(window as unknown as { invokeNative?: unknown }).invokeNative;

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomInt(low: number, high: number): number {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

export function clamp(value: number, low: number, high: number): number {
  return Math.min(Math.max(value, low), high);
}
