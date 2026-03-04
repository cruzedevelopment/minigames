import shortImg from '../../assets/images/thermite/short.svg';
import mediumImg from '../../assets/images/thermite/medium.svg';
import longImg from '../../assets/images/thermite/long.svg';

export type PieceKind = 'short' | 'medium' | 'long';

export interface ChessPiece {
  kind: PieceKind;
  distance: number;
  img: string;
}

const pieces: ChessPiece[] = [
  { kind: 'short', distance: 1, img: shortImg },
  { kind: 'medium', distance: 2, img: mediumImg },
  { kind: 'long', distance: 3, img: longImg },
];

export type CellCondition = 'full' | 'half' | 'empty';

export interface Cell {
  piece: ChessPiece;
  condition: CellCondition;
  highlighted: boolean;
}

export type GridRow = Cell[];
export type CellCoord = [row: number, col: number];

export const randomPiece = (): ChessPiece =>
  pieces[Math.floor(Math.random() * pieces.length)];

export const randomCell = (
  condition: CellCondition = 'full',
  highlighted = true
): Cell => ({
  piece: randomPiece(),
  condition,
  highlighted,
});

export const isCellAttacked = (
  target: CellCoord,
  attacker: CellCoord,
  piece: ChessPiece
): boolean => {
  const [tRow, tCol] = target;
  const [aRow, aCol] = attacker;
  return (
    tCol % piece.distance === aCol % piece.distance &&
    tRow % piece.distance === aRow % piece.distance &&
    Math.abs(tCol - aCol) <= piece.distance &&
    Math.abs(tRow - aRow) <= piece.distance
  );
};
