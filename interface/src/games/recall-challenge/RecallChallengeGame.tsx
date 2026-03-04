import { useCallback, useEffect, useState } from 'react';
import { eventBus } from '../../core/event-bus';
import { GamePhase } from '../../core/state-machine';
import { isNuiRuntime } from '../../core/helpers';
import { NuiTransport } from '../../core/nui-transport';
import { useInputBinding } from '../../core/input-manager';
import GameShell from '../../shell/GameShell';
import { drawWords } from './word-pool';

const phaseMessage = (phase: GamePhase): string => {
  switch (phase) {
    case 'failed': return 'Wrong answer!';
    case 'won': return 'All words memorized!';
    case 'cooldown': return 'Reset!';
    default: return '';
  }
};

const RecallChallengeGame = () => {
  const [totalRounds, setTotalRounds] = useState(25);
  const [duration, setDuration] = useState(25);
  const [round, setRound] = useState(0);
  const [activeWord, setActiveWord] = useState<string>();
  const [encountered, setEncountered] = useState<string[]>([]);
  const [wordBank, setWordBank] = useState<string[]>([]);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pendingInit, setPendingInit] = useState(false);

  const pickNextWord = useCallback(
    (bank: string[], prev?: string) => {
      setEncountered((seen) => (prev ? seen.concat([prev]) : seen));
      setActiveWord(bank[Math.floor(Math.random() * bank.length)]);
    },
    []
  );

  const initGame = useCallback(
    (rounds: number) => {
      const bank = drawWords(Math.ceil(rounds / 2));
      setWordBank(bank);
      setRound(0);
      setEncountered([]);
      setActiveWord(bank[Math.floor(Math.random() * bank.length)]);
      setPhase('active');
    },
    []
  );

  useEffect(() => {
    if (phase === 'idle') {
      initGame(totalRounds);
    }
  }, [phase, totalRounds, initGame]);

  useEffect(() => {
    if (pendingInit) {
      initGame(totalRounds);
      setPendingInit(false);
    }
  }, [pendingInit, totalRounds, initGame]);

  useEffect(() => {
    return eventBus.on<{ words: number; timer: number }>(
      'playMinigame',
      (data) => {
        setTotalRounds(data.words);
        setDuration(data.timer);
        setPendingInit(true);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!isNuiRuntime()) {
      initGame(totalRounds);
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, totalRounds, initGame]);

  const advance = useCallback(() => {
    if (round >= totalRounds) {
      setPhase('won');
    } else {
      setRound((r) => r + 1);
      pickNextWord(wordBank, activeWord);
    }
  }, [round, totalRounds, wordBank, activeWord, pickNextWord]);

  const answerSeen = useCallback(() => {
    if (phase !== 'active') return;
    if (encountered.includes(activeWord as string)) {
      advance();
    } else {
      setPhase('failed');
    }
  }, [phase, encountered, activeWord, advance]);

  const answerNew = useCallback(() => {
    if (phase !== 'active') return;
    if (!encountered.includes(activeWord as string)) {
      advance();
    } else {
      setPhase('failed');
    }
  }, [phase, encountered, activeWord, advance]);

  const isActive = phase === 'active';

  useInputBinding(
    ['s', 'S', 'n', 'N'],
    (key) => {
      if (!isActive) return;
      if (key === 's' || key === 'S') answerSeen();
      if (key === 'n' || key === 'N') answerNew();
    },
    isActive
  );

  return (
    <GameShell
      title="Word Memory"
      description="Memorize the words seen"
      buttons={[
        [
          { label: 'Seen (S)', color: 'purple', callback: answerSeen, disabled: !isActive },
          { label: 'New (N)', color: 'green', callback: answerNew, disabled: !isActive },
        ],
      ]}
      countdownDuration={duration * 1000}
      resetCallback={handleReset}
      resetDelay={3000}
      phase={phase}
      onPhaseChange={setPhase}
      statusMessage={phaseMessage(phase)}
    >
      <p className="text-white/60 text-sm text-center w-full mb-2">
        {round}/{totalRounds}
      </p>
      <div
        className="rounded-lg flex items-center justify-center text-white text-4xl font-semibold"
        style={{
          height: '8rem',
          width: '750px',
          maxWidth: '100%',
          background: 'rgba(20, 30, 40, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <p>{activeWord}</p>
      </div>
    </GameShell>
  );
};

export default RecallChallengeGame;
