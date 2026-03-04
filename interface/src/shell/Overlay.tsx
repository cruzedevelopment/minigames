import { FC } from 'react';
import classNames from 'classnames';
import { GamePhase } from '../core/state-machine';

interface OverlayProps {
  phase: GamePhase;
  message: string;
}

const Overlay: FC<OverlayProps> = ({ phase, message }) => {
  if (!message) return null;

  const borderClass =
    phase === 'failed'
      ? 'border-[#ff4d4d]/20'
      : phase === 'won'
      ? 'border-[#34d399]/20'
      : 'border-white/10';

  const bgStyle =
    phase === 'failed'
      ? 'rgba(255, 77, 77, 0.08)'
      : phase === 'won'
      ? 'rgba(52, 211, 153, 0.08)'
      : 'rgba(255, 255, 255, 0.05)';

  const textColor =
    phase === 'failed'
      ? '#ff4d4d'
      : phase === 'won'
      ? '#34d399'
      : '#fbbf24';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center rounded-lg z-20"
      style={{ background: 'rgba(14, 21, 27, 0.9)' }}
    >
      <div
        className={classNames(
          'flex items-center justify-center rounded-lg px-6 py-3 border',
          borderClass
        )}
        style={{ background: bgStyle }}
      >
        <p
          className="text-lg font-bold uppercase tracking-widest"
          style={{ color: textColor }}
        >
          {message}
        </p>
      </div>
    </div>
  );
};

export default Overlay;
