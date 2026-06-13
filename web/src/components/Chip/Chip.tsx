import type { KeyboardEvent, ReactNode } from 'react';

export type IldsChipSize = 'large' | 'medium';

export type IldsChipProps = {
  label: string;
  size?: IldsChipSize;
  isSelected?: boolean;
  isDisabled?: boolean;
  hasPrefixIcon?: boolean;
  prefixIcon?: ReactNode;
  hasSuffixButton?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  className?: string;
};

function prefixIconSlotClasses(isDisabled: boolean): string {
  return [
    'inline-flex shrink-0 items-center justify-center overflow-hidden size-sp-12 pt-[2px]',
    isDisabled ? 'text-neutral-coolgray-500' : 'text-primary-orange-500',
    '[&>svg]:size-full [&>img]:size-full',
  ].join(' ');
}

function PrefixIconSlot({ children, isDisabled }: { children: ReactNode; isDisabled: boolean }) {
  return <span className={prefixIconSlotClasses(isDisabled)}>{children}</span>;
}

const suffixButtonClasses =
  'inline-flex shrink-0 items-center justify-center size-sp-12 pt-[2px] border-0 bg-transparent p-0 text-neutral-coolgray-500 cursor-pointer disabled:cursor-default disabled:pointer-events-none disabled:text-neutral-coolgray-500 [&>svg]:size-full';

/** Figma Interface / Edit / Close_Circle — 12px slot, currentColor */
function CloseCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * ILDS Chip (Figma "Tag") — component set `14018:6786`.
 *
 * **Layout:** Prefix, label, and suffix close live inside one bordered container (Figma).
 * **Icon contract:** Pass SVGs with `currentColor`; slot is 12px with 2px top offset.
 */
function chipClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: IldsChipSize,
): string {
  const base = [
    'inline-flex items-center font-primary font-normal rounded-medium border-[0.5px] box-border',
    'transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-600',
    'focus-visible:bg-neutral-coolgray-50 focus-visible:border-neutral-coolgray-800',
    size === 'large'
      ? 'h-sp-24 px-sp-8 py-sp-4 gap-sp-4 text-12 leading-[16px]'
      : 'h-[20px] px-sp-4 py-sp-2 gap-sp-2 text-12 leading-[16px]',
  ];

  if (isDisabled) {
    base.push(
      'bg-neutral-coolgray-200 border-neutral-coolgray-300 text-neutral-coolgray-500 cursor-default',
    );
  } else if (isSelected) {
    base.push(
      'bg-primary-orange-50 border-primary-orange-500 text-neutral-coolgray-900 hover:bg-primary-orange-50 hover:border-primary-orange-500',
    );
  } else {
    base.push(
      'bg-white-000 border-neutral-coolgray-500 text-neutral-coolgray-900 hover:bg-neutral-coolgray-300 hover:border-neutral-coolgray-600',
    );
  }

  return base.filter(Boolean).join(' ');
}

export function IldsChip({
  label,
  size = 'large',
  isSelected = false,
  isDisabled = false,
  hasPrefixIcon = false,
  prefixIcon,
  hasSuffixButton = false,
  onPress,
  onRemove,
  className = '',
}: IldsChipProps) {
  const showPrefix = hasPrefixIcon && prefixIcon != null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isDisabled || !onPress || hasSuffixButton) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onPress();
    }
  };

  return (
    <div
      data-testid="chip"
      role={hasSuffixButton ? 'group' : 'button'}
      tabIndex={isDisabled ? -1 : 0}
      aria-pressed={hasSuffixButton ? undefined : isSelected}
      aria-disabled={isDisabled || undefined}
      onClick={!hasSuffixButton && !isDisabled ? onPress : undefined}
      onKeyDown={handleKeyDown}
      className={[chipClasses(isSelected, isDisabled, size), className]
        .filter(Boolean)
        .join(' ')}
    >
      {showPrefix ? <PrefixIconSlot isDisabled={isDisabled}>{prefixIcon}</PrefixIconSlot> : null}
      {hasSuffixButton ? (
        <button
          type="button"
          disabled={isDisabled}
          aria-pressed={isSelected}
          onClick={onPress}
          className="min-w-0 truncate bg-transparent p-0 font-inherit text-inherit border-0 cursor-pointer disabled:cursor-default disabled:pointer-events-none"
        >
          {label}
        </button>
      ) : (
        <span className="truncate">{label}</span>
      )}
      {hasSuffixButton ? (
        <button
          type="button"
          disabled={isDisabled}
          aria-label={`Remove ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove?.();
          }}
          className={suffixButtonClasses}
        >
          <CloseCircleIcon />
        </button>
      ) : null}
    </div>
  );
}
