import type { Meta, StoryObj } from '@storybook/react';
import { IldsTextArea } from './TextArea';

const meta = {
  title: 'Components/Text Area',
  component: IldsTextArea,
  args: { label: 'Description', placeholder: 'Type your message', helperText: 'Helper text' },
} satisfies Meta<typeof IldsTextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 14369:11586 — Default */
export const Default: Story = { args: {} };

export const Filled: Story = { args: { value: 'The quick brown fox jumps over the lazy dog.' } };

export const Error: Story = {
  args: { value: 'Too short', errorText: 'Minimum 20 characters required.' },
};

export const Success: Story = {
  args: { value: 'Looks great and detailed enough.', successText: 'Looks good!' },
};

export const Disabled: Story = { args: { placeholder: 'Disabled', disabled: true } };

export const Playground: Story = {
  argTypes: { disabled: { control: 'boolean' }, required: { control: 'boolean' } },
  args: { label: 'Description', helperText: 'Helper text', required: true },
};
