import { useId, type ReactNode } from 'react';
import { IldsDropdownMenu, type IldsDropdownMenuOption } from './DropdownMenu';

export type IldsDropdownRequiredIndicator = 'text' | 'asterisk';
export type { IldsDropdownMenuOption };

export type IldsDropdownProps = {
  /**
   * Figma: 16px Bold coolgray-900.
   * CRITICAL: This is NOT 12px like TextField. Dropdown label is larger.
   * Figma node 13476:22317 explicitly shows text-[16px] font-bold.
   */
  label?: string;
  required?: boolean;
  requiredIndicator?: IldsDropdownRequiredIndicator;
  showInfoIcon?: boolean;
  placeholder?: string;
  prefixIcon?: ReactNode;
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
   * When `options` is provided, the menu panel (Figma 16055:6152) renders below the trigger.
   */
  isOpen?: boolean;
  onToggle?: () => void;
  options?: IldsDropdownMenuOption[];
  selectedValue?: string;
  onSelect?: (value: string) => void;
  menuSectionLabel?: string;
  showMenuFooter?: boolean;
  menuSecondaryLabel?: string;
  menuPrimaryLabel?: string;
  onMenuSecondary?: () => void;
  onMenuPrimary?: () => void;
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
 * Focus mechanism: `focus-visible:` on the trigger when closed.
 * Active/Open (13476:22390): orange-500 border + orange chevron — NOT the same as Focused.
 * Hover (13476:22377): coolgray-100 bg + coolgray-800 border. VERIFIED 2026-06-13.
 * Hover only on default (not-open, not-error, not-disabled).
 */
function triggerClasses(
  hasError: boolean,
  isDisabled: boolean,
  isOpen: boolean,
): string {
  const base = [
    'w-full flex items-center gap-sp-8 min-h-[44px] px-sp-12 rounded-medium border',
    'text-left cursor-pointer transition-colors font-primary',
    'outline-none',
  ].join(' ');

  const focusVisible = isOpen
    ? ''
    : 'focus-visible:bg-neutral-coolgray-50 focus-visible:border-neutral-coolgray-800';

  if (isDisabled) {
    // Figma 13476:22326 VERIFIED — coolgray-200 bg, coolgray-300 border. No hover.
    return `${base} ${focusVisible} bg-neutral-coolgray-200 border-neutral-coolgray-300 text-neutral-coolgray-500 pointer-events-none`;
  }
  if (hasError) {
    // Figma 13476:22367 — white bg, error-red-600 border.
    return `${base} ${focusVisible} bg-white-000 border-error-red-600`;
  }
  if (isOpen) {
    // Figma 13476:22390 VERIFIED — white bg, orange-500 border. No hover.
    return `${base} bg-white-000 border-primary-orange-500`;
  }
  // Figma 13476:22317 — Default: white bg, coolgray-500 border.
  // Figma 13476:22349 VERIFIED — Filled: same as default (white + coolgray-500).
  // Figma 13476:22377 VERIFIED — Hover: coolgray-100 bg, coolgray-800 border.
  return `${base} ${focusVisible} bg-white-000 border-neutral-coolgray-500 hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800`;
}

/**
 * ILDS Dropdown Trigger — Figma component set 13476:22316.
 *
 * Verified: Empty/Default (22317), Hover (22377), Focused (22340), Active/Open (22390),
 *           Negative (22367), Disabled (22326), Filled (22349).
 * Phase 3c: Dropdown menu panel (16055:6152) via `options` + `isOpen`.
 */
export function IldsDropdown({
  label,
  required = false,
  requiredIndicator = 'text',
  showInfoIcon = false,
  placeholder = 'Select option',
  prefixIcon,
  value,
  helperText,
  errorText,
  isNegative = false,
  isDisabled = false,
  isOpen = false,
  onToggle,
  options,
  selectedValue,
  onSelect,
  menuSectionLabel,
  showMenuFooter = true,
  menuSecondaryLabel,
  menuPrimaryLabel,
  onMenuSecondary,
  onMenuPrimary,
  className = '',
}: IldsDropdownProps) {
  const autoMenuId = useId();
  const listboxId = autoMenuId;
  const hasError = (isNegative || !!errorText) && !isDisabled;
  const helperContent = hasError ? (errorText ?? helperText) : helperText;

  return (
    <div className={['flex flex-col gap-sp-4', className].filter(Boolean).join(' ')}>

      {label ? (
        <div
          className={[
            'flex items-center gap-sp-4',
            isDisabled ? 'opacity-50' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="text-16 font-bold font-primary leading-[20px] text-neutral-coolgray-900">
            {label}
          </span>
          {required ? (
            <span
              data-testid="dropdown-required-indicator"
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

      <button
        type="button"
        data-testid="dropdown-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen && options?.length ? listboxId : undefined}
        disabled={isDisabled}
        onClick={onToggle}
        className={triggerClasses(hasError, isDisabled, isOpen)}
      >
        {prefixIcon != null ? (
          <span className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full">
            {prefixIcon}
          </span>
        ) : null}

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
              'inline-flex size-sp-20 items-center justify-center [&>svg]:size-full transition-[rotate] duration-200',
              isOpen
                ? 'rotate-180 text-primary-orange-500'
                : 'text-neutral-coolgray-500',
            ].join(' ')}
          >
            <ChevronDownIcon />
          </span>
        </span>
      </button>

      {isOpen && options && options.length > 0 ? (
        <IldsDropdownMenu
          menuId={listboxId}
          sectionLabel={menuSectionLabel}
          options={options}
          selectedValue={selectedValue}
          showFooter={showMenuFooter}
          secondaryLabel={menuSecondaryLabel}
          primaryLabel={menuPrimaryLabel}
          onSelect={onSelect}
          onSecondary={onMenuSecondary}
          onPrimary={onMenuPrimary}
        />
      ) : null}

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
