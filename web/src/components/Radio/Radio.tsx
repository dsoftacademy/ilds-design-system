import { useId, type ReactNode } from 'react';

export type IldsRadioSize = 'small' | 'medium' | 'large';

export type IldsRadioProps = {
  /** Figma set 13486:38485. Sizes Small/Medium/Large. */
  label?: ReactNode;
  size?: IldsRadioSize;
  checked?: boolean;
  defaultChecked?: boolean;
  name?: string;
  value?: string;
  disabled?: boolean;
  hasError?: boolean;
  onChange?: (value?: string) => void;
  className?: string;
};

const circleSize: Record<IldsRadioSize, string> = {
  small: 'size-sp-16',
  medium: 'size-sp-20',
  large: 'size-sp-24',
};

const dotSize: Record<IldsRadioSize, string> = {
  small: 'size-sp-8',
  medium: 'size-[10px]',
  large: 'size-sp-12',
};

const labelText: Record<IldsRadioSize, string> = {
  small: 'text-12',
  medium: 'text-14',
  large: 'text-16',
};

/**
 * Selection driven by the native radio via `peer-checked:` so uncontrolled
 * groups (shared `name`) work without JS state.
 * Figma: unselected border coolgray-600 (#757575), selected ring + dot orange-500 (#e3530f).
 */
function circleClasses(disabled: boolean, hasError: boolean): string {
  const base = [
    'shrink-0 inline-flex items-center justify-center rounded-full border box-border transition-colors',
    'outline-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-orange-500',
  ].join(' ');

  if (disabled) {
    return `${base} bg-neutral-coolgray-50 border-neutral-coolgray-200 peer-checked:[&>span]:block`;
  }
  if (hasError) {
    return `${base} bg-white-000 border-error-red-600 border-2 peer-checked:[&>span]:block`;
  }
  return [
    base,
    'bg-white-000 border-neutral-coolgray-600',
    'peer-hover:border-neutral-coolgray-400',
    'peer-checked:border-primary-orange-500 peer-checked:border-2',
    'peer-checked:peer-hover:border-primary-orange-600',
    // Reveal the inner dot (child of this sibling span) when the peer input is checked.
    'peer-checked:[&>span]:block',
  ].join(' ');
}

export function IldsRadio({
  label,
  size = 'medium',
  checked,
  defaultChecked,
  name,
  value,
  disabled = false,
  hasError = false,
  onChange,
  className = '',
}: IldsRadioProps) {
  const inputId = useId();
  const isControlled = checked !== undefined;

  const dotColor = disabled
    ? 'bg-neutral-coolgray-300'
    : hasError
      ? 'bg-error-red-600'
      : 'bg-primary-orange-500';

  return (
    <div className={['inline-flex flex-col gap-sp-4 font-primary', className].filter(Boolean).join(' ')}>
      <label
        htmlFor={inputId}
        className={[
          'inline-flex items-center gap-sp-8',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <input
          id={inputId}
          type="radio"
          className="peer sr-only"
          name={name}
          value={value}
          checked={isControlled ? checked : undefined}
          defaultChecked={isControlled ? undefined : defaultChecked}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          onChange={() => onChange?.(value)}
        />
        <span
          data-testid="radio-circle"
          className={[circleSize[size], circleClasses(disabled, hasError)].join(' ')}
        >
          <span className={['hidden rounded-full', dotSize[size], dotColor].join(' ')} />
        </span>
        {label != null ? (
          <span
            className={[
              labelText[size],
              'font-normal font-primary leading-[1.3]',
              disabled ? 'text-neutral-coolgray-300' : 'text-neutral-coolgray-900',
            ].join(' ')}
          >
            {label}
          </span>
        ) : null}
      </label>
    </div>
  );
}
