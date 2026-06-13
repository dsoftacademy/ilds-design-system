export type IldsDropdownProps = {
  /**
   * Figma: 16px Bold coolgray-900.
   * CRITICAL: This is NOT 12px like TextField. Dropdown label is larger.
   * Figma node 13476:22317 explicitly shows text-[16px] font-bold.
   */
  label?: string;
  placeholder?: string;
  /** Currently selected display value. Empty/undefined = show placeholder. */
  value?: string;
  helperText?: string;
  /** Error helper text shown below trigger. Triggers Negative/Error state. */
  errorText?: string;
  /**
   * Enables Negative (Error) state — error-red-600 border + WarningIcon in suffix.
   * Figma node 13476:22367. Can also be set implicitly when errorText is provided.
   */
  isNegative?: boolean;
  isDisabled?: boolean;
  /**
   * Controls chevron rotation (180° when open) and aria-expanded.
   * Dropdown menu panel is out of scope for Phase 3b.
   */
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningTriangleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line
        x1="12" y1="9" x2="12" y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/**
 * Focus mechanism: `focus-visible:` on the button itself (it IS the focusable element).
 * Dropdown focused = bg coolgray-50 + border coolgray-800 ONLY — NO orange ring (13476:22340).
 */
function triggerClasses(hasError: boolean, isDisabled: boolean): string {
  const base = [
    'w-full flex items-center gap-sp-8 min-h-[44px] px-sp-12 rounded-medium border',
    'text-left cursor-pointer transition-colors font-primary',
    'outline-none',
    'focus-visible:bg-neutral-coolgray-50 focus-visible:border-neutral-coolgray-800',
  ].join(' ');

  if (isDisabled) {
    return `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 text-neutral-coolgray-500 pointer-events-none`;
  }
  if (hasError) {
    return `${base} bg-white-000 border-error-red-600`;
  }
  return `${base} bg-white-000 border-neutral-coolgray-500`;
}

/**
 * ILDS Dropdown Trigger — Figma component set 13476:22316.
 */
export function IldsDropdown({
  label,
  placeholder = 'Select option',
  value,
  helperText,
  errorText,
  isNegative = false,
  isDisabled = false,
  isOpen = false,
  onToggle,
  className = '',
}: IldsDropdownProps) {
  const hasError = (isNegative || !!errorText) && !isDisabled;
  const helperContent = hasError ? (errorText ?? helperText) : helperText;

  return (
    <div className={['flex flex-col gap-sp-4', className].filter(Boolean).join(' ')}>

      {label ? (
        <span
          className={[
            'text-16 font-bold font-primary leading-[20px] text-neutral-coolgray-900',
            isDisabled ? 'opacity-50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
        </span>
      ) : null}

      <button
        type="button"
        data-testid="dropdown-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={isDisabled}
        onClick={onToggle}
        className={triggerClasses(hasError, isDisabled)}
      >
        <span
          className={[
            'flex-1 text-14 font-normal font-primary leading-[18px]',
            value ? 'text-neutral-coolgray-900' : 'text-neutral-coolgray-500',
          ].join(' ')}
        >
          {value || placeholder}
        </span>

        <span className="inline-flex shrink-0 items-center gap-sp-4">
          {hasError ? (
            <span className="inline-flex size-sp-20 items-center justify-center text-error-red-600 [&>svg]:size-full">
              <WarningTriangleIcon />
            </span>
          ) : null}
          <span
            className={[
              'inline-flex size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full transition-transform duration-200',
              isOpen ? 'rotate-180' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <ChevronDownIcon />
          </span>
        </span>
      </button>

      {!isDisabled && helperContent ? (
        <p
          className={[
            'text-12 font-normal font-primary leading-[16px]',
            hasError ? 'text-error-red-600' : 'text-neutral-coolgray-700',
          ].join(' ')}
        >
          {helperContent}
        </p>
      ) : null}

    </div>
  );
}
