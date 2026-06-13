import { useId, useState, type ReactNode } from 'react';

export type IldsCheckboxSize = 'small' | 'medium' | 'large';
export type IldsCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

export type IldsCheckboxProps = {
  /** Figma set 13520:33495. Sizes Small/Medium/Large; states checked/unchecked/indeterminate. */
  label?: ReactNode;
  size?: IldsCheckboxSize;
  /** Controlled state. Omit for uncontrolled (toggles checked⇄unchecked on click). */
  state?: IldsCheckboxState;
  defaultState?: IldsCheckboxState;
  disabled?: boolean;
  hasError?: boolean;
  errorText?: string;
  onChange?: (state: IldsCheckboxState) => void;
  className?: string;
};

const boxSize: Record<IldsCheckboxSize, string> = {
  small: 'size-sp-16',
  medium: 'size-sp-20',
  large: 'size-sp-24',
};

const radius: Record<IldsCheckboxSize, string> = {
  small: 'rounded-[2px]',
  medium: 'rounded-medium',
  large: 'rounded-medium',
};

const labelText: Record<IldsCheckboxSize, string> = {
  small: 'text-12',
  medium: 'text-14',
  large: 'text-16',
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="size-full">
      <path d="M3.5 8.5l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function boxClasses(
  size: IldsCheckboxSize,
  on: boolean,
  disabled: boolean,
  hasError: boolean,
): string {
  const base = [
    boxSize[size],
    radius[size],
    'shrink-0 inline-flex items-center justify-center border box-border transition-colors',
    'outline-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-orange-500',
  ].join(' ');

  if (disabled) {
    return on
      ? `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 text-neutral-coolgray-400`
      : `${base} bg-neutral-coolgray-50 border-neutral-coolgray-200`;
  }
  if (hasError) {
    return on
      ? `${base} bg-error-red-600 border-error-red-600 border-2 text-white-000`
      : `${base} bg-white-000 border-error-red-600 border-2`;
  }
  if (on) {
    // Figma checked Default — orange-500 fill + border (2px), white check.
    return `${base} bg-primary-orange-500 border-primary-orange-500 border-2 text-white-000 hover:bg-primary-orange-600 hover:border-primary-orange-600`;
  }
  // Unchecked Default — white fill, coolgray-600 border (1px).
  return `${base} bg-white-000 border-neutral-coolgray-600 hover:bg-neutral-coolgray-50 hover:border-neutral-coolgray-400`;
}

export function IldsCheckbox({
  label,
  size = 'medium',
  state,
  defaultState = 'unchecked',
  disabled = false,
  hasError = false,
  errorText,
  onChange,
  className = '',
}: IldsCheckboxProps) {
  const inputId = useId();
  const [internal, setInternal] = useState<IldsCheckboxState>(defaultState);
  const isControlled = state !== undefined;
  const current = isControlled ? state : internal;

  const isChecked = current === 'checked';
  const isIndeterminate = current === 'indeterminate';
  const on = isChecked || isIndeterminate;

  const handleToggle = () => {
    if (disabled) return;
    const next: IldsCheckboxState = on ? 'unchecked' : 'checked';
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={['inline-flex flex-col gap-sp-4 font-primary', className].filter(Boolean).join(' ')}>
      <label
        htmlFor={inputId}
        className={[
          'inline-flex items-start gap-sp-8',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <input
          id={inputId}
          type="checkbox"
          className="peer sr-only"
          checked={isChecked}
          ref={(el) => {
            if (el) el.indeterminate = isIndeterminate;
          }}
          disabled={disabled}
          aria-checked={isIndeterminate ? 'mixed' : isChecked}
          aria-invalid={hasError || undefined}
          onChange={handleToggle}
        />
        <span data-testid="checkbox-box" className={boxClasses(size, on, disabled, hasError)}>
          {isIndeterminate ? (
            <span className="block h-[2px] w-1/2 rounded-full bg-current" />
          ) : isChecked ? (
            <span className="block size-[70%]">
              <CheckIcon />
            </span>
          ) : null}
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
      {hasError && errorText && !disabled ? (
        <p className="text-12 font-normal font-primary leading-[16px] text-error-red-600">
          {errorText}
        </p>
      ) : null}
    </div>
  );
}
