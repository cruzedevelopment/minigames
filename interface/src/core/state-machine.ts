export type GamePhase = 'idle' | 'active' | 'won' | 'failed' | 'cooldown';

const phaseToLegacy: Record<GamePhase, number> = {
  idle: 0,
  active: 1,
  failed: 2,
  won: 3,
  cooldown: 4,
};

const legacyToPhase: Record<number, GamePhase> = {
  0: 'idle',
  1: 'active',
  2: 'failed',
  3: 'won',
  4: 'cooldown',
};

export function toLegacyStatus(phase: GamePhase): number {
  return phaseToLegacy[phase];
}

export function fromLegacyStatus(status: number): GamePhase {
  return legacyToPhase[status] ?? 'idle';
}

const validTransitions: Record<GamePhase, GamePhase[]> = {
  idle: ['active'],
  active: ['won', 'failed'],
  won: ['cooldown', 'idle'],
  failed: ['cooldown', 'idle'],
  cooldown: ['idle', 'active'],
};

export function canTransition(from: GamePhase, to: GamePhase): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

import { useCallback, useEffect, useState } from 'react';
import { isNuiRuntime } from './helpers';
import { NuiTransport } from './nui-transport';

export function useStateMachine(
  onPhaseChange?: (phase: GamePhase) => void
): {
  phase: GamePhase;
  legacyStatus: number;
  transition: (to: GamePhase) => void;
  setLegacyStatus: (status: number) => void;
  resetToActive: () => void;
} {
  const [phase, setPhase] = useState<GamePhase>('idle');

  const transition = useCallback(
    (to: GamePhase) => {
      setPhase(to);
      onPhaseChange?.(to);
    },
    [onPhaseChange]
  );

  const setLegacyStatus = useCallback(
    (status: number) => {
      const target = fromLegacyStatus(status);
      setPhase(target);
      onPhaseChange?.(target);
    },
    [onPhaseChange]
  );

  const resetToActive = useCallback(() => {
    setPhase('active');
    onPhaseChange?.('active');
  }, [onPhaseChange]);

  useEffect(() => {
    if (phase === 'idle') {
      transition('active');
    }
  }, [phase, transition]);

  return { phase, legacyStatus: toLegacyStatus(phase), transition, setLegacyStatus, resetToActive };
}

export function useSessionReset(
  phase: GamePhase,
  transition: (to: GamePhase) => void
): () => void {
  return useCallback(() => {
    if (!isNuiRuntime()) {
      transition('active');
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, transition]);
}
