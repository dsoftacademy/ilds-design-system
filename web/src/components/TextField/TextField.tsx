import { useId, type ReactNode } from 'react';

export type IldsTextFieldProps = {
  /**
   * Figma Kind: Standard (node 13478:25332).
   * Password / OTP deferred to Phase 3c.
   */
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  helperText?: string;
  /** Triggers Error state. Overrides successText. Figma node 13478:25527. */
  errorText?: string;
  /** Triggers Success state. Figma node 13478:25519. */
  successText?: string;
  /** Optional 20px prefix icon slot. Pass SVG with stroke/fill="currentColor". */
  prefixIcon?: ReactNode;
  /** Optional 20px suffix icon slot. Pass SVG with stroke/fill="currentColor". */
  suffixIcon?: ReactNode;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

/**
 * Returns Tailwind classes for the input container div.
 *
 * Focus mechanism: `focus-within:` activates when the inner <input> gets keyboard focus.
 * This applies the orange-600 outline ring + coolgray-50 bg + coolgray-800 border
 * together on the container div — matching Figma node 13478:25465 (Focused state).
 *
 * NOTE: The 2px orange ring comes from `focus-within:outline*` on the container,
 * NOT from a separate wrapper div. Same visual outcome, simpler DOM.
 */
function containerClasses(
  isDisabled: boolean,
  hasError: boolean,
  hasSuccess: boolean,
): string {
  const base = [
    'flex items-center gap-sp-8 min-h-[44px] px-sp-12 rounded-medium border transition-colors font-primary',
    // Focus ring — activates when inner <input> is focused via Tab
    'focus-within:outline focus-within:outline-2 focus-within:outline-offset-2',
    'focus-within:outline-primary-orange-600',
  ].join(' ');

  if (isDisabled) {
    // Figma 13478:25729 — coolgray-200 bg, coolgray-300 border
    return `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 pointer-events-none`;
  }
  if (hasError) {
    // Figma 13478:25527 — white bg, error-red-600 border
    // On focus: coolgray-50 bg + coolgray-800 border (PRESUMED — no error+focused node pulled)
    return [
      base,
      'bg-white-000 border-error-red-600',
      'focus-within:bg-neutral-coolgray-50 focus-within:border-neutral-coolgray-800',
    ].join(' ');
  }
  if (hasSuccess) {
    // Figma 13478:25519 — white bg, success-green-500 border
    return [
      base,
      'bg-white-000 border-success-green-500',
      'focus-within:bg-neutral-coolgray-50 focus-within:border-neutral-coolgray-800',
    ].join(' ');
  }
  // Figma 13478:25333 — Default: white bg, coolgray-500 border
  return [
    base,
    'bg-white-000 border-neutral-coolgray-500',
    'focus-within:bg-neutral-coolgray-50 focus-within:border-neutral-coolgray-800',
  ].join(' ');
}

/**
 * ILDS TextField — Standard kind.
 *
 * Figma component set: 13478:25332.
 * Verified: Default (13478:25333), Focused (13478:25465), Error (13478:25527),
 *           Success (13478:25519), Disabled (13478:25729).
 * Deferred: Hover (13478:25379), Typing, Filled, Loading, Skeleton, Password, OTP.
 */
export function IldsTextField({
  label,
  required = false,
  placeholder = 'Enter text',
  value,
  helperText,
  errorText,
  successText,
  prefixIcon,
  suffixIcon,
  disabled = false,
  onChange,
  className = '',
}: IldsTextFieldProps) {
  const inputId = useId();

  const hasError = !!errorText && !disabled;
  const hasSuccess = !!successText && !disabled && !hasError;

  const helperContent = hasError
    ? errorText
    : hasSuccess
      ? successText
      : helperText;

  const helperColor = hasError
    ? 'text-error-red-600'
    : hasSuccess
      ? 'text-success-green-600'
      : 'text-neutral-coolgray-700';

  return (
    <div className={['flex flex-col gap-sp-4', className].filter(Boolean).join(' ')}>

      {label ? (
        <div
          className={[
            'flex items-center gap-sp-4',
            disabled ? 'opacity-50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <label
            htmlFor={inputId}
            className="text-12 font-bold font-primary leading-[16px] text-neutral-coolgray-900 cursor-default"
          >
            {label}
          </label>
          {required ? (
            <span className="text-[10px] font-normal font-primary leading-[14px] text-neutral-coolgray-800">
              (Required)
            </span>
          ) : null}
        </div>
      ) : null}

      <div
        data-testid="textfield-input"
        className={containerClasses(disabled, hasError, hasSuccess)}
      >
        {prefixIcon != null ? (
          <span className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full">
            {prefixIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-invalid={hasError || undefined}
          className={[
            'flex-1 bg-transparent outline-none',
            'text-14 font-normal font-primary leading-[18px]',
            'text-neutral-coolgray-900',
            'placeholder:text-neutral-coolgray-500',
            'disabled:opacity-100 disabled:text-neutral-coolgray-500',
          ].join(' ')}
        />

        {suffixIcon != null ? (
          <span className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full">
            {suffixIcon}
          </span>
        ) : null}
      </div>

      {!disabled && helperContent ? (
        <p className={`text-12 font-normal font-primary leading-[16px] ${helperColor}`}>
          {helperContent}
        </p>
      ) : null}

    </div>
  );
}
