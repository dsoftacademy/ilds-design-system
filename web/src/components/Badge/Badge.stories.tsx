import type { Meta, StoryObj } from '@storybook/react';
import { IldsBadge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: IldsBadge,
  args: { label: 'Badge', variant: 'subtle', size: 'medium' },
} satisfies Meta<typeof IldsBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Subtle: Story = { args: { variant: 'subtle' } };
export const Intense: Story = { args: { variant: 'intense' } };
export const Success: Story = { args: { variant: 'success', label: 'Active' } };
export const ErrorBadge: Story = { args: { variant: 'error', label: 'Failed' } };
export const Warning: Story = { args: { variant: 'warning', label: 'Pending' } };
export const Info: Story = { args: { variant: 'info', label: 'Info' } };
export const Skeleton: Story = { args: { variant: 'skeleton' } };

export const Small: Story = { args: { variant: 'success', size: 'small', label: 'Small' } };
export const Large: Story = { args: { variant: 'success', size: 'large', label: 'Large' } };

export const Playground: Story = {
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'intense', 'success', 'error', 'warning', 'info', 'skeleton'],
    },
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
  args: { label: 'Badge', variant: 'success', size: 'medium' },
};
