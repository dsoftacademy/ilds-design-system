import type { Meta, StoryObj } from '@storybook/react';
import { IldsChip } from './Chip';

/** Figma Success / Circle_Check — prefix icon in set 14018:6786 */
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 12.5l2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: 'Components/Chip',
  component: IldsChip,
  args: {
    label: 'Label',
    size: 'large',
    hasPrefixIcon: true,
    hasSuffixButton: true,
    onPress: () => undefined,
    onRemove: () => undefined,
  },
} satisfies Meta<typeof IldsChip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 14018:6787 — Large, Default */
export const LargeDefault: Story = {
  render: (args) => (
    <IldsChip {...args} prefixIcon={args.hasPrefixIcon ? <CheckCircleIcon /> : undefined} />
  ),
};

/** Figma 14018:6806 — Large, Active/Selected */
export const LargeSelected: Story = {
  args: { isSelected: true },
  render: (args) => (
    <IldsChip {...args} prefixIcon={args.hasPrefixIcon ? <CheckCircleIcon /> : undefined} />
  ),
};

/** Figma 14018:6812 — Large, Disabled */
export const LargeDisabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <IldsChip {...args} prefixIcon={args.hasPrefixIcon ? <CheckCircleIcon /> : undefined} />
  ),
};

/** Figma 16279:8890 — Large, Focused (Tab to focus) */
export const FocusCheckChip: Story = {
  name: 'QA — focus outline (Tab)',
  args: { label: 'Label' },
  render: (args) => (
    <IldsChip {...args} prefixIcon={args.hasPrefixIcon ? <CheckCircleIcon /> : undefined} />
  ),
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
  args: { size: 'medium' },
  render: (args) => (
    <IldsChip {...args} prefixIcon={args.hasPrefixIcon ? <CheckCircleIcon /> : undefined} />
  ),
};

export const Playground: Story = {
  render: (args) => (
    <IldsChip
      {...args}
      prefixIcon={args.hasPrefixIcon ? <CheckCircleIcon /> : undefined}
    />
  ),
  argTypes: {
    size: { control: 'select', options: ['large', 'medium'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    hasPrefixIcon: { control: 'boolean' },
    hasSuffixButton: { control: 'boolean' },
  },
};
