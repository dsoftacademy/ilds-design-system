import type { ReactNode } from 'react';

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

const iconSlotClasses =
  'inline-flex shrink-0 items-center justify-center overflow-hidden size-sp-12 [&>svg]:size-full [&>img]:size-full';

function IconSlot({ children }: { children: ReactNode }) {
  return <span className={iconSlotClasses}>{children}</span>;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * ILDS Chip — Figma component set `14018:6786`.
 *
 * **Icon contract:** Pass SVGs with `stroke="currentColor"` / `fill="currentColor"`.
 * Do not set intrinsic size — the 12px slot sizes and clips overflow.
 */
function chipClasses(
  isSelected: boolean,
  isDisabled: boolean,
  size: IldsChipSize,
): string {
  const base = [
    'inline-flex items-center font-primary font-normal rounded-medium border-[0.5px]',
    'transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-600',
    'focus-visible:bg-neutral-coolgray-50 focus-visible:border-neutral-coolgray-800',
    'disabled:pointer-events-none',
    size === 'large'
      ? 'px-sp-8 py-sp-4 gap-sp-4 text-12 leading-[16px]'
      : 'px-sp-4 py-sp-2 gap-sp-2 text-12 leading-[16px]',
  ];

  if (isDisabled) {
    base.push(
      'bg-neutral-coolgray-200 border-neutral-coolgray-300 text-neutral-coolgray-500',
    );
  } else if (isSelected) {
    // Selected hover: Figma has no hover-of-selected node — keep selected state. PRESUMED.
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

  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        data-testid="chip"
        disabled={isDisabled}
        aria-pressed={isSelected}
        onClick={onPress}
        className={[chipClasses(isSelected, isDisabled, size), className]
          .filter(Boolean)
          .join(' ')}
      >
        {showPrefix ? <IconSlot>{prefixIcon}</IconSlot> : null}
        <span className="truncate">{label}</span>
      </button>
      {hasSuffixButton && !isDisabled ? (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="inline-flex shrink-0 items-center justify-center size-sp-12 text-neutral-coolgray-900"
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}
