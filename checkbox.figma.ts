import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13520-33495',
  {
    props: {
      size: figma.enum('Size', {
        'Small': 'IldsCheckboxSize.small',
        'Medium': 'IldsCheckboxSize.medium',
        'Large': 'IldsCheckboxSize.large',
      }),
      state: figma.enum('isSelected', {
        'Yes': 'IldsCheckboxState.checked',
        'No': 'IldsCheckboxState.unchecked',
      }),
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Pressed': 'false',
        'Focused': 'false',
        'Error': 'false',
      }),
      hasError: figma.enum('State', {
        'Error': 'true',
        'Disabled': 'false',
        'Default': 'false',
        'Hover': 'false',
        'Pressed': 'false',
        'Focused': 'false',
      }),
    },
    example: ({ size, state, isDisabled, hasError }) => html`
IldsCheckbox(
  label: 'Checkbox label',
  size: ${size},
  state: ${state},
  isDisabled: ${isDisabled},
  hasError: ${hasError},
  onChanged: (value) {},
)`,
  },
)
