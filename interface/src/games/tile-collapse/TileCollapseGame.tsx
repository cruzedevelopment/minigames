import { FC, useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { eventBus } from '../../core/event-bus';
import { GamePhase } from '../../core/state-machine';
import { isNuiRuntime } from '../../core/helpers';
import { NuiTransport } from '../../core/nui-transport';
import GameShell from '../../shell/GameShell';
import {
  TileHue,
  TileValue,
  tileHues,
  applyGravity,
  compactColumns,
  findCluster,
} from './cluster-solver';

const phaseMessage = (phase: GamePhase): string => {
  switch (phase) {
    case 'failed': return 'No valid moves remaining.';
    case 'won': return 'All tiles cleared!';
    case 'cooldown': return 'Reset!';
    default: return '';
  }
};

const pickHue = (): TileHue => tileHues[Math.floor(Math.random() * tileHues.length)];

const palette: Record<TileHue, { from: string; to: string; shadow: string }> = {
  red: { from: '#ff4d4d', to: '#991b1b', shadow: '#7f1d1d' },
  green: { from: '#34d399', to: '#065f46', shadow: '#064e3b' },
  blue: { from: '#00a3ff', to: '#003d5c', shadow: '#002d44' },
};

const TileCollapseGame: FC = () => {
  const [duration, setDuration] = useState(25);
  const [rowCount, setRowCount] = useState(8);
  const [colCount, setColCount] = useState(11);
  const [grid, setGrid] = useState<TileValue[]>([]);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pendingInit, setPendingInit] = useState(false);

  const buildGrid = useCallback(() => {
    const tiles: TileHue[] = [];
    for (let i = 0; i < rowCount * colCount; i++) {
      tiles.push(pickHue());
    }
    setGrid(tiles);
    setPhase('active');
  }, [rowCount, colCount]);

  useEffect(() => {
    if (phase === 'idle') {
      buildGrid();
    }
  }, [phase, buildGrid]);

  useEffect(() => {
    if (pendingInit) {
      setGrid(new Array(rowCount * colCount).fill('empty'));
      buildGrid();
      setPendingInit(false);
    }
  }, [pendingInit, rowCount, colCount, buildGrid]);

  useEffect(() => {
    return eventBus.on<{ rows: number; columns: number; timer: number }>(
      'playMinigame',
      (data) => {
        setRowCount(data.rows);
        setColCount(data.columns);
        setDuration(data.timer);
        setPendingInit(true);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!isNuiRuntime()) {
      buildGrid();
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, buildGrid]);

  const evaluateGrid = useCallback(
    (updated: TileValue[]) => {
      if (updated.every((v) => v === 'empty')) {
        setPhase('won');
        return;
      }
      for (const hue of tileHues) {
        if (updated.filter((v) => v === hue).length === 1) {
          setPhase('failed');
          return;
        }
      }
    },
    []
  );

  const handleTileClick = useCallback(
    (idx: number) => {
      if (phase !== 'active') return;
      const cluster = findCluster(grid, idx, rowCount, colCount);
      if (cluster.length > 1) {
        let updated = [...grid];
        cluster.forEach((i) => { updated[i] = 'empty'; });
        updated = applyGravity(updated, rowCount, colCount);
        updated = compactColumns(updated, rowCount, colCount);
        setGrid(updated);
        evaluateGrid(updated);
      }
    },
    [grid, phase, rowCount, colCount, evaluateGrid]
  );

  return (
    <GameShell
      title="Same Game"
      description="Click on matching groups of blocks"
      buttons={[]}
      countdownDuration={duration * 1000}
      resetCallback={handleReset}
      resetDelay={3000}
      phase={phase}
      onPhaseChange={setPhase}
      statusMessage={phaseMessage(phase)}
    >
      <div
        className={classNames('grid mx-auto', phase === 'idle' || phase === 'cooldown' ? 'blur' : '')}
        style={{
          gap: '2px 2px',
          maxWidth: `calc(calc(calc(calc(calc(100vh - 208px) - ${4 * (rowCount - 1)}px) / ${rowCount}) * ${colCount}) + ${2 * (colCount - 1)}px)`,
          width: 'calc(100vw - 64px)',
          gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        }}
      >
        {grid.map((tile, idx) => {
          const hasColor = tile !== 'empty';
          const colors = hasColor ? palette[tile as TileHue] : null;

          return (
            <div
              key={idx}
              onClick={() => handleTileClick(idx)}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '2px',
                overflow: 'hidden',
                cursor: hasColor ? 'pointer' : 'default',
                background: colors
                  ? `linear-gradient(to bottom, ${colors.from}, ${colors.to})`
                  : 'transparent',
                boxShadow: colors ? `0px 3px 0px ${colors.shadow}` : 'none',
                opacity: hasColor ? 1 : 0,
              }}
            >
              {hasColor && (
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', opacity: 0.5 }}>
                  <rect width={100} height={100} fill="none" stroke="white" strokeWidth={2} />
                  <path
                    d="M5 25 V5 H25 M75 5 H95 V25 M95 75 V95 H75 M25 95 H5 V75"
                    fill="none"
                    stroke="white"
                    strokeWidth={1.5}
                  />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </GameShell>
  );
};

export default TileCollapseGame;
