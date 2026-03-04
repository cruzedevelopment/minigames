import { FC, useCallback, useEffect, useState } from 'react';
import { eventBus } from '../../core/event-bus';
import { GamePhase } from '../../core/state-machine';
import { isNuiRuntime } from '../../core/helpers';
import { NuiTransport } from '../../core/nui-transport';
import { useInputBinding } from '../../core/input-manager';
import GameShell from '../../shell/GameShell';
import { KeyGlyph, KeyOutcome, randomGlyph } from './sequence-builder';

const phaseMessage = (phase: GamePhase): string => {
  switch (phase) {
    case 'failed': return 'Wrong key pressed.';
    case 'won': return 'Sequence completed!';
    case 'cooldown': return 'Reset!';
    default: return '';
  }
};

const gridCols = 6;

const RapidKeysGame: FC = () => {
  const [duration, setDuration] = useState(7);
  const [sequenceLength, setSequenceLength] = useState(15);
  const [cursor, setCursor] = useState(0);
  const [sequence, setSequence] = useState<KeyGlyph[]>([]);
  const [outcomes, setOutcomes] = useState<KeyOutcome[]>([]);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pendingInit, setPendingInit] = useState(false);

  const buildSequence = useCallback((len: number) => {
    const seq: KeyGlyph[] = [];
    for (let i = 0; i < len; i++) seq.push(randomGlyph());
    setSequence(seq);
    setCursor(0);
    setOutcomes(new Array(len).fill(''));
    setPhase('active');
  }, []);

  useEffect(() => {
    if (phase === 'idle') {
      buildSequence(sequenceLength);
    }
  }, [phase, sequenceLength, buildSequence]);

  useEffect(() => {
    if (pendingInit) {
      setOutcomes(new Array(sequenceLength).fill(''));
      buildSequence(sequenceLength);
      setPendingInit(false);
    }
  }, [pendingInit, sequenceLength, buildSequence]);

  useEffect(() => {
    return eventBus.on<{ letters: number; timer: number }>(
      'playMinigame',
      (data) => {
        setDuration(data.timer);
        setSequenceLength(data.letters);
        setPendingInit(true);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!isNuiRuntime()) {
      buildSequence(sequenceLength);
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, sequenceLength, buildSequence]);

  const isActive = phase === 'active';

  useInputBinding(
    ['Q', 'q', 'W', 'w', 'E', 'e', 'R', 'r', 'A', 'a', 'S', 's', 'D', 'd'],
    (key) => {
      if (!isActive) return;
      const updated = [...outcomes];
      if (key.toUpperCase() === sequence[cursor]) {
        updated[cursor] = 'done';
        setCursor(cursor + 1);
      } else {
        updated[cursor] = 'fail';
      }
      setOutcomes(updated);

      if (updated[updated.length - 1] === 'done') {
        setPhase('won');
      } else if (updated[cursor] === 'fail') {
        setPhase('failed');
      }
    },
    isActive
  );

  const cellSize = 'clamp(2rem, 8vh, 4rem)';

  return (
    <GameShell
      title="Alphabet"
      description="Tap the letters in order"
      buttons={[]}
      countdownDuration={duration * 1000}
      resetCallback={handleReset}
      resetDelay={3000}
      phase={phase}
      onPhaseChange={setPhase}
      statusMessage={phaseMessage(phase)}
    >
      <div
        className="rounded-lg flex items-center justify-center text-white p-2"
        style={{
          background: 'rgba(20, 30, 40, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
          {Array.from({ length: Math.ceil(sequenceLength / gridCols) }).map((_, rowIdx) => (
            <div
              key={rowIdx}
              style={{
                display: 'grid',
                justifyContent: 'center',
                gridTemplateColumns: `repeat(${Math.min(
                  sequenceLength - rowIdx * gridCols,
                  gridCols
                )}, min-content)`,
                gap: '0.5rem',
              }}
            >
              {Array.from({ length: gridCols }).map((_, colIdx) => {
                const pos = rowIdx * gridCols + colIdx;
                if (pos >= sequenceLength) return null;

                const glyph = sequence[pos];
                const isCurrent = pos === cursor;
                const isDone = outcomes[pos] === 'done';
                const isFail = outcomes[pos] === 'fail';

                const borderColor = isFail
                  ? 'rgba(255, 77, 77, 0.4)'
                  : isDone
                  ? 'rgba(52, 211, 153, 0.4)'
                  : isCurrent
                  ? 'rgba(0, 163, 255, 0.6)'
                  : 'rgba(255, 255, 255, 0.15)';

                const textColor = isFail
                  ? '#ff4d4d'
                  : isDone
                  ? '#34d399'
                  : isCurrent
                  ? '#00a3ff'
                  : 'rgba(255, 255, 255, 0.4)';

                const bgColor = isFail
                  ? 'rgba(255, 77, 77, 0.05)'
                  : isDone
                  ? 'rgba(52, 211, 153, 0.05)'
                  : 'transparent';

                return (
                  <div
                    key={colIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      width: cellSize,
                      height: cellSize,
                      color: textColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '5px',
                      backgroundColor: bgColor,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {glyph}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
};

export default RapidKeysGame;
