import type { Meta, StoryObj } from '@storybook/react';
import { IldsButton } from './Button';

const Icon = ({ children }: { children: string }) => (
  <span className="inline-flex size-sp-20 items-center justify-center text-[10px]" aria-hidden>
    {children}
  </span>
);

const meta = {
  title: 'Components/Button',
  component: IldsButton,
  args: {
    label: 'Button',
    onClick: () => undefined,
  },
  argTypes: {
    type: { control: 'select', options: ['primary', 'secondary', 'tertiary'] },
    size: { control: 'select', options: ['large', 'medium', 'small'] },
    appearance: { control: 'select', options: ['normal', 'destructive'] },
  },
} satisfies Meta<typeof IldsButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const PrimaryLarge: Story = {
  args: { type: 'primary', size: 'large' },
};

export const SecondaryMedium: Story = {
  args: { type: 'secondary', size: 'medium' },
};

export const TertiarySmall: Story = {
  args: { type: 'tertiary', size: 'small' },
};

export const DestructivePrimary: Story = {
  args: { type: 'primary', appearance: 'destructive' },
};

export const DisabledPrimary: Story = {
  args: { type: 'primary', isDisabled: true },
};

export const DisabledSecondary: Story = {
  args: { type: 'secondary', isDisabled: true },
};

export const DisabledTertiary: Story = {
  args: { type: 'tertiary', isDisabled: true },
};

export const LoadingPrimary: Story = {
  args: { type: 'primary', isLoading: true },
};

export const LoadingSecondary: Story = {
  args: { type: 'secondary', isLoading: true },
};

export const LoadingTertiary: Story = {
  args: { type: 'tertiary', isLoading: true },
};

export const WithLeadingIcon: Story = {
  args: {
    type: 'primary',
    leading: <Icon>♥</Icon>,
  },
};

export const WithTrailingIcon: Story = {
  args: {
    type: 'secondary',
    trailing: <Icon>→</Icon>,
  },
};

export const WithBothIcons: Story = {
  args: {
    type: 'primary',
    leading: <Icon>♥</Icon>,
    trailing: <Icon>→</Icon>,
  },
};

export const SizeMatrix: Story = {
  render: () => (
    <div className="flex flex-col gap-sp-16">
      {(['large', 'medium', 'small'] as const).map((size) => (
        <IldsButton key={size} label={`${size} primary`} size={size} />
      ))}
    </div>
  ),
};

export const TypeMatrix: Story = {
  render: () => (
    <div className="flex flex-wrap gap-sp-12">
      <IldsButton label="Primary" type="primary" />
      <IldsButton label="Secondary" type="secondary" />
      <IldsButton label="Tertiary" type="tertiary" />
    </div>
  ),
};
