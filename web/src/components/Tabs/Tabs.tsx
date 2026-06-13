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

function tabTextColor(selected: boolean, disabled: boolean, emphasis: IldsTabEmphasis): string {
  if (disabled) return 'text-neutral-coolgray-300';
  if (selected) return emphasis === 'high' ? 'text-primary-orange-500' : 'text-neutral-coolgray-900';
  return 'text-neutral-coolgray-400 hover:text-neutral-coolgray-600';
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

  const indicatorColor = emphasis === 'high' ? 'border-primary-orange-500' : 'border-neutral-coolgray-900';

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
        'flex w-full border-b border-neutral-coolgray-200 font-primary',
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
            className={[
              'inline-flex h-sp-48 items-center justify-center gap-sp-4 px-sp-12',
              '-mb-px border-b-[3px] transition-colors text-14 leading-[18px]',
              'outline-0 focus-visible:bg-primary-orange-50 focus-visible:text-primary-orange-500',
              selected ? `${indicatorColor} font-bold` : 'border-transparent font-medium',
              tabTextColor(selected, !!tab.disabled, emphasis),
              tab.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
            ].join(' ')}
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
