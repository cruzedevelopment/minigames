import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { eventBus } from './core/event-bus';
import { isNuiRuntime } from './core/helpers';
import { lookupGame } from './games/registry';
import './styles/theme.css';

import './games/tumbler-lock';
import './games/grid-breaker';
import './games/cipher-dial';
import './games/tile-collapse';
import './games/rapid-keys';
import './games/recall-challenge';

if (!isNuiRuntime()) {
  import('./dev/simulator').then(({ initSimulator }) => initSimulator());
}

const Root: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => {
    const unsub1 = eventBus.on<boolean>('setVisible', setVisible);
    const unsub2 = eventBus.on<string>('navigateMinigame', setActiveSlug);
    return () => { unsub1(); unsub2(); };
  }, []);

  if (!visible) return null;

  const entry = activeSlug ? lookupGame(activeSlug) : null;
  const GameComponent = entry?.component ?? null;

  return (
    <div className="w-full h-full p-5 flex items-center justify-center">
      {GameComponent ? <GameComponent /> : null}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
