import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { eventBus } from '../../core/event-bus';
import { GamePhase } from '../../core/state-machine';
import { isNuiRuntime } from '../../core/helpers';
import { NuiTransport } from '../../core/nui-transport';
import { useInputBinding } from '../../core/input-manager';
import GameShell from '../../shell/GameShell';
import { TumblerRing, forgeRing, wrapPosition, slotCount } from './ring-factory';

const degInterval = 30;

const phaseMessage = (phase: GamePhase): string => {
  switch (phase) {
    case 'failed': return 'The lockpick bent out of shape.';
    case 'won': return 'The lock was picked successfully.';
    case 'cooldown': return 'Reset!';
    default: return '';
  }
};

const maxTiers = 5;

const TumblerLockGame = () => {
  const [heading, setHeading] = useState('Lockpick');
  const [tiers, setTiers] = useState(maxTiers);
  const [duration, setDuration] = useState(30);
  const [rings, setRings] = useState<TumblerRing[]>([]);
  const [angle, setAngle] = useState(0);
  const [tier, setTier] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pendingInit, setPendingInit] = useState(false);

  const initializeGame = useCallback((numTiers: number) => {
    const forged: TumblerRing[] = [];
    for (let i = 0; i < numTiers; i++) {
      forged.push(forgeRing());
    }
    setRings(forged);
    setTier(0);
    setAngle(forged[0].rotation);
    setPhase('active');
  }, []);

  useEffect(() => {
    if (phase === 'idle') {
      initializeGame(tiers);
    }
  }, [phase, tiers, initializeGame]);

  useEffect(() => {
    if (pendingInit) {
      initializeGame(tiers);
      setPendingInit(false);
    }
  }, [pendingInit, tiers, initializeGame]);

  useEffect(() => {
    return eventBus.on<{ title: string; levels: number; timer: number }>(
      'playMinigame',
      (data) => {
        setHeading(data.title);
        setTiers(data.levels);
        setDuration(data.timer);
        setPendingInit(true);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!isNuiRuntime()) {
      initializeGame(tiers);
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, tiers, initializeGame]);

  const advanceTier = useCallback(() => {
    if (tier >= tiers - 1) {
      setPhase('won');
    } else {
      const next = tier + 1;
      setTier(next);
      setAngle(rings[next].rotation);
    }
  }, [tier, tiers, rings]);

  const rotateRing = useCallback(
    (shift: number) => {
      const next = angle + shift;
      setAngle(next);
      rings[tier].rotation = next;
    },
    [angle, rings, tier]
  );

  const attemptUnlock = useCallback(() => {
    const ring = rings[tier];
    for (const slot of ring.slots) {
      const ballPos = wrapPosition(slot - wrapPosition(angle));
      if (ring.balls.includes(ballPos)) {
        if (ring.color[ballPos] !== ring.color[slot]) {
          setPhase('failed');
          return;
        }
      }
    }
    advanceTier();
  }, [rings, tier, angle, advanceTier]);

  const isActive = phase === 'active';

  useInputBinding(
    ['ArrowLeft', 'a', 'A'],
    () => { if (isActive) rotateRing(-1); },
    isActive
  );
  useInputBinding(
    ['ArrowRight', 'd', 'D'],
    () => { if (isActive) rotateRing(1); },
    isActive
  );
  useInputBinding(
    ['Enter', ' '],
    () => { if (isActive) attemptUnlock(); },
    isActive
  );

  const svgExtent = 50 * (tiers * 2 + 1);

  return (
    <GameShell
      title={heading}
      description="Unlock each lock"
      buttons={[
        [
          { label: 'Rotate Left', color: 'purple', callback: () => rotateRing(-1), disabled: !isActive },
          { label: 'Rotate Right', color: 'purple', callback: () => rotateRing(1), disabled: !isActive },
        ],
        [
          { label: 'Unlock', color: 'green', callback: attemptUnlock, disabled: !isActive },
        ],
      ]}
      countdownDuration={duration * 1000}
      resetCallback={handleReset}
      resetDelay={3000}
      phase={phase}
      onPhaseChange={setPhase}
      statusMessage={phaseMessage(phase)}
    >
      <div
        className={classNames(
          'aspect-square max-h-full max-w-full rounded-lg flex items-center justify-center relative',
          phase === 'idle' || phase === 'cooldown' ? 'blur' : ''
        )}
        style={{
          background: 'rgba(20, 30, 40, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxWidth: 'calc(100vh - 298px)',
          width: 'calc(100vw - 64px)',
        }}
      >
        <div className="aspect-square flex items-center justify-center size-full absolute">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            className="size-full aspect-square"
            viewBox={`0 0 ${svgExtent} ${svgExtent}`}
            style={{ overflow: 'visible' }}
          >
            <g>
              {[...Array(slotCount / 2)].map((_, idx) => (
                <line
                  key={idx}
                  x1={35}
                  x2={svgExtent - 35}
                  y1={svgExtent / 2}
                  y2={svgExtent / 2}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={1.2}
                  style={{
                    transformOrigin: 'center',
                    transform: `rotate(${idx * degInterval}deg)`,
                  }}
                />
              ))}
            </g>

            {rings.map((ring, ringIdx) => {
              const radius = (ringIdx + 1) * 50 - 10;
              const markerRadius = radius + 15;

              const ringStroke =
                tier > ringIdx || phase === 'won'
                  ? '#34d399'
                  : phase === 'failed' && tier === ringIdx
                  ? '#ff4d4d'
                  : 'rgba(255,255,255,0.4)';

              const ballFill = (ballIdx: number) => {
                if (tier > ringIdx || phase === 'won') return '#34d399';
                if (phase === 'failed' && tier === ringIdx) return '#ff4d4d';
                const c = ring.color[ballIdx];
                if (c === 'blue') return '#00a3ff';
                if (c === 'yellow') return '#fbbf24';
                if (c === 'red') return '#ff4d4d';
                return '#fff';
              };

              const markerStroke = (slotIdx: number) => {
                if (tier > ringIdx || phase === 'won') return '#34d399';
                if (phase === 'failed' && tier === ringIdx) return '#ff4d4d';
                const c = ring.color[slotIdx];
                if (c === 'blue') return '#00a3ff';
                if (c === 'yellow') return '#fbbf24';
                if (c === 'red') return '#ff4d4d';
                return '#fff';
              };

              return (
                <g key={ringIdx}>
                  <circle
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth={3}
                    cx="50%"
                    cy="50%"
                    r={radius}
                  />
                  {ring.balls.map((ball, idx) => (
                    <circle
                      key={`b-${idx}`}
                      fill={ballFill(ball)}
                      cx="50%"
                      cy="50%"
                      r="8.5px"
                      style={{
                        transformOrigin: 'center',
                        transform: `rotate(${(ball + ring.rotation) * 30}deg) translateX(${radius}px)`,
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    />
                  ))}
                  {ring.slots.map((slot, idx) => (
                    <circle
                      key={`s-${idx}`}
                      fill="none"
                      stroke={markerStroke(slot)}
                      strokeWidth={5}
                      cx="50%"
                      cy="50%"
                      r={markerRadius}
                      style={{
                        transformOrigin: 'center',
                        transform: `rotate(${-15 + slot * 30}deg)`,
                        strokeDasharray: `${2 * markerRadius * Math.PI}`,
                        strokeDashoffset: `${(11 * (2 * markerRadius * Math.PI)) / 12}`,
                      }}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </GameShell>
  );
};

export default TumblerLockGame;
