import type { Meta, StoryObj } from '@storybook/react';
import { IldsScrollbar } from './Scrollbar';

const meta = {
  title: 'Components/Scrollbar',
  component: IldsScrollbar,
  args: { children: 'Scrollable content' },
} satisfies Meta<typeof IldsScrollbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <IldsScrollbar maxHeight={160} className="w-[320px] rounded-medium border border-neutral-coolgray-200 p-sp-12">
      <div className="flex flex-col gap-sp-8">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="text-14 font-primary text-neutral-coolgray-900">
            Scrollable item {i + 1}
          </p>
        ))}
      </div>
    </IldsScrollbar>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <IldsScrollbar horizontal className="w-[320px] rounded-medium border border-neutral-coolgray-200 p-sp-12">
      <div className="flex gap-sp-12">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="flex size-sp-48 shrink-0 items-center justify-center rounded-medium bg-neutral-coolgray-100 text-14 font-primary text-neutral-coolgray-900"
          >
            {i + 1}
          </div>
        ))}
      </div>
    </IldsScrollbar>
  ),
};
