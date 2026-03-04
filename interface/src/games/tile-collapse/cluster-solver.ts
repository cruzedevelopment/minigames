export type TileHue = 'red' | 'green' | 'blue';
export type TileValue = TileHue | 'empty';

export const tileHues: TileHue[] = ['red', 'green', 'blue'];

export const applyGravity = (
  grid: TileValue[],
  rows: number,
  cols: number
): TileValue[] => {
  const result = [...grid];
  for (let col = 0; col < cols; col++) {
    let gap = 0;
    for (let row = rows - 1; row >= 0; row--) {
      if (result[row * cols + col] === 'empty') {
        gap++;
      } else if (gap > 0) {
        result[(row + gap) * cols + col] = result[row * cols + col];
        result[row * cols + col] = 'empty';
      }
    }
  }
  return result;
};

export const compactColumns = (
  grid: TileValue[],
  rows: number,
  cols: number
): TileValue[] => {
  const result = [...grid];
  let gap = 0;
  for (let col = 0; col < cols; col++) {
    let isEmpty = true;
    for (let row = 0; row < rows; row++) {
      if (result[row * cols + col] !== 'empty') {
        isEmpty = false;
        break;
      }
    }
    if (isEmpty) {
      gap++;
    } else if (gap > 0) {
      for (let row = 0; row < rows; row++) {
        result[row * cols + col - gap] = result[row * cols + col];
        result[row * cols + col] = 'empty';
      }
    }
  }
  return result;
};

export const findCluster = (
  grid: TileValue[],
  origin: number,
  rows: number,
  cols: number
): number[] => {
  const hue = grid[origin];
  const cluster: number[] = [];
  const visited = new Array<boolean>(rows * cols).fill(false);

  function explore(idx: number) {
    visited[idx] = true;
    cluster.push(idx);

    const row = Math.floor(idx / cols);
    const col = idx % cols;

    const neighbors = [idx - cols, idx + cols, idx - 1, idx + 1];
    for (const n of neighbors) {
      if (
        n >= 0 &&
        n < rows * cols &&
        (Math.floor(n / cols) === row || n % cols === col) &&
        !visited[n] &&
        grid[n] === hue
      ) {
        explore(n);
      }
    }
  }

  explore(origin);
  return cluster;
};
