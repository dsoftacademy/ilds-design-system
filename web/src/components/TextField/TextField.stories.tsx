import type { Meta, StoryObj } from '@storybook/react';
import { IldsTextField } from './TextField';

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

const meta = {
  title: 'Components/Text Field',
  component: IldsTextField,
  args: {
    label: 'Label',
    placeholder: 'Enter text',
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

export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    prefixIcon: <SearchIcon />,
    suffixIcon: <SearchIcon />,
  },
};

export const RequiredField: Story = {
  args: {
    label: 'Email address',
    required: true,
    placeholder: 'name@example.com',
    helperText: 'We will never share your email.',
  },
};

export const Playground: Story = {
  argTypes: {
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    required: false,
    helperText: 'Helper text goes here.',
    disabled: false,
  },
};
