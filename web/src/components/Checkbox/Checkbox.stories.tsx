import type { Meta, StoryObj } from '@storybook/react';
import { IldsCheckbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: IldsCheckbox,
  args: {
    label: 'Option',
    size: 'medium',
  },
} satisfies Meta<typeof IldsCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13520:33528 — Medium checked default */
export const CheckedDefault: Story = {
  args: { state: 'checked' },
};

/** Figma 13520:33544 — Medium unchecked default */
export const UncheckedDefault: Story = {
  args: { state: 'unchecked' },
};

export const Indeterminate: Story = {
  args: { state: 'indeterminate' },
};

export const Small: Story = {
  args: { size: 'small', state: 'checked' },
};

export const Large: Story = {
  args: { size: 'large', state: 'checked' },
};

/** Figma 13520:33534 — Error checked */
export const Error: Story = {
  args: { state: 'checked', hasError: true, errorText: 'This field is required.' },
};

export const Disabled: Story = {
  args: { state: 'checked', disabled: true },
};

export const Playground: Story = {
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    state: { control: 'select', options: ['unchecked', 'checked', 'indeterminate'] },
    disabled: { control: 'boolean' },
    hasError: { control: 'boolean' },
  },
  args: { label: 'Option', size: 'medium', state: 'checked' },
};
