import { eventBus } from '../core/event-bus';

export function initSimulator(): void {
  eventBus.simulate(
    [
      { action: 'setVisible', data: true },
      { action: 'navigateMinigame', data: 'lockpick' },
      {
        action: 'playMinigame',
        data: { title: 'Lockpick', levels: 3, timer: 30 },
      },
    ],
    200
  );
}
