import { registerGame } from '../registry';
import TileCollapseGame from './TileCollapseGame';

registerGame({
  slug: 'roofrunning',
  component: TileCollapseGame,
  displayName: 'Tile Collapse',
});
