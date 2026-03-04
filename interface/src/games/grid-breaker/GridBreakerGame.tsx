import { FC, Fragment, useCallback, useEffect, useState } from 'react';
import { eventBus } from '../../core/event-bus';
import { GamePhase } from '../../core/state-machine';
import { isNuiRuntime } from '../../core/helpers';
import { NuiTransport } from '../../core/nui-transport';
import GameShell from '../../shell/GameShell';
import {
  GridRow,
  CellCoord,
  Cell,
  randomCell,
  randomPiece,
  isCellAttacked,
} from './board-engine';
import crossImg from '../../assets/images/thermite/cross.svg';
import backgroundImg from '../../assets/images/thermite/background.svg';
import './GridBreakerGame.css';

const phaseMessage = (phase: GamePhase): string => {
  switch (phase) {
    case 'failed': return 'Decryption failed.';
    case 'won': return 'Decryption successful!';
    case 'cooldown': return 'Reset!';
    default: return '';
  }
};

const defaultConfig = { timer: 60, targetScore: 24, rows: 6, columns: 6 };

const GridBreakerGame: FC = () => {
  const [board, setBoard] = useState<GridRow[]>([]);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lastHitAt, setLastHitAt] = useState(-1);
  const [comboTier, setComboTier] = useState(0);
  const [suppressGlow, setSuppressGlow] = useState(false);
  const [showCombo, setShowCombo] = useState(false);
  const [stalemate, setStalemate] = useState(false);
  const [duration, setDuration] = useState(defaultConfig.timer);
  const [goal, setGoal] = useState(defaultConfig.targetScore);
  const [rowCount, setRowCount] = useState(defaultConfig.rows);
  const [colCount, setColCount] = useState(defaultConfig.columns);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [pendingInit, setPendingInit] = useState(false);

  const buildBoard = useCallback((): void => {
    const fresh: GridRow[] = [];
    for (let r = 0; r < rowCount; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < colCount; c++) {
        row.push(randomCell());
      }
      fresh.push(row);
    }
    setBoard(fresh);
    setPoints(0);
    setCombo(0);
    setLastHitAt(-1);
    setComboTier(0);
    setStalemate(false);
    setSuppressGlow(false);
    setPhase('active');
  }, [rowCount, colCount]);

  useEffect(() => {
    if (phase === 'idle') {
      buildBoard();
    }
  }, [phase, buildBoard]);

  useEffect(() => {
    if (pendingInit) {
      buildBoard();
      setPendingInit(false);
    }
  }, [pendingInit, buildBoard]);

  useEffect(() => {
    return eventBus.on<{ targetScore: number; rows: number; columns: number; timer: number }>(
      'playMinigame',
      (data) => {
        setGoal(data.targetScore);
        setRowCount(data.rows);
        setColCount(data.columns);
        setDuration(data.timer);
        setPendingInit(true);
      }
    );
  }, []);

  const handleReset = useCallback(() => {
    if (!isNuiRuntime()) {
      buildBoard();
    } else {
      NuiTransport.conclude(phase === 'won');
    }
  }, [phase, buildBoard]);

  const handleCellClick = useCallback(
    (coord: CellCoord): void => {
      if (phase !== 'active') return;

      const [clickRow, clickCol] = coord;
      const clicked = board[clickRow][clickCol];
      if (!clicked.highlighted || clicked.condition === 'empty') return;

      let attackCount = 0;
      const updated = [...board].map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if ((clickRow === rIdx && clickCol === cIdx) || cell.condition === 'empty') {
            return cell;
          }
          const hit = isCellAttacked([rIdx, cIdx], coord, clicked.piece);
          if (hit) attackCount++;
          cell.highlighted = hit;
          return cell;
        })
      );
      setBoard(updated);

      if (attackCount === 0) {
        setStalemate(true);
        setPhase('failed');
        return;
      }

      if (clicked.condition === 'half') {
        let curCombo = combo;
        let curPoints = points + 1;

        const now = Date.now();
        if (curCombo === 0 || now - lastHitAt <= 1000) {
          curCombo++;
        } else {
          curCombo = 0;
        }
        setLastHitAt(now);

        if (curCombo >= 3) {
          curPoints += Math.pow(2, comboTier);
          setCombo(0);
          setComboTier(comboTier + 1);
          setShowCombo(true);
        } else {
          setCombo(curCombo);
        }
        setPoints(curPoints);

        if (curPoints >= goal) {
          setPhase('won');
          return;
        }
      } else {
        setCombo(0);
      }

      const nextBoard = [...board];
      nextBoard[clickRow][clickCol] = {
        condition: clicked.condition === 'full' ? 'half' : 'empty',
        piece: randomPiece(),
        highlighted: false,
      };
      setBoard(nextBoard);
    },
    [board, combo, phase, lastHitAt, points, goal, comboTier]
  );

  return (
    <GameShell
      title="Thermite"
      description="Decrypt the required number of bytes"
      buttons={[]}
      countdownDuration={duration * 1000}
      resetCallback={handleReset}
      resetDelay={3000}
      phase={phase}
      onPhaseChange={setPhase}
      statusMessage={phaseMessage(phase)}
      score={points}
      targetScore={goal}
    >
      <div
        className={'grid-breaker' + (phase === 'idle' || phase === 'cooldown' ? ' blur' : '')}
        style={{
          width: '100%',
          maxHeight: 'calc(100vh - 160px)',
          aspectRatio: `${colCount} / ${rowCount}`,
          maxWidth: '100%',
          margin: '0 auto',
          gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
        }}
      >
        {board.map((row, rIdx) => (
          <Fragment key={rIdx}>
            {row.map((cell, cIdx) => (
              <div
                key={`${rIdx}_${cIdx}`}
                className="cell"
                data-condition={
                  stalemate && cell.condition !== 'empty' ? 'fail' : cell.condition
                }
                data-highlighted={cell.highlighted}
                onClick={() => handleCellClick([rIdx, cIdx])}
              >
                <span className="piece-icon">
                  <img src={cell.piece.img} alt="" width={75} height={75} />
                </span>
                <div className="corner-marks">
                  <img src={crossImg} alt="" width={16} height={16} />
                  <img src={crossImg} alt="" width={16} height={16} />
                  <img src={crossImg} alt="" width={16} height={16} />
                  <img src={crossImg} alt="" width={16} height={16} />
                </div>
                <div
                  className="glow"
                  style={{ animationName: suppressGlow ? 'none' : 'breaker-glow' }}
                />
              </div>
            ))}
          </Fragment>
        ))}
        <div className="combo-notice">
          <span
            style={{ animationName: showCombo ? 'notice' : 'none' }}
            onAnimationEnd={() => setShowCombo(false)}
          >
            CRC Bypassed!
          </span>
        </div>
        <img src={backgroundImg} alt="" className="backdrop-pattern" />
      </div>
    </GameShell>
  );
};

export default GridBreakerGame;
