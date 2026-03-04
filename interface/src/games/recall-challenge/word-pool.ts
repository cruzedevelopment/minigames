import { generate } from 'random-words';

export function drawWords(count: number): string[] {
  return generate(count) as string[];
}
