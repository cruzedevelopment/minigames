import { shuffle } from '../../core/helpers';

export type TumblerColor = 'red' | 'yellow' | 'blue';

const degInterval = 30;
export const slotCount = 360 / degInterval;
export const tumblerColors: TumblerColor[] = ['red', 'yellow', 'blue'];

export interface TumblerRing {
  color: TumblerColor[];
  balls: number[];
  slots: number[];
  rotation: number;
}

export const wrapPosition = (n: number, size: number = slotCount): number => {
  while (n < 0) {
    n += size;
  }
  return n % size;
};

export const forgeRing = (): TumblerRing => {
  const positions: number[] = [];
  const ringColors: TumblerColor[] = [];

  for (let i = 0; i < slotCount; i++) {
    positions.push(i);
    ringColors.push(tumblerColors[Math.floor(Math.random() * tumblerColors.length)]);
  }

  const ballCount = Math.floor(Math.random() * (slotCount + 1 - 5) + 5);
  const markerCount = Math.floor(Math.random() * (slotCount - 4 - 4) + 4);

  const shuffled = shuffle(positions);
  const balls = shuffled.slice(0, ballCount);
  const slots = shuffled.slice(0, markerCount);
  const rotation = Math.floor(Math.random() * slotCount);

  return { color: ringColors, balls, slots, rotation };
};
