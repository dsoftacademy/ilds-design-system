import type { Meta, StoryObj } from '@storybook/react';
import { IldsSwitch } from './Switch';

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M12 20s-7-4.35-7-10a4 4 0 017-2.65A4 4 0 0119 10c0 5.65-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: 'Components/Switch',
  component: IldsSwitch,
  args: {
    label: 'Label',
    size: 'large',
  },
} satisfies Meta<typeof IldsSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 14371:6416 — On default (orange-500 track) */
export const On: Story = {
  args: { checked: true, thumbIcon: <HeartIcon /> },
};

/** Figma 14371:6410 — Off default (coolgray-100 track) */
export const Off: Story = {
  args: { checked: false, thumbIcon: <HeartIcon /> },
};

export const Medium: Story = {
  args: { size: 'medium', checked: true, thumbIcon: <HeartIcon /> },
};

export const Small: Story = {
  args: { size: 'small', checked: true, thumbIcon: <HeartIcon /> },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, thumbIcon: <HeartIcon /> },
};

export const Playground: Story = {
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Label', size: 'large', checked: true },
};
