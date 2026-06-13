import type { AnchorHTMLAttributes, ReactNode } from 'react';

export type IldsTextLinkSize = 'small' | 'medium' | 'large';
export type IldsTextLinkColour = 'default' | 'white';

export type IldsTextLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'color'
> & {
  /** Figma set 13474:16003. Underlined link, blue or white, with visited/disabled states. */
  label: string;
  size?: IldsTextLinkSize;
  colour?: IldsTextLinkColour;
  isVisited?: boolean;
  isDisabled?: boolean;
  prefixIcon?: ReactNode;
  suffixIcon?: ReactNode;
};

const sizeText: Record<IldsTextLinkSize, string> = {
  small: 'text-12 leading-[16px]',
  medium: 'text-14 leading-[18px]',
  large: 'text-16 leading-[20px]',
};

function colorClasses(
  colour: IldsTextLinkColour,
  isDisabled: boolean,
  isVisited: boolean,
): string {
  if (colour === 'white') {
    if (isDisabled) return 'text-neutral-coolgray-400';
    if (isVisited) return 'text-neutral-coolgray-300';
    return 'text-white-000 hover:text-neutral-coolgray-200 active:text-neutral-coolgray-300';
  }
  // default (informative blue)
  if (isDisabled) return 'text-neutral-coolgray-300';
  if (isVisited) return 'text-neutral-coolgray-500';
  return 'text-informative-blue-500 hover:text-informative-blue-600 active:text-informative-blue-700';
}

export function IldsTextLink({
  label,
  size = 'medium',
  colour = 'default',
  isVisited = false,
  isDisabled = false,
  prefixIcon,
  suffixIcon,
  className = '',
  href,
  onClick,
  ...rest
}: IldsTextLinkProps) {
  return (
    <a
      data-testid="text-link"
      href={isDisabled ? undefined : href}
      aria-disabled={isDisabled || undefined}
      onClick={(e) => {
        if (isDisabled) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      className={[
        'inline-flex items-center gap-sp-4 font-primary font-medium',
        'rounded-[2px] outline-0 focus-visible:outline-2 focus-visible:outline-offset-2',
        colour === 'white'
          ? 'focus-visible:outline-white-000'
          : 'focus-visible:outline-informative-blue-500',
        isDisabled ? 'no-underline cursor-not-allowed pointer-events-none' : 'underline cursor-pointer',
        sizeText[size],
        colorClasses(colour, isDisabled, isVisited),
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {prefixIcon != null ? (
        <span className="inline-flex size-[1em] items-center justify-center no-underline [&>svg]:size-full">
          {prefixIcon}
        </span>
      ) : null}
      <span>{label}</span>
      {suffixIcon != null ? (
        <span className="inline-flex size-[1em] items-center justify-center no-underline [&>svg]:size-full">
          {suffixIcon}
        </span>
      ) : null}
    </a>
  );
}
