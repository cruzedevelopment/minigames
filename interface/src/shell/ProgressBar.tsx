import { FC } from 'react';
import { GamePhase } from '../core/state-machine';

interface ProgressBarProps {
  progress: number;
  phase: GamePhase;
  tickRate: number;
}

const ProgressBar: FC<ProgressBarProps> = ({ progress, phase, tickRate }) => {
  const isActive = phase === 'active';
  let remaining = 100;

  if (isActive) {
    remaining -= progress;
    remaining -= Math.max(Math.min(tickRate / (tickRate * 100), 1), 0) * 100;
    remaining = Math.max(Math.min(remaining, 100), 0);
  }

  const ratio = remaining / 100;

  const barColor =
    ratio > 0.4
      ? 'var(--primary-gradient)'
      : ratio > 0.15
      ? 'linear-gradient(90deg, #f59e0b, #f97316)'
      : 'var(--danger-gradient)';

  return (
    <div
      className="w-full h-1 rounded-full mb-3 overflow-hidden"
      style={{ background: 'rgba(255, 255, 255, 0.05)' }}
    >
      <div
        className="h-full rounded-full"
        style={{
          transitionProperty: 'width',
          transitionTimingFunction: 'linear',
          transitionDuration: !isActive ? '0ms' : `${tickRate}ms`,
          width: `${remaining}%`,
          background: barColor,
        }}
      />
    </div>
  );
};

export default ProgressBar;
