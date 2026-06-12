import type { Meta, StoryObj } from '@storybook/react';
import { IldsButton } from './Button';

/** Figma Interface / Heart_01 — stroke icon; slot sizes the SVG (13472:2805 / 3397 / 3713). */
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: 'Components/Button',
  component: IldsButton,
  args: {
    label: 'Button',
    onClick: () => undefined,
  },
  argTypes: {
    type: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
    size: { control: 'select', options: ['large', 'medium', 'small'] },
    appearance: { control: 'select', options: ['normal', 'destructive'] },
  },
} satisfies Meta<typeof IldsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const PrimaryLarge: Story = {
  args: { type: 'primary', size: 'large', label: 'Primary button' },
};

export const SecondaryMedium: Story = {
  args: { type: 'secondary', size: 'medium' },
};

export const TertiarySmall: Story = {
  args: { type: 'tertiary', size: 'small' },
};

export const DestructivePrimary: Story = {
  args: { type: 'primary', appearance: 'destructive' },
};

export const DisabledPrimary: Story = {
  args: { type: 'primary', isDisabled: true },
};

export const DisabledSecondary: Story = {
  args: { type: 'secondary', isDisabled: true },
};

export const DisabledTertiary: Story = {
  args: { type: 'tertiary', isDisabled: true },
};

export const LoadingPrimary: Story = {
  args: { type: 'primary', isLoading: true },
};

export const LoadingSecondary: Story = {
  args: { type: 'secondary', isLoading: true },
};

export const LoadingTertiary: Story = {
  args: { type: 'tertiary', isLoading: true },
};

/** Figma 13472:2805 — Large, Both Icon + Label */
export const BothIconsLarge: Story = {
  args: {
    type: 'primary',
    size: 'large',
    label: 'Primary button',
    leading: <HeartIcon />,
    trailing: <HeartIcon />,
  },
};

/** Figma 13472:3397 — Medium, Both Icon + Label */
export const BothIconsMedium: Story = {
  args: {
    type: 'primary',
    size: 'medium',
    label: 'Primary button',
    leading: <HeartIcon />,
    trailing: <HeartIcon />,
  },
};

/** Figma 13472:3713 — Small, Both Icon + Label */
export const BothIconsSmall: Story = {
  args: {
    type: 'primary',
    size: 'small',
    label: 'Primary button',
    leading: <HeartIcon />,
    trailing: <HeartIcon />,
  },
};

/** Figma 13472:2810 — Large, Icon Only (px-sp-16 unchanged) */
export const IconOnlyLarge: Story = {
  args: {
    type: 'primary',
    size: 'large',
    iconOnly: true,
    icon: <HeartIcon />,
    'aria-label': 'Favorite',
  },
};

/** Figma 13472:3718 — Small, Icon Only (px-sp-8 py-sp-6) */
export const IconOnlySmall: Story = {
  args: {
    type: 'primary',
    size: 'small',
    iconOnly: true,
    icon: <HeartIcon />,
    'aria-label': 'Favorite',
  },
};

/** Figma 13472:2877 — Large, loading: leading icon visible, spinner in trailing slot */
export const LoadingBothIconsLarge: Story = {
  args: {
    type: 'primary',
    size: 'large',
    label: 'Primary button',
    isLoading: true,
    leading: <HeartIcon />,
    trailing: <HeartIcon />,
  },
};

export const WithLeadingIcon: Story = {
  args: {
    type: 'primary',
    label: 'Primary button',
    leading: <HeartIcon />,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    type: 'secondary',
    label: 'Primary button',
    trailing: <HeartIcon />,
  },
};

export const SkeletonPrimary: Story = {
  name: 'Skeleton (PRESUMED visual)',
  args: { type: 'primary', isSkeleton: true, label: 'Loading…' },
  parameters: {
    docs: {
      description: {
        story:
          'PRESUMED — no Figma Skeleton node pulled. Placeholder pulse using coolgray-200; not parity-verified.',
      },
    },
  },
};

export const HoverCheckPrimary: Story = {
  name: 'QA — hover primary',
  args: { type: 'primary', size: 'large', label: 'Hover me' },
  parameters: {
    docs: { description: { story: 'Figma 13472:3060 — hover bg primary-orange-400' } },
  },
};

export const FocusCheckPrimary: Story = {
  name: 'QA — focus outline (Tab)',
  args: { type: 'primary', size: 'large', label: 'Tab to focus' },
  parameters: {
    docs: {
      description: {
        story: 'Figma 13472:3135 — outline-2 primary-orange-600, outline-offset 1px',
      },
    },
  },
};

export const SizeMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-sp-16">
      {(['large', 'medium', 'small'] as const).map((size) => (
        <IldsButton key={size} label={`${size} primary`} size={size} />
      ))}
    </div>
  ),
};

export const TypeMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap gap-sp-12">
      <IldsButton label="Primary" type="primary" />
      <IldsButton label="Secondary" type="secondary" />
      <IldsButton label="Tertiary" type="tertiary" />
    </div>
  ),
};
