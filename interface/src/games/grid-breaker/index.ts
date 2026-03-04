import { registerGame } from '../registry';
import GridBreakerGame from './GridBreakerGame';

registerGame({
  slug: 'thermite',
  component: GridBreakerGame,
  displayName: 'Grid Breaker',
});
