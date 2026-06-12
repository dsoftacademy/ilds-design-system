import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IldsButtonType = 'primary' | 'secondary' | 'tertiary';
export type IldsButtonSize = 'large' | 'medium' | 'small';
export type IldsButtonAppearance = 'normal' | 'destructive';

export interface IldsButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  type?: IldsButtonType;
  size?: IldsButtonSize;
  appearance?: IldsButtonAppearance;
  isDisabled?: boolean;
  isLoading?: boolean;
  /** Figma State=Skeleton — visual PRESUMED (no Figma node pulled); basic pulse placeholder. */
  isSkeleton?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

type SizeConfig = {
  padding: string;
  tertiaryPadding: string;
  text: string;
  minHeight: string;
  gap: string;
  spinner: string;
  labelBox: string;
};

const sizeConfig: Record<IldsButtonSize, SizeConfig> = {
  large: {
    padding: 'px-sp-16 py-sp-12',
    tertiaryPadding: 'px-0 py-sp-12',
    text: 'text-16 leading-[20px]',
    minHeight: 'h-sp-48',
    gap: 'gap-sp-8',
    spinner: 'size-sp-24',
    labelBox: 'h-sp-24',
  },
  medium: {
    padding: 'px-sp-12 py-sp-8',
    tertiaryPadding: 'px-0 py-sp-8',
    text: 'text-14 leading-[16px]',
    minHeight: 'h-[36px]',
    gap: 'gap-sp-8',
    spinner: 'size-sp-20',
    labelBox: 'h-sp-20',
  },
  small: {
    padding: 'px-sp-12 py-sp-6',
    tertiaryPadding: 'px-0 py-sp-6',
    text: 'text-12 leading-[16px]',
    minHeight: 'h-[28px]',
    gap: 'gap-sp-6',
    spinner: 'size-sp-16',
    labelBox: 'h-sp-16',
  },
};

const disabledFg = 'text-neutral-coolgray-400';

function interactiveClasses(
  buttonType: IldsButtonType,
  appearance: IldsButtonAppearance,
): string {
  if (buttonType === 'primary' && appearance === 'normal') {
    return [
      'bg-primary-orange-500 text-white-000 border-transparent',
      'hover:bg-primary-orange-400',
      'active:bg-primary-orange-600',
    ].join(' ');
  }

  if (buttonType === 'primary' && appearance === 'destructive') {
    return [
      'bg-error-red-600 text-white-000 border-transparent',
      'hover:bg-error-red-500',
      'active:bg-error-red-700',
    ].join(' ');
  }

  if (buttonType === 'secondary' && appearance === 'normal') {
    // Pressed: Figma 13472:3024 — bg error-red-100, border/text primary-orange-600
    return [
      'bg-white-000 text-primary-orange-500 border-primary-orange-500',
      'hover:bg-primary-orange-50 hover:text-primary-orange-500 hover:border-primary-orange-500',
      'active:bg-error-red-100 active:text-primary-orange-600 active:border-primary-orange-600',
    ].join(' ');
  }

  if (buttonType === 'secondary' && appearance === 'destructive') {
    return [
      'bg-white-000 text-error-red-600 border-error-red-600',
      'hover:bg-error-red-50 hover:text-error-red-600 hover:border-error-red-600',
      'active:bg-error-red-100 active:text-error-red-700 active:border-error-red-700',
    ].join(' ');
  }

  if (buttonType === 'tertiary' && appearance === 'normal') {
    // Hover 13472:3114 (orange-400), pressed 13472:3042 (orange-600)
    return [
      'bg-transparent text-primary-orange-500 border-transparent',
      'hover:text-primary-orange-400',
      'active:text-primary-orange-600',
    ].join(' ');
  }

  return [
    'bg-transparent text-error-red-600 border-transparent',
    'hover:text-error-red-500',
    'active:text-error-red-700',
  ].join(' ');
}

function disabledClasses(buttonType: IldsButtonType): string {
  switch (buttonType) {
    case 'primary':
      return 'bg-neutral-coolgray-400 text-white-000 border-transparent';
    case 'secondary':
      return `bg-neutral-coolgray-50 ${disabledFg} border-neutral-coolgray-400`;
    case 'tertiary':
      return `bg-transparent ${disabledFg} border-transparent`;
  }
}

function loadingClasses(
  buttonType: IldsButtonType,
  appearance: IldsButtonAppearance,
): string {
  if (buttonType === 'primary') {
    return appearance === 'destructive'
      ? 'bg-error-red-600 text-white-000 border-transparent'
      : 'bg-primary-orange-500 text-white-000 border-transparent';
  }
  if (buttonType === 'secondary') {
    return appearance === 'destructive'
      ? 'bg-white-000 text-error-red-600 border-error-red-600'
      : 'bg-white-000 text-primary-orange-500 border-primary-orange-500';
  }
  return appearance === 'destructive'
    ? 'bg-transparent text-error-red-600 border-transparent'
    : 'bg-transparent text-primary-orange-500 border-transparent';
}

function Spinner({ className }: { className: string }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
      aria-hidden
    />
  );
}

export function IldsButton({
  label,
  type: buttonType = 'primary',
  size = 'large',
  appearance = 'normal',
  isDisabled = false,
  isLoading = false,
  isSkeleton = false,
  leading,
  trailing,
  className = '',
  ...rest
}: IldsButtonProps) {
  const interactive = !isDisabled && !isLoading && !isSkeleton;
  const showLeading = Boolean(leading) && !isLoading && !isSkeleton;
  const showTrailing = Boolean(trailing) && !isLoading && !isSkeleton;
  const cfg = sizeConfig[size];
  const padding =
    buttonType === 'tertiary' ? cfg.tertiaryPadding : cfg.padding;
  const borderClass = buttonType === 'secondary' ? 'border' : 'border-0';

  const stateClasses = isSkeleton
    ? 'bg-neutral-coolgray-200 text-transparent border-transparent animate-pulse pointer-events-none'
    : isDisabled
      ? disabledClasses(buttonType)
      : isLoading
        ? loadingClasses(buttonType, appearance)
        : interactiveClasses(buttonType, appearance);

  return (
    <button
      type="button"
      disabled={!interactive}
      aria-busy={isLoading}
      aria-disabled={isDisabled || isSkeleton}
      className={[
        'inline-flex items-center justify-center font-primary font-bold rounded-large',
        borderClass,
        'transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-orange-600',
        'disabled:pointer-events-none',
        cfg.minHeight,
        cfg.gap,
        cfg.text,
        padding,
        stateClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {showLeading ? <span className="inline-flex shrink-0">{leading}</span> : null}
      <span className={`truncate ${cfg.labelBox} flex items-center justify-center`}>
        {isSkeleton ? '\u00A0' : label}
      </span>
      {isLoading ? <Spinner className={cfg.spinner} /> : null}
      {showTrailing ? <span className="inline-flex shrink-0">{trailing}</span> : null}
    </button>
  );
}
