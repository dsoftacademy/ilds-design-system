import { useState } from 'react';

export type IldsPaginationVariant = 'extended' | 'compact';

export type IldsPaginationProps = {
  /** Figma set 17724:3361. Extended (numbered) or Compact ("Page X of Y"). */
  currentPage?: number;
  defaultPage?: number;
  totalPages: number;
  variant?: IldsPaginationVariant;
  onPageChange?: (page: number) => void;
  className?: string;
};

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="size-full">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="size-full">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Figma 17724:3366 — 32px borderless cell; selected = primary-orange-50 bg + orange-600 text.
const cellBase =
  'inline-flex size-[32px] items-center justify-center rounded-[8px] box-border text-16 leading-[20px] font-primary font-bold transition-colors';

function visiblePages(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current]);
  if (current > 1) set.add(current - 1);
  if (current < total) set.add(current + 1);
  return [...set].sort((a, b) => a - b);
}

export function IldsPagination({
  currentPage,
  defaultPage = 1,
  totalPages,
  variant = 'extended',
  onPageChange,
  className = '',
}: IldsPaginationProps) {
  const [internal, setInternal] = useState(defaultPage);
  const isControlled = currentPage !== undefined;
  const page = isControlled ? currentPage : internal;

  const go = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    if (!isControlled) setInternal(next);
    onPageChange?.(next);
  };

  // Figma — "Back"/"Next" are orange text links with a chevron, not bordered icon buttons.
  const NavLink = ({ dir }: { dir: 'prev' | 'next' }) => {
    const disabled = dir === 'prev' ? page <= 1 : page >= totalPages;
    return (
      <button
        type="button"
        aria-label={dir === 'prev' ? 'Previous page' : 'Next page'}
        disabled={disabled}
        onClick={() => go(dir === 'prev' ? page - 1 : page + 1)}
        className={[
          'inline-flex items-center gap-sp-4 px-sp-4 text-16 font-bold leading-[20px] font-primary transition-colors',
          'outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-500 rounded-[4px]',
          disabled
            ? 'text-neutral-coolgray-300 cursor-not-allowed'
            : 'text-primary-orange-500 hover:text-primary-orange-600 cursor-pointer',
        ].join(' ')}
      >
        {dir === 'prev' ? (
          <>
            <span className="inline-flex size-sp-16 [&>svg]:size-full"><ChevronLeft /></span>
            <span>Back</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <span className="inline-flex size-sp-16 [&>svg]:size-full"><ChevronRight /></span>
          </>
        )}
      </button>
    );
  };

  if (variant === 'compact') {
    return (
      <nav
        data-testid="pagination"
        aria-label="Pagination"
        className={['inline-flex items-center gap-sp-8 font-primary', className].filter(Boolean).join(' ')}
      >
        <NavLink dir="prev" />
        <span className="px-sp-4 text-14 font-medium leading-[18px] text-neutral-coolgray-900">
          {page} of {totalPages} pages
        </span>
        <NavLink dir="next" />
      </nav>
    );
  }

  const pages = visiblePages(page, totalPages);

  return (
    <nav
      data-testid="pagination"
      aria-label="Pagination"
      className={['inline-flex flex-wrap items-center gap-sp-4 font-primary', className].filter(Boolean).join(' ')}
    >
      <NavLink dir="prev" />
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        const selected = p === page;
        return (
          <span key={p} className="inline-flex items-center gap-sp-4">
            {gap ? (
              <span className="inline-flex size-[32px] items-center justify-center text-16 font-bold text-neutral-coolgray-900">…</span>
            ) : null}
            <button
              type="button"
              aria-label={`Page ${p}`}
              aria-current={selected ? 'page' : undefined}
              data-testid={selected ? 'pagination-selected' : 'pagination-page'}
              onClick={() => go(p)}
              className={[
                cellBase,
                'outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-500',
                selected
                  ? 'bg-primary-orange-50 text-primary-orange-600'
                  : 'text-neutral-coolgray-900 hover:bg-neutral-coolgray-50',
              ].join(' ')}
            >
              {p}
            </button>
          </span>
        );
      })}
      <NavLink dir="next" />
    </nav>
  );
}
