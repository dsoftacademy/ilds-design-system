import type { Meta, StoryObj } from '@storybook/react';
import { IldsRadio } from './Radio';

const meta = {
  title: 'Components/Radio',
  component: IldsRadio,
  args: {
    label: 'Option',
    size: 'medium',
    name: 'demo',
  },
} satisfies Meta<typeof IldsRadio>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma 13486:38524 — Medium selected default */
export const SelectedDefault: Story = {
  args: { checked: true },
};

/** Figma 13486:38543 — Medium unselected default */
export const UnselectedDefault: Story = {
  args: { checked: false },
};

export const Small: Story = {
  args: { size: 'small', checked: true },
};

export const Large: Story = {
  args: { size: 'large', checked: true },
};

export const Error: Story = {
  args: { checked: false, hasError: true },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true },
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-sp-12">
      <IldsRadio name="grp" value="a" label="Option A" defaultChecked />
      <IldsRadio name="grp" value="b" label="Option B" />
      <IldsRadio name="grp" value="c" label="Option C" />
    </div>
  ),
};

export const Playground: Story = {
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    hasError: { control: 'boolean' },
  },
  args: { label: 'Option', size: 'medium', checked: true },
};
