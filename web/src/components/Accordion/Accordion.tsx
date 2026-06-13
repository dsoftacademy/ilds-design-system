import { useId, useState, type ReactNode } from 'react';

export type IldsAccordionProps = {
  /** Figma component 13xxx Accordion. Expandable header + content. */
  title: string;
  children: ReactNode;
  prefixIcon?: ReactNode;
  prefixNumber?: number;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onToggle?: (open: boolean) => void;
  className?: string;
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="size-full">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IldsAccordion({
  title,
  children,
  prefixIcon,
  prefixNumber,
  open,
  defaultOpen = false,
  disabled = false,
  onToggle,
  className = '',
}: IldsAccordionProps) {
  const contentId = useId();
  const [internal, setInternal] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internal;

  const toggle = () => {
    if (disabled) return;
    const next = !isOpen;
    if (!isControlled) setInternal(next);
    onToggle?.(next);
  };

  return (
    <div className={['w-full font-primary', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        data-testid="accordion-header"
        aria-expanded={isOpen}
        aria-controls={contentId}
        disabled={disabled}
        onClick={toggle}
        className={[
          'flex w-full items-center gap-sp-8 px-sp-16 py-sp-12 text-left transition-colors',
          'border-b border-neutral-coolgray-200 outline-0',
          disabled
            ? 'cursor-not-allowed bg-white-000'
            : 'cursor-pointer bg-white-000 hover:bg-neutral-coolgray-50 focus-visible:text-primary-orange-500',
        ].join(' ')}
      >
        {prefixIcon != null ? (
          <span className="inline-flex size-sp-16 items-center justify-center text-neutral-coolgray-600 [&>svg]:size-full">
            {prefixIcon}
          </span>
        ) : null}
        {prefixNumber != null ? (
          <span className="text-14 font-bold leading-[18px] text-neutral-coolgray-600">
            {prefixNumber}
          </span>
        ) : null}
        <span
          className={[
            'flex-1 text-14 font-medium leading-[18px]',
            disabled ? 'text-neutral-coolgray-300' : 'text-neutral-coolgray-900',
          ].join(' ')}
        >
          {title}
        </span>
        <span
          className={[
            'inline-flex size-sp-20 items-center justify-center text-neutral-coolgray-600 transition-[rotate] duration-200 [&>svg]:size-full',
            isOpen ? 'rotate-180' : '',
          ].join(' ')}
        >
          <ChevronDownIcon />
        </span>
      </button>
      <div
        id={contentId}
        role="region"
        hidden={!isOpen}
        className="border-b border-neutral-coolgray-200 px-sp-16 py-sp-16 text-14 font-normal leading-[18px] text-neutral-coolgray-900"
      >
        {children}
      </div>
    </div>
  );
}
