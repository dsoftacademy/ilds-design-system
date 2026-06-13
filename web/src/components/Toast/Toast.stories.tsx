import type { Meta, StoryObj } from '@storybook/react';
import { IldsToast } from './Toast';

const meta = {
  title: 'Components/Toast',
  component: IldsToast,
} satisfies Meta<typeof IldsToast>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 17708:3492 — Success. border-color: #dfffe6 (success-green-50). */
export const Success: Story = {
  args: {
    variant: 'success',
    heading: 'Success',
    message: 'Your action was completed successfully.',
  },
};

/** Figma 17708:3510 — Info. border-color: #edf6ff (secondary-blue-50). */
export const Info: Story = {
  args: {
    variant: 'info',
    heading: 'Information',
    message: 'Here is something you should know.',
  },
};

/** Figma 17708:3501 — Warning. border-color: #fff3e3 (warning-amber-50). */
export const Warning: Story = {
  args: {
    variant: 'warning',
    heading: 'Warning',
    message: 'Please review this before proceeding.',
  },
};

/** Figma 17708:3519 — Error. border-color: #fff2ee (error-red-50). */
export const Error: Story = {
  args: {
    variant: 'error',
    heading: 'Error',
    message: 'Something went wrong. Please try again.',
    showClose: true,
    onClose: () => undefined,
  },
};

export const WithActions: Story = {
  args: {
    variant: 'info',
    heading: 'Confirm action',
    message: 'Would you like to proceed with this action?',
    actions: {
      secondary: { label: 'Cancel', onClick: () => undefined },
      primary: { label: 'Confirm', onClick: () => undefined },
    },
  },
};

export const Playground: Story = {
  argTypes: {
    variant: { control: 'select', options: ['success', 'info', 'warning', 'error'] },
    showClose: { control: 'boolean' },
  },
  args: {
    variant: 'success',
    heading: 'Toast heading',
    message: 'Toast message content.',
    showClose: false,
  },
};
