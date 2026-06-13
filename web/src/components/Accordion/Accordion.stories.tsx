import type { Meta, StoryObj } from '@storybook/react';
import { IldsAccordion } from './Accordion';

const meta = {
  title: 'Components/Accordion',
  component: IldsAccordion,
  args: {
    title: 'What is covered under this policy?',
    children:
      'This policy covers hospitalization, day-care procedures, and pre/post hospitalization expenses as per the terms.',
  },
} satisfies Meta<typeof IldsAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = { args: {} };

export const Open: Story = { args: { defaultOpen: true } };

export const WithNumber: Story = { args: { prefixNumber: 1, defaultOpen: true } };

export const Disabled: Story = { args: { disabled: true } };

export const Group: Story = {
  render: () => (
    <div className="w-[480px] border-t border-neutral-coolgray-200">
      <IldsAccordion title="Section one" defaultOpen>
        Content for section one.
      </IldsAccordion>
      <IldsAccordion title="Section two">Content for section two.</IldsAccordion>
      <IldsAccordion title="Section three">Content for section three.</IldsAccordion>
    </div>
  ),
};
