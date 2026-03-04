import { registerGame } from '../registry';
import RecallChallengeGame from './RecallChallengeGame';

registerGame({
  slug: 'wordmemory',
  component: RecallChallengeGame,
  displayName: 'Recall Challenge',
});
