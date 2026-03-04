import { registerGame } from '../registry';
import RapidKeysGame from './RapidKeysGame';

registerGame({
  slug: 'chopping',
  component: RapidKeysGame,
  displayName: 'Rapid Keys',
});
