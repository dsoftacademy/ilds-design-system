import type { Meta, StoryObj } from '@storybook/react';
import { IldsTextLink } from './TextLink';

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M14 4h6v6M20 4l-9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/Text Link',
  component: IldsTextLink,
  args: { label: 'Learn more', size: 'medium', colour: 'default', href: '#' },
} satisfies Meta<typeof IldsTextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13474:16003 — Default blue link */
export const Default: Story = { args: {} };

export const WithSuffixIcon: Story = { args: { suffixIcon: <ExternalIcon /> } };

export const Visited: Story = { args: { isVisited: true } };

export const Disabled: Story = { args: { isDisabled: true } };

export const Small: Story = { args: { size: 'small' } };

export const Large: Story = { args: { size: 'large' } };

export const OnDark: Story = {
  args: { colour: 'white' },
  decorators: [
    (Story) => (
      <div className="bg-neutral-coolgray-900 p-sp-16">
        <Story />
      </div>
    ),
  ],
};

export const Playground: Story = {
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    colour: { control: 'select', options: ['default', 'white'] },
    isVisited: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
  args: { label: 'Learn more', size: 'medium', colour: 'default' },
};
