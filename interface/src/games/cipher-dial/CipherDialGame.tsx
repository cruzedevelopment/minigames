import { FC, useCallback, useEffect, useState } from 'react';
import { eventBus } from '../../core/event-bus';
import { GamePhase } from '../../core/state-machine';
import { isNuiRuntime } from '../../core/helpers';
import { NuiTransport } from '../../core/nui-transport';
import { useInputBinding } from '../../core/input-manager';
import GameShell from '../../shell/GameShell';
import { DigitChar, generateSecretPin } from './digit-evaluator';

const phaseMessage = (phase: GamePhase): string => {
  switch (phase) {
    case 'failed': return 'PIN cracking failed.';
    case 'won': return 'PIN cracked successfully!';
    case 'cooldown': return 'Reset!';
    default: return '';
  }
};

const CipherDialGame: FC = () => {
  const [duration, setDuration] = useState(20);
  const [cursor, setCursor] = useState(0);
  const [inputLocked, setInputLocked] = useState(true);
  const [codeLength, setCodeLength] = useState(4);
  const [secret, setSecret] = useState<DigitChar[]>();
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pendingInit, setPendingInit] = useState(false);

  const clearDisplay = useCallback((delay: number) => {
    const cells = document.querySelectorAll('.cipher-digit');
    for (let i = codeLength - 1; i >= 0; i--) {
      setTimeout(() => { cells[i].innerHTML = ''; }, (codeLength - i) * delay);
    }
    setTimeout(() => setInputLocked(false), delay * codeLength);
  }, [codeLength]);

  const clearMarkers = useCallback(() => {
    const markers = document.querySelectorAll('.cipher-marker');
    markers.forEach((m) => {
      m.classList.remove('bg-correct', 'bg-misplaced', 'bg-wrong');
      m.classList.add('bg-default');
    });
  }, []);

  const resetBoard = useCallback(() => {
    setCursor(0);
    const pin = generateSecretPin(codeLength);
    setSecret(pin);
    clearMarkers();
    clearDisplay(0);
    setInputLocked(false);
    setPhase('active');
  }, [codeLength, clearMarkers, clearDisplay]);

  useEffect(() => {
    if (phase === 'idle') {
      resetBoard();
    }
  }, [phase, resetBoard]);

  useEffect(() => {
    if (pendingInit) {
      resetBoard();
      setPendingInit(false);
    }
  }, [pendingInit, resetBoard]);

  useEffect(() => {
    return eventBus.on<{ pinLength: number; timer: number }>(
      'playMinigame',
      (data) => {
        setCodeLength(data.pinLength);
        setDuration(data.timer);
        setPendingInit(true);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!isNuiRuntime()) {
      resetBoard();
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, resetBoard]);

  const submitGuess = useCallback(() => {
    if (cursor < codeLength) return;

    const wrappers = document.querySelectorAll('.cipher-wrapper');
    const markers = document.querySelectorAll('.cipher-marker');
    const cells = document.querySelectorAll('.cipher-digit');
    const guess = Array.from(cells).map((d) => d.innerHTML as DigitChar);
    setInputLocked(true);

    for (let i = 0; i < codeLength; i++) {
      setTimeout(() => {
        if (i > 0) wrappers[i - 1].classList.remove('checking');
        wrappers[i].classList.add('checking');

        markers[i].classList.remove('bg-correct', 'bg-misplaced', 'bg-wrong', 'bg-default');
        if (secret && guess[i] === secret[i]) {
          markers[i].classList.add('bg-correct');
        } else if (secret && secret.includes(guess[i])) {
          markers[i].classList.add('bg-misplaced');
        } else {
          markers[i].classList.add('bg-wrong');
        }

        setTimeout(() => wrappers[i].classList.remove('checking'), 250);
      }, i * 250);
    }

    setTimeout(() => {
      if (secret && guess.join('') === secret.join('')) {
        setPhase('won');
      }
      setCursor(0);
      clearDisplay(250);
    }, 1000);
  }, [cursor, codeLength, secret, clearDisplay]);

  const isActive = phase === 'active';

  useInputBinding(
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Enter'],
    (key) => {
      if (!inputLocked && isActive) {
        if (key === 'Enter') {
          submitGuess();
        } else if (key === 'Backspace') {
          const prev = Math.max(cursor - 1, 0);
          setCursor(prev);
          const cells = document.querySelectorAll('.cipher-digit');
          cells[prev].innerHTML = '';
        } else if (cursor < codeLength) {
          const cells = document.querySelectorAll('.cipher-digit');
          cells[cursor].innerHTML = key;
          setCursor(cursor + 1);
        }
      }
    },
    isActive
  );

  return (
    <GameShell
      title="PinCracker"
      description="Decode digits of the pin code"
      buttons={[
        [{ label: 'Crack', color: 'green', callback: submitGuess, disabled: !isActive }],
      ]}
      countdownDuration={duration * 1000}
      resetCallback={handleReset}
      resetDelay={3000}
      phase={phase}
      onPhaseChange={setPhase}
      statusMessage={phaseMessage(phase)}
    >
      <div
        className="rounded-lg flex items-center justify-between text-white text-5xl"
        style={{
          height: '8rem',
          width: '600px',
          maxWidth: '100%',
          background: 'rgba(20, 30, 40, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {[...Array(codeLength)].map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center h-full gap-3 rounded-md cipher-wrapper"
            style={{ width: `${100 / codeLength}%` }}
          >
            <div className="h-[50px] cipher-digit" style={{ minWidth: '1ch' }} />
            <div
              className="h-1 cipher-marker bg-default"
              style={{ width: '2.5rem', borderRadius: '2px' }}
            />
          </div>
        ))}
      </div>
    </GameShell>
  );
};

export default CipherDialGame;
