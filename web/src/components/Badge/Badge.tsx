import type { ReactNode } from 'react';

export type IldsBadgeVariant =
  | 'subtle'
  | 'intense'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'skeleton';
export type IldsBadgeSize = 'small' | 'medium' | 'large';

export type IldsBadgeProps = {
  /** Figma set 13965:24550. Pill badge with variant color pairs. */
  label: string;
  variant?: IldsBadgeVariant;
  size?: IldsBadgeSize;
  prefixIcon?: ReactNode;
  className?: string;
};

const sizeText: Record<IldsBadgeSize, string> = {
  small: 'text-[11px] leading-[14px]',
  medium: 'text-12 leading-[16px]',
  large: 'text-[13px] leading-[18px]',
};

const sizePad: Record<IldsBadgeSize, string> = {
  small: 'px-sp-8 py-[2px]',
  medium: 'px-sp-8 py-sp-4',
  large: 'px-sp-12 py-sp-4',
};

const variantColors: Record<IldsBadgeVariant, string> = {
  subtle: 'bg-neutral-coolgray-100 text-neutral-coolgray-600',
  intense: 'bg-neutral-coolgray-900 text-white-000',
  success: 'bg-success-green-50 text-success-green-700',
  error: 'bg-error-red-50 text-error-red-700',
  warning: 'bg-warning-amber-50 text-warning-amber-700',
  info: 'bg-informative-blue-50 text-informative-blue-700',
  skeleton: 'bg-neutral-coolgray-100 text-transparent',
};

export function IldsBadge({
  label,
  variant = 'subtle',
  size = 'medium',
  prefixIcon,
  className = '',
}: IldsBadgeProps) {
  const isSkeleton = variant === 'skeleton';

  return (
    <span
      data-testid="badge"
      className={[
        'inline-flex items-center gap-sp-4 rounded-full font-primary font-medium',
        sizePad[size],
        sizeText[size],
        variantColors[variant],
        isSkeleton ? 'animate-pulse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {prefixIcon != null && !isSkeleton ? (
        <span className="inline-flex size-[1em] items-center justify-center [&>svg]:size-full">
          {prefixIcon}
        </span>
      ) : null}
      <span>{isSkeleton ? '\u00A0\u00A0\u00A0' : label}</span>
    </span>
  );
}
