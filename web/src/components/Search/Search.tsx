import { useId, useState } from 'react';

export type IldsSearchProps = {
  /** Figma set 13965:16190. Search input with clear + loading states. */
  placeholder?: string;
  value?: string;
  loading?: boolean;
  disabled?: boolean;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onClear?: () => void;
  className?: string;
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="size-full">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="size-full">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      data-testid="search-spinner"
      className="inline-block size-sp-20 shrink-0 animate-spin rounded-full border-2 border-primary-orange-500 border-r-transparent"
      role="status"
      aria-label="Loading"
    />
  );
}

function containerClasses(disabled: boolean): string {
  const base =
    'flex items-center gap-sp-8 min-h-[44px] px-sp-12 rounded-medium border outline-0 transition-colors font-primary';
  if (disabled) {
    return `${base} bg-neutral-coolgray-200 border-neutral-coolgray-300 pointer-events-none`;
  }
  return [
    base,
    'bg-neutral-coolgray-50 border-neutral-coolgray-500',
    'hover:bg-neutral-coolgray-100 hover:border-neutral-coolgray-800',
    'focus-within:bg-neutral-coolgray-50 focus-within:border-2 focus-within:border-primary-orange-600',
  ].join(' ');
}

export function IldsSearch({
  placeholder = 'Search',
  value,
  loading = false,
  disabled = false,
  onChange,
  onSubmit,
  onClear,
  className = '',
}: IldsSearchProps) {
  const inputId = useId();
  const [draft, setDraft] = useState('');
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : draft;
  const hasValue = displayValue.length > 0;

  const clear = () => {
    if (!isControlled) setDraft('');
    onChange?.('');
    onClear?.();
  };

  return (
    <div
      data-testid="search"
      className={[containerClasses(disabled), className].filter(Boolean).join(' ')}
    >
      <span className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-600 [&>svg]:size-full">
        <SearchIcon />
      </span>
      <input
        id={inputId}
        type="search"
        role="searchbox"
        placeholder={placeholder}
        disabled={disabled}
        value={displayValue}
        onChange={(e) => {
          const next = e.target.value;
          if (!isControlled) setDraft(next);
          onChange?.(next);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit?.(displayValue);
        }}
        className={[
          'flex-1 bg-transparent outline-none [&::-webkit-search-cancel-button]:hidden',
          'text-14 font-normal font-primary leading-[18px]',
          'text-neutral-coolgray-900 placeholder:text-neutral-coolgray-500',
          'disabled:opacity-100 disabled:text-neutral-coolgray-500',
        ].join(' ')}
      />
      {loading ? (
        <Spinner />
      ) : hasValue ? (
        <button
          type="button"
          data-testid="search-clear"
          aria-label="Clear search"
          onClick={clear}
          className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-600 [&>svg]:size-full"
        >
          <ClearIcon />
        </button>
      ) : null}
    </div>
  );
}
