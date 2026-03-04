import { isNuiRuntime } from './helpers';

function getResourceName(): string {
  return (window as unknown as { GetParentResourceName?: () => string })
    .GetParentResourceName?.() ?? 'minigames';
}

async function post<T = unknown>(event: string, payload?: unknown): Promise<T> {
  if (!isNuiRuntime()) {
    return {} as T;
  }
  const resp = await fetch(`https://${getResourceName()}/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload),
  });
  return resp.json() as T;
}

export const NuiTransport = {
  dispatch: post,

  conclude(won: boolean): void {
    post('finishedMinigame', { result: won });
  },

  abort(): void {
    post('closeMinigame', {});
  },
};
