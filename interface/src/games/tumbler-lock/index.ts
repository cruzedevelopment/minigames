import { registerGame } from '../registry';
import TumblerLockGame from './TumblerLockGame';

registerGame({
  slug: 'lockpick',
  component: TumblerLockGame,
  displayName: 'Tumbler Lock',
});
