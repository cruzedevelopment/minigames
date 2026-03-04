import { registerGame } from '../registry';
import CipherDialGame from './CipherDialGame';

registerGame({
  slug: 'pincracker',
  component: CipherDialGame,
  displayName: 'Cipher Dial',
});
