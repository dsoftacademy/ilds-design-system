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
  leading?: ReactNode;
  trailing?: ReactNode;
}

const sizeClasses: Record<IldsButtonSize, string> = {
  large: 'px-sp-16 py-sp-12 text-16 min-h-0',
  medium: 'px-sp-12 py-sp-8 text-14',
  small: 'px-sp-12 py-sp-6 text-12 min-h-[28px]',
};

const gapClasses: Record<IldsButtonSize, string> = {
  large: 'gap-sp-2',
  medium: 'gap-sp-2',
  small: 'gap-sp-6',
};

const spinnerSize: Record<IldsButtonSize, string> = {
  large: 'size-sp-24',
  medium: 'size-sp-20',
  small: 'size-sp-16',
};

function resolveClasses(
  buttonType: IldsButtonType,
  appearance: IldsButtonAppearance,
  isDisabled: boolean,
  isLoading: boolean,
): string {
  const accent =
    appearance === 'destructive'
      ? 'bg-error-red-600 border-error-red-600 text-white'
      : 'bg-primary-orange-500 border-primary-orange-500 text-white';

  const accentText =
    appearance === 'destructive' ? 'text-error-red-600' : 'text-primary-orange-500';

  const accentBorder =
    appearance === 'destructive' ? 'border-error-red-600' : 'border-primary-orange-500';

  if (isDisabled) {
    switch (buttonType) {
      case 'primary':
        return 'bg-primary-orange-200 text-white border-transparent';
      case 'secondary':
        return 'bg-neutral-coolgray-50 text-neutral-coolgray-500 border-neutral-coolgray-500';
      case 'tertiary':
        return 'bg-transparent text-neutral-coolgray-500 border-transparent';
    }
  }

  if (isLoading) {
    switch (buttonType) {
      case 'primary':
        return `${accent} border-transparent`;
      case 'secondary':
        return `bg-white ${accentText} border ${accentBorder}`;
      case 'tertiary':
        return `bg-transparent ${accentText} border-transparent`;
    }
  }

  switch (buttonType) {
    case 'primary':
      return `${accent} border-transparent ${
        appearance === 'normal' ? 'active:bg-primary-orange-700' : ''
      }`;
    case 'secondary':
      return `bg-white ${accentText} border ${accentBorder}`;
    case 'tertiary':
      return `bg-transparent ${accentText} border-transparent`;
  }
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
  leading,
  trailing,
  className = '',
  ...rest
}: IldsButtonProps) {
  const interactive = !isDisabled && !isLoading;
  const showLeading = Boolean(leading) && !isLoading;
  const showTrailing = Boolean(trailing) && !isLoading;

  return (
    <button
      type="button"
      disabled={!interactive}
      aria-busy={isLoading}
      className={[
        'inline-flex items-center justify-center font-primary font-bold rounded-large border',
        'transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-500',
        'disabled:pointer-events-none',
        sizeClasses[size],
        gapClasses[size],
        resolveClasses(buttonType, appearance, isDisabled, isLoading),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {showLeading ? <span className="inline-flex shrink-0">{leading}</span> : null}
      <span className="truncate">{label}</span>
      {isLoading ? <Spinner className={spinnerSize[size]} /> : null}
      {showTrailing ? <span className="inline-flex shrink-0">{trailing}</span> : null}
    </button>
  );
}
