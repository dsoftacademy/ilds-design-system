import type { Meta, StoryObj } from '@storybook/react';
import { IldsDropdown } from './Dropdown';
import { IldsDropdownMenu } from './DropdownMenu';

const sampleOptions = [
  { label: 'Placeholder text', value: 'opt_1' },
  { label: 'Placeholder text', value: 'opt_2' },
  { label: 'Placeholder text', value: 'opt_3' },
  { label: 'Placeholder text', value: 'opt_4' },
  { label: 'Placeholder text', value: 'opt_5' },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/Dropdown',
  component: IldsDropdown,
  args: {
    label: 'Label',
    required: true,
    requiredIndicator: 'text',
    showInfoIcon: true,
    placeholder: 'Select option',
    prefixIcon: <SearchIcon />,
  },
} satisfies Meta<typeof IldsDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13476:22317 — Empty/Default */
export const EmptyDefault: Story = {
  args: {},
};

/** Figma 13476:22367 — Negative (Error) */
export const Negative: Story = {
  args: {
    isNegative: true,
    errorText: 'Please select an option.',
  },
};

/** Figma 13476:22326 VERIFIED — Disabled: bg=#eeeeee, border=#e0e0e0 */
export const Disabled: Story = {
  args: {
    isDisabled: true,
    value: 'Option A',
  },
};

/** Figma 13476:22349 VERIFIED — Filled: bg=#ffffff, border=#9e9e9e (same as default) */
export const Filled: Story = {
  args: {
    value: 'Option A',
    helperText: 'Select a different option to change.',
  },
};

export const OpenState: Story = {
  args: {
    isOpen: true,
    value: 'Option A',
  },
};

/** Figma 16055:6152 — Trigger + menu panel (5 items + footer) */
export const WithMenu: Story = {
  args: {
    isOpen: true,
    value: 'Placeholder text',
    options: sampleOptions,
    selectedValue: 'opt_1',
    menuSectionLabel: 'Section Label',
    showMenuFooter: true,
  },
};

/** Figma 16055:6152 — Menu panel only (parity target) */
export const MenuPanel: Story = {
  render: () => (
    <IldsDropdownMenu
      sectionLabel="Section Label"
      options={sampleOptions}
      selectedValue="opt_1"
      showFooter
    />
  ),
};

/** Uncontrolled — click the trigger/chevron to open the menu (Figma Active 13476:22390). */
export const Interactive: Story = {
  args: {
    label: 'Label',
    placeholder: 'Select category',
    prefixIcon: <SearchIcon />,
    options: sampleOptions,
    menuSectionLabel: 'Section Label',
    helperText: 'Helper text goes here.',
  },
};

/** Figma 13476:22358 — Loading (orange spinner replaces chevron). */
export const Loading: Story = {
  args: {
    value: 'Filled text',
    isLoading: true,
    prefixIcon: <SearchIcon />,
    helperText: 'Helper text goes here.',
  },
};

export const RequiredAsterisk: Story = {
  args: {
    required: true,
    requiredIndicator: 'asterisk',
  },
};

export const Playground: Story = {
  argTypes: {
    isNegative: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isOpen: { control: 'boolean' },
    required: { control: 'boolean' },
    requiredIndicator: { control: 'select', options: ['text', 'asterisk'] },
    showInfoIcon: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    placeholder: 'Select option',
    required: true,
    requiredIndicator: 'text',
    showInfoIcon: true,
    isNegative: false,
    isDisabled: false,
    isOpen: false,
  },
};
