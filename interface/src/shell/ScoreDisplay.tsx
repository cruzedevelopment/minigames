import { FC } from 'react';

interface ScoreDisplayProps {
  current: number;
  target: number;
}

const ScoreDisplay: FC<ScoreDisplayProps> = ({ current, target }) => (
  <div className="text-sm font-bold tabular-nums" style={{ color: '#00a3ff' }}>
    {current}/{target}
  </div>
);

export default ScoreDisplay;
