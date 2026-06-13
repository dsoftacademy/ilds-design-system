import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type IldsButtonType = 'primary' | 'secondary' | 'tertiary';
export type IldsButtonSize = 'large' | 'medium' | 'small';
export type IldsButtonAppearance = 'normal' | 'destructive';

type IldsButtonSharedProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> & {
  /** Visual variant — primary / secondary / tertiary (not HTML button type). */
  type?: IldsButtonType;
  size?: IldsButtonSize;
  appearance?: IldsButtonAppearance;
  isDisabled?: boolean;
  isLoading?: boolean;
  /** Figma State=Skeleton — visual PRESUMED (no Figma node pulled); basic pulse placeholder. */
  isSkeleton?: boolean;
};

/** Label + optional leading/trailing icon slots (Figma Variant=Label Only / Prefix / Suffix / Both). */
type IldsButtonLabeledProps = IldsButtonSharedProps & {
  label: string;
  iconOnly?: false;
  icon?: never;
  leading?: ReactNode;
  trailing?: ReactNode;
};

/** Icon-only button (Figma 13472:2810 — Large verified: px-16, 24px slot). Requires aria-label. */
type IldsButtonIconOnlyProps = IldsButtonSharedProps & {
  iconOnly: true;
  icon: ReactNode;
  label?: never;
  leading?: never;
  trailing?: never;
  'aria-label': string;
};

/** Leading icon without visible label — same layout as icon-only; requires aria-label. */
type IldsButtonLeadingOnlyProps = IldsButtonSharedProps & {
  label?: undefined;
  iconOnly?: false;
  icon?: never;
  leading: ReactNode;
  trailing?: never;
  'aria-label': string;
};

export type IldsButtonProps =
  | IldsButtonLabeledProps
  | IldsButtonIconOnlyProps
  | IldsButtonLeadingOnlyProps;

type SizeConfig = {
  padding: string;
  tertiaryPadding: string;
  text: string;
  minHeight: string;
  gap: string;
  /** Figma icon slot — 13472:2805 (24px), 13472:3397 (20px), 13472:3713 (12px, designer-updated 2026-06-12) */
  iconSlot: string;
  labelBox: string;
};

const sizeConfig: Record<IldsButtonSize, SizeConfig> = {
  large: {
    padding: 'px-sp-16 py-sp-12',
    tertiaryPadding: 'px-0 py-sp-12',
    text: 'text-16 leading-[20px]',
    minHeight: 'h-sp-48',
    gap: 'gap-sp-8',
    iconSlot: 'size-sp-24',
    labelBox: 'h-sp-24',
  },
  medium: {
    padding: 'px-sp-12 py-sp-8',
    tertiaryPadding: 'px-0 py-sp-8',
    text: 'text-14 leading-[16px]',
    minHeight: 'h-[36px]',
    gap: 'gap-sp-8',
    iconSlot: 'size-sp-20',
    labelBox: 'h-sp-20',
  },
  small: {
    padding: 'px-sp-12 py-sp-6',
    tertiaryPadding: 'px-0 py-sp-6',
    text: 'text-12 leading-[16px]',
    minHeight: 'h-[28px]',
    gap: 'gap-sp-6',
    // Figma 13472:3713 — small icon slot normalized to 12px by designer (token-aligned, sp-12)
    iconSlot: 'size-sp-12',
    labelBox: 'h-sp-16',
  },
};

const disabledFg = 'text-neutral-coolgray-400';

const iconSlotClasses =
  'inline-flex shrink-0 items-center justify-center overflow-hidden [&>svg]:size-full [&>img]:size-full';

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
    return [
      'bg-white-000 text-primary-orange-500 border-primary-orange-500',
      'hover:bg-primary-orange-50 hover:text-primary-orange-500 hover:border-primary-orange-500',
      'active:bg-primary-orange-100 active:text-primary-orange-600 active:border-primary-orange-600',
    ].join(' ');
  }

  if (buttonType === 'secondary' && appearance === 'destructive') {
    return [
      'bg-white-000 text-error-red-600 border-error-red-600',
      'hover:bg-error-red-50 hover:text-error-red-600 hover:border-error-red-600',
      // Pressed: Figma 16186:2051 — bg red-100, label red-700, border stays red-600
      'active:bg-error-red-100 active:text-error-red-700 active:border-error-red-600',
    ].join(' ');
  }

  if (buttonType === 'tertiary' && appearance === 'normal') {
    return [
      'bg-transparent text-primary-orange-500 border-transparent',
      'hover:text-primary-orange-400',
      'active:text-primary-orange-600',
    ].join(' ');
  }

  return [
    'bg-transparent text-error-red-600 border-transparent',
    'hover:text-error-red-500',
    // Pressed: Figma 16186:2581 — label error-red-700 (designer updated 2026-06-12, was 600/no-feedback)
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

function IconSlot({
  slotClass,
  children,
}: {
  slotClass: string;
  children: ReactNode;
}) {
  return (
    <span className={`${iconSlotClasses} ${slotClass}`}>{children}</span>
  );
}

/**
 * ILDS Button — Figma set `13472:2804`.
 *
 * **Icon contract:** Pass SVGs (or images) with `stroke="currentColor"` / `fill="currentColor"`.
 * Do not set intrinsic width/height on icons — the leading/trailing slot sizes and clips overflow:
 * Large 24px (13472:2805), Medium 20px (13472:3397), Small 12px (13472:3713).
 * Loading (13472:2877): leading icon stays visible; spinner replaces the trailing slot only.
 */
export function IldsButton(props: IldsButtonProps) {
  const {
    type: buttonType = 'primary',
    size = 'large',
    appearance = 'normal',
    isDisabled = false,
    isLoading = false,
    isSkeleton = false,
    className = '',
    ...rest
  } = props;

  const iconOnly = 'iconOnly' in props && props.iconOnly === true;
  const label = 'label' in props ? props.label : undefined;
  const icon = iconOnly ? props.icon : undefined;
  const leading = !iconOnly && 'leading' in props ? props.leading : undefined;
  const trailing = !iconOnly && 'trailing' in props ? props.trailing : undefined;

  const hasVisibleLabel = Boolean(label) && !iconOnly;
  const leadingContent = iconOnly ? icon : leading;

  const interactive = !isDisabled && !isLoading && !isSkeleton;
  const cfg = sizeConfig[size];
  const padding =
    buttonType === 'tertiary' && hasVisibleLabel
      ? cfg.tertiaryPadding
      : iconOnly && size === 'small'
        ? // Figma 13472:3718 — small Icon Only uses px-8 (not the regular px-12); L/M match regular padding
          'px-sp-8 py-sp-6'
        : cfg.padding;
  const borderClass = buttonType === 'secondary' ? 'border' : 'border-0';

  const stateClasses = isSkeleton
    ? 'bg-neutral-coolgray-200 text-transparent border-transparent animate-pulse pointer-events-none'
    : isDisabled
      ? disabledClasses(buttonType)
      : isLoading
        ? loadingClasses(buttonType, appearance)
        : interactiveClasses(buttonType, appearance);

  const showLeading = Boolean(leadingContent) && !isSkeleton;
  const showLabel = hasVisibleLabel && !isSkeleton;
  const showTrailingIcon = Boolean(trailing) && !isLoading && !isSkeleton;
  const showTrailingSpinner = isLoading && !isSkeleton;

  return (
    <button
      type="button"
      disabled={!interactive}
      aria-busy={isLoading}
      aria-disabled={isDisabled || isSkeleton}
      aria-hidden={isSkeleton || undefined}
      className={[
        'inline-flex items-center justify-center font-primary font-bold rounded-large',
        borderClass,
        'transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-orange-600',
        'disabled:pointer-events-none',
        cfg.minHeight,
        cfg.gap,
        hasVisibleLabel ? cfg.text : '',
        padding,
        stateClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {showLeading ? (
        <IconSlot slotClass={cfg.iconSlot}>{leadingContent}</IconSlot>
      ) : null}
      {showLabel ? (
        <span className={`truncate ${cfg.labelBox} flex items-center justify-center`}>
          {label}
        </span>
      ) : null}
      {isSkeleton && !iconOnly ? (
        <span className={`truncate ${cfg.labelBox} flex items-center justify-center`}>
          {'\u00A0'}
        </span>
      ) : null}
      {showTrailingSpinner ? (
        <IconSlot slotClass={cfg.iconSlot}>
          <Spinner className="size-full" />
        </IconSlot>
      ) : null}
      {showTrailingIcon ? (
        <IconSlot slotClass={cfg.iconSlot}>{trailing}</IconSlot>
      ) : null}
    </button>
  );
}
