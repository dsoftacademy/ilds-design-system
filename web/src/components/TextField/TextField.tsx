import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

export type IldsRequiredIndicator = 'text' | 'asterisk';
export type IldsTextFieldKind = 'standard' | 'password' | 'otp6' | 'otp4';

export type IldsTextFieldProps = {
  /**
   * Figma Kind variants on set 13478:25332.
   * Standard (default), Password (13478:25341), OTP x 6 (13478:25349), OTP x 4 (13478:25366).
   */
  kind?: IldsTextFieldKind;
  label?: string;
  required?: boolean;
  requiredIndicator?: IldsRequiredIndicator;
  showInfoIcon?: boolean;
  placeholder?: string;
  value?: string;
  /** OTP only — called when all cells are filled. */
  onOtpComplete?: (otp: string) => void;
  helperText?: string;
  /** Orange text link on the footer right (Figma Password/OTP rows). */
  helpButtonLabel?: string;
  onHelpPress?: () => void;
  /** Triggers Error state. Overrides successText. Figma node 13478:25527. */
  errorText?: string;
  /** Triggers Success state. Figma node 13478:25519. */
  successText?: string;
  /** Optional 20px prefix icon slot. Pass SVG with stroke/fill="currentColor". */
  prefixIcon?: ReactNode;
  /** Optional 20px suffix icon slot (standard kind only). */
  suffixIcon?: ReactNode;
  suffixText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

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
    return `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 pointer-events-none`;
  }

  if (hasError) {
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

function otpCellClasses(
  isDisabled: boolean,
  hasError: boolean,
  hasSuccess: boolean,
  isFocused: boolean,
  hasValue: boolean,
): string {
  const base = [
    'relative flex flex-1 items-center justify-center',
    'min-h-[44px] min-w-[40px] max-w-[60px] px-sp-12',
    'rounded-medium border bg-white-000 transition-colors font-primary',
  ].join(' ');

  if (isDisabled) {
    return `${base} border-neutral-coolgray-300 bg-neutral-coolgray-200 pointer-events-none`;
  }

  if (hasError) {
    return [
      base,
      'border-error-red-600',
      isFocused && hasValue ? 'border-error-red-600' : '',
      isFocused && !hasValue
        ? 'border-neutral-coolgray-500 outline outline-2 outline-offset-2 outline-primary-orange-600'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (hasSuccess) {
    return [
      base,
      'border-success-green-500',
      isFocused && hasValue ? 'border-success-green-500' : '',
      isFocused && !hasValue
        ? 'border-neutral-coolgray-500 outline outline-2 outline-offset-2 outline-primary-orange-600'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  if (isFocused && hasValue) {
    return `${base} border-primary-orange-500`;
  }

  if (isFocused && !hasValue) {
    return `${base} border-neutral-coolgray-500 outline outline-2 outline-offset-2 outline-primary-orange-600`;
  }

  return `${base} border-neutral-coolgray-500`;
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

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-6.5 0-10-7-10-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19M1 1l22 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M9.88 9.88a3 3 0 104.24 4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LabelRow({
  label,
  inputId,
  required,
  requiredIndicator,
  showInfoIcon,
  disabled,
  asGroupLabel = false,
}: {
  label: string;
  inputId?: string;
  required: boolean;
  requiredIndicator: IldsRequiredIndicator;
  showInfoIcon: boolean;
  disabled: boolean;
  /** OTP — use span + id for aria-labelledby; no htmlFor (multi-cell). */
  asGroupLabel?: boolean;
}) {
  const labelClass =
    'text-12 font-bold font-primary leading-[16px] text-neutral-coolgray-900 cursor-default';

  return (
    <div
      className={[
        'flex items-center gap-sp-4',
        disabled ? 'opacity-50' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {asGroupLabel ? (
        <span id={inputId} className={labelClass}>
          {label}
        </span>
      ) : (
        <label htmlFor={inputId} className={labelClass}>
          {label}
        </label>
      )}
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
  );
}

function FooterRow({
  helperContent,
  helperColor,
  helpButtonLabel,
  onHelpPress,
}: {
  helperContent?: string;
  helperColor: string;
  helpButtonLabel?: string;
  onHelpPress?: () => void;
}) {
  if (!helperContent && !helpButtonLabel) return null;

  return (
    <div className="flex items-start justify-between gap-sp-8">
      {helperContent ? (
        <p className={`text-12 font-normal font-primary leading-[16px] ${helperColor}`}>
          {helperContent}
        </p>
      ) : (
        <span />
      )}
      {helpButtonLabel ? (
        <button
          type="button"
          onClick={onHelpPress}
          className="shrink-0 text-12 font-bold font-primary leading-[16px] text-primary-orange-500"
        >
          {helpButtonLabel}
        </button>
      ) : null}
    </div>
  );
}

function OtpField({
  cellCount,
  disabled,
  hasError,
  hasSuccess,
  value,
  onChange,
  onOtpComplete,
  groupId,
}: {
  cellCount: 4 | 6;
  disabled: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onOtpComplete?: (otp: string) => void;
  groupId: string;
}) {
  const [draft, setDraft] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const isControlled = value !== undefined;
  const otpValue = (isControlled ? value : draft).slice(0, cellCount).padEnd(cellCount, ' ');
  const digits = otpValue.split('');

  useEffect(() => {
    const filled = (isControlled ? value ?? '' : draft).replace(/\D/g, '').length;
    if (filled > 0) {
      const target = Math.min(filled, cellCount) - 1;
      setFocusedIndex(target);
      inputRefs.current[target]?.focus();
    }
  }, []);

  const updateOtp = (next: string) => {
    const trimmed = next.replace(/\D/g, '').slice(0, cellCount);
    if (!isControlled) setDraft(trimmed);
    onChange?.(trimmed);
    if (trimmed.length === cellCount) onOtpComplete?.(trimmed);
  };

  const focusCell = (index: number) => {
    const clamped = Math.max(0, Math.min(cellCount - 1, index));
    setFocusedIndex(clamped);
    inputRefs.current[clamped]?.focus();
  };

  return (
    <div
      data-testid="textfield-otp"
      className="flex items-center gap-sp-8"
      role="group"
      aria-labelledby={groupId}
    >
      {digits.map((digit, index) => {
        const hasDigit = digit.trim().length > 0;
        const isFocused = focusedIndex === index;

        return (
          <div
            key={index}
            data-testid={`otp-cell-${index}`}
            className={otpCellClasses(disabled, hasError, hasSuccess, isFocused, hasDigit)}
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              disabled={disabled}
              value={hasDigit ? digit : ''}
              aria-label={`OTP digit ${index + 1}`}
              onFocus={() => setFocusedIndex(index)}
              onChange={(e) => {
                const nextChar = e.target.value.replace(/\D/g, '').slice(-1);
                const chars = digits.map((d) => (d.trim() ? d : ''));
                chars[index] = nextChar;
                const joined = chars.join('').replace(/\s/g, '');
                updateOtp(joined);
                if (nextChar && index < cellCount - 1) focusCell(index + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digits[index].trim() && index > 0) {
                  e.preventDefault();
                  const chars = digits.map((d) => (d.trim() ? d : ''));
                  chars[index - 1] = '';
                  updateOtp(chars.join(''));
                  focusCell(index - 1);
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData
                  .getData('text')
                  .replace(/\D/g, '')
                  .slice(0, cellCount);
                if (!pasted) return;
                updateOtp(pasted);
                focusCell(Math.min(pasted.length, cellCount) - 1);
              }}
              className={[
                'w-full bg-transparent text-center outline-none',
                'text-14 font-bold font-primary leading-[18px]',
                hasDigit ? 'text-neutral-coolgray-900' : 'text-neutral-coolgray-500',
                'disabled:text-neutral-coolgray-500',
              ].join(' ')}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * ILDS TextField — Standard, Password, OTP x 6, OTP x 4.
 *
 * Figma component set: 13478:25332.
 * Standard verified: Default, Hover, Focused, Typing, Error, Success, Disabled.
 * Phase 3c: Password (25341/25691), OTP x 6 (25349/25481/25701), OTP x 4 (25366).
 */
export function IldsTextField({
  kind = 'standard',
  label,
  required = false,
  requiredIndicator = 'text',
  showInfoIcon = false,
  placeholder = 'Enter text',
  value,
  onOtpComplete,
  helperText,
  helpButtonLabel,
  onHelpPress,
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
  const labelId = useId();
  const [draft, setDraft] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : draft;
  const isPassword = kind === 'password';
  const isOtp = kind === 'otp6' || kind === 'otp4';

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
        isOtp ? (
          <LabelRow
            label={label}
            inputId={labelId}
            required={required}
            requiredIndicator={requiredIndicator}
            showInfoIcon={showInfoIcon}
            disabled={disabled}
            asGroupLabel
          />
        ) : (
          <LabelRow
            label={label}
            inputId={inputId}
            required={required}
            requiredIndicator={requiredIndicator}
            showInfoIcon={showInfoIcon}
            disabled={disabled}
          />
        )
      ) : null}

      {isOtp ? (
        <OtpField
          cellCount={kind === 'otp6' ? 6 : 4}
          disabled={disabled}
          hasError={hasError}
          hasSuccess={hasSuccess}
          value={value}
          onChange={onChange}
          onOtpComplete={onOtpComplete}
          groupId={labelId}
        />
      ) : (
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
            type={isPassword && !showPassword ? 'password' : 'text'}
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

          {isPassword ? (
            <button
              type="button"
              data-testid="password-toggle"
              disabled={disabled}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full disabled:pointer-events-none"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          ) : suffixText || suffixIcon != null ? (
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
      )}

      {!disabled ? (
        <FooterRow
          helperContent={helperContent}
          helperColor={helperColor}
          helpButtonLabel={helpButtonLabel}
          onHelpPress={onHelpPress}
        />
      ) : null}

    </div>
  );
}
