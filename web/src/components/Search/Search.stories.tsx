import type { Meta, StoryObj } from '@storybook/react';
import { IldsSearch } from './Search';

const meta = {
  title: 'Components/Search',
  component: IldsSearch,
  args: { placeholder: 'Search' },
} satisfies Meta<typeof IldsSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13965:16190 — Empty default */
export const Empty: Story = { args: {} };

export const Filled: Story = { args: { value: 'Filled text' } };

export const Loading: Story = { args: { value: 'Filled text', loading: true } };

export const Disabled: Story = { args: { placeholder: 'Search', disabled: true } };

export const Playground: Story = {
  argTypes: { loading: { control: 'boolean' }, disabled: { control: 'boolean' } },
  args: { placeholder: 'Search' },
};
