import { useId, useState, type ReactNode } from 'react';

export type IldsTabEmphasis = 'high' | 'medium';
export type IldsTabAlignment = 'left' | 'center';

export type IldsTabItem = {
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export type IldsTabsProps = {
  /** Figma set 17667:2334. Underline tab bar (High = orange, Medium = coolgray-900). */
  tabs: IldsTabItem[];
  selectedIndex?: number;
  defaultSelectedIndex?: number;
  emphasis?: IldsTabEmphasis;
  alignment?: IldsTabAlignment;
  onChange?: (index: number) => void;
  className?: string;
};

/**
 * Figma 17667:2334. Two emphasis styles (verified via get_design_context 17667:2363):
 * - **High** = filled segmented pills: active = orange-500 bg + white text; inactive =
 *   white bg + coolgray-200 border + coolgray-800 text. Cell h-36, px-32, rounded-8.
 * - **Medium** = underline: active = orange-500 text + 3px orange-500 underline;
 *   inactive = coolgray-800 text; shared coolgray-200 bottom divider.
 */
function highTabClasses(selected: boolean, disabled: boolean): string {
  const base =
    'inline-flex h-[36px] items-center justify-center gap-sp-8 px-sp-32 rounded-[8px] border box-border text-14 font-bold leading-[16px] transition-colors outline-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-orange-500';
  if (disabled) return `${base} bg-white-000 border-neutral-coolgray-200 text-neutral-coolgray-300 cursor-not-allowed`;
  if (selected) return `${base} bg-primary-orange-500 border-primary-orange-500 text-white-000`;
  return `${base} bg-white-000 border-neutral-coolgray-200 text-neutral-coolgray-800 hover:bg-neutral-coolgray-50 cursor-pointer`;
}

function mediumTabClasses(selected: boolean, disabled: boolean): string {
  const base =
    'inline-flex h-[36px] items-center justify-center gap-sp-8 px-sp-12 -mb-px border-b-[3px] text-14 font-bold leading-[16px] transition-colors outline-0 focus-visible:text-primary-orange-500';
  if (disabled) return `${base} border-transparent text-neutral-coolgray-300 cursor-not-allowed`;
  if (selected) return `${base} border-primary-orange-500 text-primary-orange-500 cursor-pointer`;
  return `${base} border-transparent text-neutral-coolgray-800 hover:text-neutral-coolgray-900 cursor-pointer`;
}

export function IldsTabs({
  tabs,
  selectedIndex,
  defaultSelectedIndex = 0,
  emphasis = 'high',
  alignment = 'left',
  onChange,
  className = '',
}: IldsTabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultSelectedIndex);
  const isControlled = selectedIndex !== undefined;
  const active = isControlled ? selectedIndex : internal;
  const isHigh = emphasis === 'high';

  const select = (index: number) => {
    if (tabs[index].disabled) return;
    if (!isControlled) setInternal(index);
    onChange?.(index);
  };

  return (
    <div
      data-testid="tab-bar"
      role="tablist"
      className={[
        'flex font-primary',
        isHigh ? 'gap-sp-8' : 'w-full border-b border-neutral-coolgray-200',
        alignment === 'center' ? 'justify-center' : 'justify-start',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tabs.map((tab, index) => {
        const selected = index === active;
        return (
          <button
            key={`${baseId}-${index}`}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={tab.disabled}
            data-testid={selected ? 'tab-selected' : 'tab-item'}
            onClick={() => select(index)}
            className={isHigh ? highTabClasses(selected, !!tab.disabled) : mediumTabClasses(selected, !!tab.disabled)}
          >
            {tab.icon != null ? (
              <span className="inline-flex size-[1.15em] items-center justify-center [&>svg]:size-full">
                {tab.icon}
              </span>
            ) : null}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
