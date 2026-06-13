import type { Meta, StoryObj } from '@storybook/react';
import { IldsChip } from './Chip';

/** Figma Interface / Heart_01 — stroke icon; 12px slot sizes the SVG (14018:6786). */
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
  title: 'Components/Chip',
  component: IldsChip,
  args: {
    label: 'Chip label',
    onPress: () => undefined,
  },
} satisfies Meta<typeof IldsChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 14018:6787 — Large, Default */
export const LargeDefault: Story = {
  args: {
    size: 'large',
    hasPrefixIcon: true,
    prefixIcon: <HeartIcon />,
  },
};

/** Figma 14018:6806 — Large, Active/Selected */
export const LargeSelected: Story = {
  args: {
    size: 'large',
    isSelected: true,
    hasPrefixIcon: true,
    prefixIcon: <HeartIcon />,
  },
};

/** Figma 14018:6812 — Large, Disabled */
export const LargeDisabled: Story = {
  args: {
    size: 'large',
    isDisabled: true,
    hasPrefixIcon: true,
    prefixIcon: <HeartIcon />,
  },
};

/** Figma 16279:8890 — Large, Focused (Tab to focus; no suffix) */
export const FocusCheckChip: Story = {
  name: 'QA — focus outline (Tab)',
  args: {
    size: 'large',
    label: 'Tab to focus',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Figma 16279:8890 — outline-2 primary-orange-600, offset 2px; inner bg coolgray-50, border coolgray-800',
      },
    },
  },
};

/** Figma 14018:6843 — Medium, Default */
export const MediumDefault: Story = {
  args: {
    size: 'medium',
    hasPrefixIcon: true,
    prefixIcon: <HeartIcon />,
  },
};

export const Playground: Story = {
  render: (args) => (
    <IldsChip
      {...args}
      prefixIcon={args.hasPrefixIcon ? <HeartIcon /> : undefined}
    />
  ),
  argTypes: {
    size: { control: 'select', options: ['large', 'medium'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    hasPrefixIcon: { control: 'boolean' },
    hasSuffixButton: { control: 'boolean' },
  },
  args: {
    label: 'Chip label',
    size: 'large',
    hasPrefixIcon: true,
    hasSuffixButton: false,
    onRemove: () => undefined,
  },
};
