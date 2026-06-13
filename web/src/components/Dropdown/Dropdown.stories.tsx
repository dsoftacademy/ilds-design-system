import type { Meta, StoryObj } from '@storybook/react';
import { IldsDropdown } from './Dropdown';

const meta = {
  title: 'Components/Dropdown',
  component: IldsDropdown,
  args: {
    label: 'Label',
    placeholder: 'Select option',
  },
} satisfies Meta<typeof IldsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13476:22317 — Empty/Default */
export const EmptyDefault: Story = {
  args: {},
};

/** Figma 13476:22367 — Negative (Error) */
export const Negative: Story = {
  args: {
    isNegative: true,
    errorText: 'Please select an option.',
  },
};

/** PRESUMED — node 13476:22326 not pulled */
export const Disabled: Story = {
  args: {
    isDisabled: true,
    value: 'Option A',
  },
};

/** PRESUMED — node 13476:22349 not pulled */
export const Filled: Story = {
  args: {
    value: 'Option A',
    helperText: 'Select a different option to change.',
  },
};

export const OpenState: Story = {
  args: {
    isOpen: true,
    value: 'Option A',
  },
};

export const Playground: Story = {
  argTypes: {
    isNegative: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isOpen: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    placeholder: 'Select option',
    isNegative: false,
    isDisabled: false,
    isOpen: false,
  },
};
