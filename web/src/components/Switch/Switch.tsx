import { useId, useState, type ReactNode } from 'react';

export type IldsSwitchSize = 'small' | 'medium' | 'large';

export type IldsSwitchProps = {
  /** Figma set 14371:6309. Sizes Small/Medium/Large. On = orange-500 track. */
  label?: ReactNode;
  size?: IldsSwitchSize;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** Optional icon rendered inside the thumb (Figma showIcon). */
  thumbIcon?: ReactNode;
  onChange?: (checked: boolean) => void;
  className?: string;
};

type Dim = { track: string; thumb: string; off: string; on: string };

const dims: Record<IldsSwitchSize, Dim> = {
  small: { track: 'w-[36px] h-sp-20', thumb: 'size-sp-16', off: 'left-[4px]', on: 'left-[16px]' },
  medium: { track: 'w-[44px] h-sp-24', thumb: 'size-sp-20', off: 'left-[4px]', on: 'left-[20px]' },
  large: { track: 'w-[52px] h-[28px]', thumb: 'size-sp-24', off: 'left-[4px]', on: 'left-[24px]' },
};

const labelText: Record<IldsSwitchSize, string> = {
  small: 'text-12',
  medium: 'text-14',
  large: 'text-16',
};

function trackColor(on: boolean, disabled: boolean): string {
  if (disabled) return on ? 'bg-primary-orange-200' : 'bg-neutral-coolgray-100';
  return on
    ? 'bg-primary-orange-500 hover:bg-primary-orange-600'
    : 'bg-neutral-coolgray-100 hover:bg-neutral-coolgray-200';
}

export function IldsSwitch({
  label,
  size = 'medium',
  checked,
  defaultChecked = false,
  disabled = false,
  thumbIcon,
  onChange,
  className = '',
}: IldsSwitchProps) {
  const labelId = useId();
  const [internal, setInternal] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const on = isControlled ? checked : internal;

  const handleToggle = () => {
    if (disabled) return;
    const next = !on;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const dim = dims[size];

  return (
    <div className={['inline-flex items-center gap-sp-8 font-primary', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={label != null ? labelId : undefined}
        aria-label={label == null ? 'Toggle' : undefined}
        disabled={disabled}
        onClick={handleToggle}
        data-testid="switch-track"
        className={[
          'relative inline-flex shrink-0 items-center rounded-full transition-colors',
          'outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-500',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          dim.track,
          trackColor(on, disabled),
        ].join(' ')}
      >
        <span
          data-testid="switch-thumb"
          className={[
            'absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full bg-white-000 shadow-[0px_1px_2px_rgba(0,0,0,0.25)] transition-[left] duration-200',
            dim.thumb,
            on ? dim.on : dim.off,
            'text-neutral-coolgray-700 [&>svg]:size-[60%]',
          ].join(' ')}
        >
          {thumbIcon}
        </span>
      </button>
      {label != null ? (
        <span
          id={labelId}
          className={[
            labelText[size],
            'font-normal font-primary leading-[1.3]',
            disabled ? 'text-neutral-coolgray-300' : 'text-neutral-coolgray-900',
          ].join(' ')}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
