import type { CSSProperties, ReactNode } from 'react';

export type IldsScrollbarProps = {
  /**
   * Figma Scrollbar 17730:521. Thin custom scrollbar — thumb coolgray-200 on
   * coolgray-100 track, 6px default / 12px on hover, fully rounded.
   */
  children: ReactNode;
  /** Max height of the scroll viewport (default 240px). */
  maxHeight?: number | string;
  horizontal?: boolean;
  className?: string;
  style?: CSSProperties;
};

const scrollbarUtilities = [
  // WebKit / Blink
  '[&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:h-[6px]',
  'hover:[&::-webkit-scrollbar]:w-[12px] hover:[&::-webkit-scrollbar]:h-[12px]',
  '[&::-webkit-scrollbar-track]:bg-neutral-coolgray-100',
  '[&::-webkit-scrollbar-track]:rounded-full',
  '[&::-webkit-scrollbar-thumb]:bg-neutral-coolgray-200',
  '[&::-webkit-scrollbar-thumb]:rounded-full',
  'hover:[&::-webkit-scrollbar-thumb]:bg-neutral-coolgray-300',
  // Firefox
  '[scrollbar-width:thin]',
  '[scrollbar-color:#eeeeee_#f5f5f5]',
].join(' ');

export function IldsScrollbar({
  children,
  maxHeight = 240,
  horizontal = false,
  className = '',
  style,
}: IldsScrollbarProps) {
  return (
    <div
      data-testid="scrollbar"
      className={[
        horizontal ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden',
        scrollbarUtilities,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ maxHeight: horizontal ? undefined : maxHeight, ...style }}
    >
      {children}
    </div>
  );
}
