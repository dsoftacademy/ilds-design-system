import type { Meta, StoryObj } from '@storybook/react';
import { IldsTabs } from './Tabs';

const tabs = [
  { label: 'Overview' },
  { label: 'Details' },
  { label: 'Activity' },
  { label: 'Disabled', disabled: true },
];

const meta = {
  title: 'Components/Tabs',
  component: IldsTabs,
  args: { tabs, emphasis: 'high', alignment: 'left' },
} satisfies Meta<typeof IldsTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 17667:2334 — High emphasis (orange indicator) */
export const HighEmphasis: Story = { args: { selectedIndex: 0 } };

/** Medium emphasis (coolgray-900 indicator) */
export const MediumEmphasis: Story = { args: { selectedIndex: 0, emphasis: 'medium' } };

export const Centered: Story = { args: { selectedIndex: 1, alignment: 'center' } };

export const Playground: Story = {
  argTypes: {
    emphasis: { control: 'select', options: ['high', 'medium'] },
    alignment: { control: 'select', options: ['left', 'center'] },
  },
  args: { tabs, emphasis: 'high', defaultSelectedIndex: 0 },
};
