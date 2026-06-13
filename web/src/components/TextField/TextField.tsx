import { useId, useState, type ReactNode } from 'react';

export type IldsRequiredIndicator = 'text' | 'asterisk';

export type IldsTextFieldProps = {
  /**
   * Figma Kind: Standard (node 13478:25332).
   * Password / OTP deferred to Phase 3c.
   */
  label?: string;
  required?: boolean;
  requiredIndicator?: IldsRequiredIndicator;
  showInfoIcon?: boolean;
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
  suffixText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

/**
 * Figma distinguishes two focus-related states on the container:
 *
 * - **Focused** (13478:25465): empty field (`:placeholder-shown`) + focus → coolgray-50 bg,
 *   coolgray-800 border, orange-600 2px outline ring.
 * - **Typing** (13478:25681): field has value + focus → white bg, primary-orange-500 border,
 *   NO outline ring.
 * - **Hover** (13478:25379): coolgray-100 bg (#f5f5f5), coolgray-800 border.
 *   focus-within:has-[...] has higher specificity than hover: — focused wins when both active.
 */
function containerClasses(
  isDisabled: boolean,
  hasError: boolean,
  hasSuccess: boolean,
): string {
  const base =
    'flex items-center gap-sp-8 min-h-[44px] px-sp-12 rounded-medium border transition-colors font-primary';

  const focusedEmpty = [
    'focus-within:has-[input:placeholder-shown]:bg-neutral-coolgray-50',
    'focus-within:has-[input:placeholder-shown]:border-neutral-coolgray-800',
    'focus-within:has-[input:placeholder-shown]:outline',
    'focus-within:has-[input:placeholder-shown]:outline-2',
    'focus-within:has-[input:placeholder-shown]:outline-offset-2',
    'focus-within:has-[input:placeholder-shown]:outline-primary-orange-600',
  ].join(' ');

  const typingBase = [
    'focus-within:has-[input:not(:placeholder-shown)]:outline-none',
    'focus-within:has-[input:not(:placeholder-shown)]:outline-0',
  ].join(' ');

  if (isDisabled) {
    // Figma 13478:25729 — coolgray-200 bg, coolgray-300 border. No hover on disabled.
    return `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 pointer-events-none`;
  }

  if (hasError) {
    // Figma 13478:25527 — white bg, error-red-600 border.
    return [
      base,
      'bg-white-000 border-error-red-600',
      'hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800',
      focusedEmpty,
      typingBase,
      'focus-within:has-[input:not(:placeholder-shown)]:bg-white-000',
      'focus-within:has-[input:not(:placeholder-shown)]:border-error-red-600',
    ].join(' ');
  }

  if (hasSuccess) {
    // Figma 13478:25519 — white bg, success-green-500 border.
    return [
      base,
      'bg-white-000 border-success-green-500',
      'hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800',
      focusedEmpty,
      typingBase,
      'focus-within:has-[input:not(:placeholder-shown)]:bg-white-000',
      'focus-within:has-[input:not(:placeholder-shown)]:border-success-green-500',
    ].join(' ');
  }

  // Figma 13478:25333 — Default: white bg, coolgray-500 border.
  // Figma 13478:25379 — Hover: coolgray-100 bg, coolgray-800 border. VERIFIED 2026-06-13.
  // Figma 13478:25681 — Typing: white bg, orange-500 border, no ring.
  return [
    base,
    'bg-white-000 border-neutral-coolgray-500',
    'hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800',
    focusedEmpty,
    typingBase,
    'focus-within:has-[input:not(:placeholder-shown)]:bg-white-000',
    'focus-within:has-[input:not(:placeholder-shown)]:border-primary-orange-500',
  ].join(' ');
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.25v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="4.75" r="0.75" fill="currentColor" />
    </svg>
  );
}

/**
 * ILDS TextField — Standard kind.
 *
 * Figma component set: 13478:25332.
 * Verified: Default (25333), Hover (25379), Focused (25465), Typing (25681),
 *           Error (25527), Success (25519), Disabled (25729).
 * Deferred: Filled, Loading, Skeleton, Password, OTP (Phase 3c).
 */
export function IldsTextField({
  label,
  required = false,
  requiredIndicator = 'text',
  showInfoIcon = false,
  placeholder = 'Enter text',
  value,
  helperText,
  errorText,
  successText,
  prefixIcon,
  suffixIcon,
  suffixText,
  disabled = false,
  onChange,
  className = '',
}: IldsTextFieldProps) {
  const inputId = useId();
  const [draft, setDraft] = useState('');

  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : draft;

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
            <span
              data-testid="textfield-required-indicator"
              className={
                requiredIndicator === 'asterisk'
                  ? 'text-12 font-bold font-primary leading-[16px] text-error-red-700'
                  : 'text-[10px] font-normal font-primary leading-[16px] text-neutral-coolgray-800'
              }
            >
              {requiredIndicator === 'asterisk' ? '*' : '(required)'}
            </span>
          ) : null}
          {showInfoIcon ? (
            <span className="inline-flex size-sp-16 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full">
              <InfoIcon />
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
          value={displayValue}
          onChange={(e) => {
            const next = e.target.value;
            if (!isControlled) setDraft(next);
            onChange?.(next);
          }}
          aria-invalid={hasError || undefined}
          className={[
            'flex-1 bg-transparent outline-none',
            'text-14 font-normal font-primary leading-[18px]',
            'text-neutral-coolgray-900',
            'placeholder:text-neutral-coolgray-500',
            'disabled:opacity-100 disabled:text-neutral-coolgray-500',
          ].join(' ')}
        />

        {suffixText || suffixIcon != null ? (
          <span className="inline-flex shrink-0 items-center gap-sp-4 text-neutral-coolgray-800">
            {suffixText ? (
              <span className="text-14 font-normal font-primary leading-[18px]">
                {suffixText}
              </span>
            ) : null}
            {suffixIcon != null ? (
              <span className="inline-flex size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full">
                {suffixIcon}
              </span>
            ) : null}
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
