import type { Meta, StoryObj } from '@storybook/react';
import { IldsPagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: IldsPagination,
  args: { currentPage: 3, totalPages: 12, variant: 'extended' },
} satisfies Meta<typeof IldsPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 17724:3361 — Extended (numbered) */
export const Extended: Story = { args: {} };

/** Figma 17724:3361 — Compact */
export const Compact: Story = { args: { variant: 'compact' } };

export const FewPages: Story = { args: { currentPage: 2, totalPages: 5 } };

export const Playground: Story = {
  argTypes: { variant: { control: 'select', options: ['extended', 'compact'] } },
  args: { defaultPage: 3, totalPages: 12 },
};
