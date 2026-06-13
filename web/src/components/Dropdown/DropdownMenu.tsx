import { IldsButton } from '../Button';

export type IldsDropdownMenuOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type IldsDropdownMenuProps = {
  /** Figma 16055:6152 — Section Label header row. */
  sectionLabel?: string;
  options: IldsDropdownMenuOption[];
  selectedValue?: string;
  showFooter?: boolean;
  secondaryLabel?: string;
  primaryLabel?: string;
  onSelect?: (value: string) => void;
  onSecondary?: () => void;
  onPrimary?: () => void;
  className?: string;
  /** Override listbox id for aria-controls on the trigger. */
  menuId?: string;
};

function RadioCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * ILDS Dropdown Menu panel — Figma node 16055:6151 (5-item default 16055:6152).
 *
 * White card, coolgray-100 section header, radio-style option rows,
 * optional footer with Secondary + Primary medium buttons.
 */
export function IldsDropdownMenu({
  sectionLabel = 'Section Label',
  options,
  selectedValue,
  showFooter = true,
  secondaryLabel = 'Secondary button',
  primaryLabel = 'Primary button',
  onSelect,
  onSecondary,
  onPrimary,
  className = '',
  menuId,
}: IldsDropdownMenuProps) {
  return (
    <div
      id={menuId}
      data-testid="dropdown-menu"
      role="listbox"
      className={[
        'w-[320px] flex flex-col gap-[2px]',
        'bg-white-000 rounded-medium p-sp-8 font-primary',
        'shadow-[0px_4px_12px_#bdbdbd]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-full flex-col">
        {sectionLabel ? (
          <div className="flex w-full">
            <div className="flex w-full items-start justify-center bg-neutral-coolgray-100 px-sp-8 py-sp-12">
              <span className="flex-1 truncate text-14 font-bold font-primary leading-[18px] text-neutral-coolgray-800">
                {sectionLabel}
              </span>
            </div>
          </div>
        ) : null}

        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          const isLast = index === options.length - 1;

          return (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={option.disabled}
              onClick={() => onSelect?.(option.value)}
              className={[
                'flex w-full items-start gap-sp-8 px-sp-8 py-sp-12 text-left',
                'text-14 font-normal font-primary leading-[1.6] text-neutral-coolgray-800',
                !isLast ? 'border-b border-neutral-coolgray-200' : '',
                option.disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-neutral-coolgray-50',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="inline-flex size-sp-20 shrink-0 items-center justify-center text-primary-orange-500 [&>svg]:size-full">
                <RadioCircleIcon />
              </span>
              <span className="min-w-0 flex-1">{option.label}</span>
            </button>
          );
        })}
      </div>

      {showFooter ? (
        <div className="flex w-full flex-col justify-center px-sp-8 pb-sp-6 pt-sp-12">
          <div className="flex w-full items-start gap-sp-12">
            <IldsButton
              type="secondary"
              size="medium"
              label={secondaryLabel}
              onClick={onSecondary}
              className="flex-1"
            />
            <IldsButton
              type="primary"
              size="medium"
              label={primaryLabel}
              onClick={onPrimary}
              className="flex-1"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
