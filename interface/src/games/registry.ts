import { FC } from 'react';

interface GameRegistration {
  slug: string;
  component: FC;
  displayName: string;
}

const catalog = new Map<string, GameRegistration>();

export function registerGame(entry: GameRegistration): void {
  catalog.set(entry.slug, entry);
}

export function lookupGame(slug: string): GameRegistration | undefined {
  return catalog.get(slug);
}

export const registry = catalog;
