import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=14371-6309',
  {
    props: {
      size: figma.enum('Size', {
        'Small': 'IldsSwitchSize.small',
        'Medium': 'IldsSwitchSize.medium',
        'Large': 'IldsSwitchSize.large',
      }),
      value: figma.enum('Type', {
        'On': 'true',
        'Off': 'false',
      }),
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Focused': 'false',
        'Skeleton': 'false',
      }),
    },
    example: ({ size, value, isDisabled }) => html`
IldsSwitch(
  value: ${value},
  size: ${size},
  isDisabled: ${isDisabled},
  showLabel: true,
  showIcon: true,
  label: 'Notifications',
  leadingIcon: Icons.notifications_none,
  onChanged: (value) {},
)`,
  },
)
