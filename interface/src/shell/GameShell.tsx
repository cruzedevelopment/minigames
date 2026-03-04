import { FC, ReactNode, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { GamePhase } from '../core/state-machine';
import { useTimerEngine } from '../core/timer-engine';
import ProgressBar from './ProgressBar';
import Overlay from './Overlay';
import ActionPanel, { ActionButton } from './ActionPanel';
import ScoreDisplay from './ScoreDisplay';

interface GameShellProps {
  children: ReactNode;
  title: string;
  description?: string;
  buttons: ActionButton[][];
  countdownDuration: number;
  resetCallback: () => void;
  resetDelay: number;
  phase: GamePhase;
  onPhaseChange: (phase: GamePhase) => void;
  statusMessage: string;
  score?: number;
  targetScore?: number;
  className?: string;
}

const GameShell: FC<GameShellProps> = ({
  children,
  title,
  description,
  buttons,
  countdownDuration,
  resetCallback,
  resetDelay,
  phase,
  onPhaseChange,
  statusMessage,
  score,
  targetScore,
  ...props
}) => {
  const tickRate = 1000;
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTimerExpire = useCallback(() => {
    onPhaseChange('failed');
  }, [onPhaseChange]);

  const { progress, restart: restartTimer, freeze: freezeTimer } = useTimerEngine(
    countdownDuration,
    handleTimerExpire,
    tickRate
  );

  useEffect(() => {
    if (phase !== 'active' && phase !== 'idle') {
      freezeTimer();

      resetTimerRef.current = setTimeout(() => {
        resetCallback();
        restartTimer();
      }, resetDelay);

      return () => {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      };
    }
  }, [phase, freezeTimer, resetCallback, resetDelay, restartTimer]);

  return (
    <div
      className={classNames(
        'max-h-full max-w-full rounded-lg overflow-hidden',
        props.className
      )}
      style={{
        animation: 'fadeIn 0.3s ease-out forwards',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8)',
      }}
    >
      <div
        className="max-h-full max-w-full relative p-4 flex flex-col justify-center border border-white/10 rounded-lg"
        style={{
          background: 'radial-gradient(ellipse at center, #1e2a32 0%, #0e151b 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-white/30">{description}</p>
            )}
          </div>
          {targetScore !== undefined && (
            <ScoreDisplay current={score ?? 0} target={targetScore} />
          )}
        </div>

        <ProgressBar progress={progress} phase={phase} tickRate={tickRate} />

        <Overlay phase={phase} message={statusMessage} />

        <div className="w-full pb-2 flex-1 min-h-0 overflow-hidden">{children}</div>

        <ActionPanel rows={buttons} />
      </div>
    </div>
  );
};

export default GameShell;
