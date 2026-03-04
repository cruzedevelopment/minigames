import { FC, MouseEventHandler } from 'react';
import classNames from 'classnames';

interface ActionButton {
  label: string;
  color: 'purple' | 'green';
  callback?: () => void;
  disabled: boolean;
}

interface ActionPanelProps {
  rows: ActionButton[][];
}

const getButtonStyle = (color: 'purple' | 'green'): React.CSSProperties => {
  if (color === 'purple') {
    return {
      background: 'radial-gradient(ellipse at center, #006299 0%, #00a3ff 100%)',
      borderColor: '#00a3ff',
    };
  }
  return {
    background: 'radial-gradient(ellipse at center, #065f46 0%, #34d399 100%)',
    borderColor: '#34d399',
  };
};

const ActionPanel: FC<ActionPanelProps> = ({ rows }) => {
  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col w-full gap-1.5 pt-1">
      {rows.map((buttonRow, rowIdx) => (
        <div className="flex gap-1.5 *:flex-1" key={rowIdx}>
          {buttonRow.map((btn, btnIdx) => (
            <button
              key={btnIdx}
              className={classNames(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer border overflow-hidden',
                'disabled:opacity-40 disabled:pointer-events-none',
                'text-white hover:brightness-110 active:scale-[0.97]'
              )}
              style={getButtonStyle(btn.color)}
              disabled={btn.disabled}
              onClick={btn.callback as unknown as MouseEventHandler}
            >
              {btn.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export type { ActionButton };
export default ActionPanel;
