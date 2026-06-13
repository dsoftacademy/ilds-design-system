import type { ReactNode } from 'react';

export type IldsSelectionButtonSize = 'small' | 'medium' | 'large';
export type IldsSelectionButtonVariant = 'labelOnly' | 'labelWithSuffix' | 'iconOnly';

export type IldsSelectionButtonProps = {
  /** Figma set 14776:1685. Selectable pill-rect (Add / Added). */
  label: string;
  size?: IldsSelectionButtonSize;
  variant?: IldsSelectionButtonVariant;
  isSelected?: boolean;
  isDisabled?: boolean;
  suffixIcon?: ReactNode;
  /** Required for Icon Only variant (no visible label). */
  ariaLabel?: string;
  onPress?: () => void;
  className?: string;
};

const sizeClasses: Record<IldsSelectionButtonSize, string> = {
  small: 'h-sp-32 px-sp-8 text-12 leading-[16px]',
  medium: 'h-[40px] px-sp-12 text-14 leading-[18px]',
  large: 'h-sp-48 px-sp-16 text-16 leading-[20px]',
};

function stateClasses(isSelected: boolean, isDisabled: boolean): string {
  if (isDisabled) {
    return 'bg-neutral-coolgray-50 border-neutral-coolgray-100 text-neutral-coolgray-300 cursor-not-allowed';
  }
  if (isSelected) {
    // Selected — orange-50 bg, orange-500 border (2px), orange-500 text.
    return 'bg-primary-orange-50 border-primary-orange-500 border-2 text-primary-orange-500';
  }
  // Default — white bg, coolgray-200 border, coolgray-600 text.
  return 'bg-white-000 border-neutral-coolgray-200 text-neutral-coolgray-600 hover:bg-neutral-coolgray-50 hover:border-neutral-coolgray-300 hover:text-neutral-coolgray-900';
}

export function IldsSelectionButton({
  label,
  size = 'medium',
  variant = 'labelOnly',
  isSelected = false,
  isDisabled = false,
  suffixIcon,
  ariaLabel,
  onPress,
  className = '',
}: IldsSelectionButtonProps) {
  const iconOnly = variant === 'iconOnly';
  const showSuffix = (variant === 'labelWithSuffix' || iconOnly) && suffixIcon != null;

  return (
    <button
      type="button"
      data-testid="selection-button"
      aria-pressed={isSelected}
      aria-label={iconOnly ? (ariaLabel ?? label) : undefined}
      disabled={isDisabled}
      onClick={onPress}
      className={[
        'inline-flex items-center justify-center gap-sp-4 rounded-medium border box-border font-primary font-medium',
        'transition-colors outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-500',
        sizeClasses[size],
        stateClasses(isSelected, isDisabled),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!iconOnly ? <span className="truncate">{label}</span> : null}
      {showSuffix ? (
        <span className="inline-flex size-[1.2em] shrink-0 items-center justify-center [&>svg]:size-full">
          {suffixIcon}
        </span>
      ) : null}
    </button>
  );
}
