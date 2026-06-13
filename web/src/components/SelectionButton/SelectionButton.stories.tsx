import type { Meta, StoryObj } from '@storybook/react';
import { IldsSelectionButton } from './SelectionButton';

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/Selection Button',
  component: IldsSelectionButton,
  args: { label: 'Add', size: 'medium', variant: 'labelOnly' },
} satisfies Meta<typeof IldsSelectionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 14776:1685 — Default */
export const Default: Story = { args: {} };

/** Figma 14776:1685 — Selected ("Added") */
export const Selected: Story = {
  args: { label: 'Added', isSelected: true, variant: 'labelWithSuffix', suffixIcon: <MinusIcon /> },
};

export const WithSuffix: Story = {
  args: { variant: 'labelWithSuffix', suffixIcon: <PlusIcon /> },
};

export const IconOnly: Story = {
  args: { variant: 'iconOnly', ariaLabel: 'Add', suffixIcon: <PlusIcon /> },
};

export const Disabled: Story = { args: { isDisabled: true } };

export const Small: Story = { args: { size: 'small', isSelected: true } };
export const Large: Story = { args: { size: 'large', isSelected: true } };

export const Playground: Story = {
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    variant: { control: 'select', options: ['labelOnly', 'labelWithSuffix', 'iconOnly'] },
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
  args: { label: 'Add', size: 'medium' },
};
