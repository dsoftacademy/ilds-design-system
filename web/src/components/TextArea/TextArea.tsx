import { useId, useState, type ReactNode } from 'react';

export type IldsTextAreaProps = {
  /** Figma set 14369:11586. Multi-line input mirroring TextField state colors. */
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  rows?: number;
  helperText?: string;
  errorText?: string;
  successText?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  className?: string;
};

function containerClasses(isDisabled: boolean, hasError: boolean, hasSuccess: boolean): string {
  const base =
    'flex flex-col gap-sp-8 min-h-[88px] p-sp-12 rounded-medium border outline-0 transition-colors font-primary';

  if (isDisabled) {
    return `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 pointer-events-none`;
  }
  if (hasError) {
    return `${base} bg-white-000 border-error-red-600 hover:bg-neutral-coolgray-100`;
  }
  if (hasSuccess) {
    return `${base} bg-white-000 border-success-green-500 hover:bg-neutral-coolgray-100`;
  }
  return [
    base,
    'bg-white-000 border-neutral-coolgray-500',
    'hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800',
    // Focused — orange-600 border hugging (matches TextField; no detached ring).
    'focus-within:bg-neutral-coolgray-50 focus-within:border-2 focus-within:border-primary-orange-600',
  ].join(' ');
}

export function IldsTextArea({
  label,
  required = false,
  placeholder = 'Type your message',
  value,
  rows = 4,
  helperText,
  errorText,
  successText,
  disabled = false,
  onChange,
  className = '',
}: IldsTextAreaProps) {
  const inputId = useId();
  const [draft, setDraft] = useState('');
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : draft;

  const hasError = !!errorText && !disabled;
  const hasSuccess = !!successText && !disabled && !hasError;

  const helperContent = hasError ? errorText : hasSuccess ? successText : helperText;
  const helperColor = hasError
    ? 'text-error-red-600'
    : hasSuccess
      ? 'text-success-green-600'
      : 'text-neutral-coolgray-700';

  return (
    <div className={['flex flex-col gap-sp-4', className].filter(Boolean).join(' ')}>
      {label ? (
        <label
          htmlFor={inputId}
          className={[
            'flex items-center gap-sp-4 text-12 font-bold font-primary leading-[16px] text-neutral-coolgray-900',
            disabled ? 'opacity-50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
          {required ? (
            <span className="text-[10px] font-normal font-primary leading-[16px] text-neutral-coolgray-800">
              (required)
            </span>
          ) : null}
        </label>
      ) : null}

      <div data-testid="textarea-container" className={containerClasses(disabled, hasError, hasSuccess)}>
        <textarea
          id={inputId}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          value={displayValue}
          aria-invalid={hasError || undefined}
          onChange={(e) => {
            const next = e.target.value;
            if (!isControlled) setDraft(next);
            onChange?.(next);
          }}
          className={[
            'w-full flex-1 resize-y bg-transparent outline-none',
            'text-14 font-normal font-primary leading-[18px]',
            'text-neutral-coolgray-900 placeholder:text-neutral-coolgray-500',
            'disabled:opacity-100 disabled:text-neutral-coolgray-500',
          ].join(' ')}
        />
      </div>

      {!disabled && helperContent ? (
        <p className={`text-12 font-normal font-primary leading-[16px] ${helperColor}`}>
          {helperContent}
        </p>
      ) : null}
    </div>
  );
}
