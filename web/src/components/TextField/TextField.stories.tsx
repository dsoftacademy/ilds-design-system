import type { Meta, StoryObj } from '@storybook/react';
import { IldsTextField } from './TextField';

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 10V7a3 3 0 016 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/Text Field',
  component: IldsTextField,
  args: {
    label: 'Label',
    required: true,
    requiredIndicator: 'text',
    showInfoIcon: true,
    placeholder: 'Placeholder text',
    prefixIcon: <SearchIcon />,
    suffixText: '@example.com',
    suffixIcon: <LockIcon />,
  },
} satisfies Meta<typeof IldsTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13478:25333 — Default */
export const StandardDefault: Story = {
  args: {},
};

/** Figma 13478:25527 — Error */
export const StandardError: Story = {
  args: {
    value: 'Invalid input',
    errorText: 'This field is required.',
  },
};

/** Figma 13478:25519 — Success */
export const StandardSuccess: Story = {
  args: {
    value: 'Valid input',
    successText: 'Looks good!',
    suffixText: undefined,
    suffixIcon: <CheckIcon />,
  },
};

/** Figma 13478:25729 — Disabled */
export const StandardDisabled: Story = {
  args: {
    placeholder: 'Disabled field',
    disabled: true,
  },
};

/**
 * Figma 13478:25681 — Typing (active input with value).
 * Focus + non-empty value → orange-500 border, white bg, NO focus ring.
 */
export const StandardTyping: Story = {
  args: {
    value: 'Typing',
    helperText: 'Helper text goes here.',
  },
};

export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    prefixIcon: <SearchIcon />,
    suffixIcon: <SearchIcon />,
  },
};

export const RequiredText: Story = {
  args: {
    label: 'Email address',
    required: true,
    requiredIndicator: 'text',
    placeholder: 'name@example.com',
    helperText: 'We will never share your email.',
  },
};

export const RequiredField: Story = {
  args: RequiredText.args,
};

export const RequiredAsterisk: Story = {
  args: {
    label: 'Email address',
    required: true,
    requiredIndicator: 'asterisk',
    placeholder: 'name@example.com',
    helperText: 'We will never share your email.',
  },
};

export const Playground: Story = {
  argTypes: {
    kind: { control: 'select', options: ['standard', 'password', 'otp6', 'otp4'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    requiredIndicator: { control: 'select', options: ['text', 'asterisk'] },
    showInfoIcon: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    required: true,
    requiredIndicator: 'text',
    showInfoIcon: true,
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    disabled: false,
  },
};

/** Figma 13478:25341 — Password Default */
export const PasswordDefault: Story = {
  args: {
    kind: 'password',
    placeholder: 'Placeholder text',
    prefixIcon: <UserIcon />,
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    suffixText: undefined,
    suffixIcon: undefined,
  },
};

/** Figma 13478:25691 — Password Typing (masked value + orange border) */
export const PasswordTyping: Story = {
  args: {
    kind: 'password',
    value: '•••',
    prefixIcon: <UserIcon />,
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    suffixText: undefined,
    suffixIcon: undefined,
  },
};

/** Figma 13478:25349 — OTP x 6 Default */
export const Otp6Default: Story = {
  args: {
    kind: 'otp6',
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    prefixIcon: undefined,
    suffixText: undefined,
    suffixIcon: undefined,
  },
};

/** Figma 13478:25701 — OTP x 6 Typing (4 digits entered, focus on 5th cell) */
export const Otp6Typing: Story = {
  args: {
    kind: 'otp6',
    value: '1111',
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    prefixIcon: undefined,
    suffixText: undefined,
    suffixIcon: undefined,
  },
};

/** Figma 13478:25366 — OTP x 4 Default */
export const Otp4Default: Story = {
  args: {
    kind: 'otp4',
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    prefixIcon: undefined,
    suffixText: undefined,
    suffixIcon: undefined,
  },
};

/** Figma 13478:25649 — Loading (orange spinner in suffix, value visible) */
export const Loading: Story = {
  args: {
    value: 'Filled text',
    loading: true,
    prefixIcon: <SearchIcon />,
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    suffixText: undefined,
    suffixIcon: undefined,
  },
};

/** Figma 13478:25657 — Password Loading */
export const PasswordLoading: Story = {
  args: {
    kind: 'password',
    value: 'secret',
    loading: true,
    prefixIcon: <UserIcon />,
    helperText: 'Helper text goes here.',
    helpButtonLabel: 'Help button',
    suffixText: undefined,
    suffixIcon: undefined,
  },
};
