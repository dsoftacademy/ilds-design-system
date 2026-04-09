import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13486-38485',
  {
    props: {
      size: figma.enum('Size', {
        'Small': 'IldsRadioSize.small',
        'Medium': 'IldsRadioSize.medium',
        'Large': 'IldsRadioSize.large',
      }),
      isSelected: figma.enum('isSelected', {
        'Yes': 'true',
        'No': 'false',
      }),
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Focus': 'false',
        'Error': 'false',
        'Pressed': 'false',
      }),
      hasError: figma.enum('State', {
        'Error': 'true',
        'Disabled': 'false',
        'Default': 'false',
        'Hover': 'false',
        'Focus': 'false',
        'Pressed': 'false',
      }),
    },
    example: ({ size, isSelected, isDisabled, hasError }) => html`
IldsRadio(
  value: 'option_1',
  groupValue: ${isSelected} ? 'option_1' : 'option_2',
  label: 'Option 1',
  size: ${size},
  isDisabled: ${isDisabled},
  hasError: ${hasError},
  onChanged: (value) {},
)`,
  },
)
