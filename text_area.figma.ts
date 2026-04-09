import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=14369-11586',
  {
    props: {
      hasError: figma.enum('State', {
        'Error': 'true',
        'Default': 'false',
        'Focused': 'false',
        'Hover': 'false',
        'Filled': 'false',
        'Active/Typing': 'false',
        'Disabled': 'false',
        'Success': 'false',
        'Skeleton': 'false',
      }),
      hasSuccess: figma.enum('State', {
        'Success': 'true',
        'Default': 'false',
        'Focused': 'false',
        'Hover': 'false',
        'Filled': 'false',
        'Active/Typing': 'false',
        'Disabled': 'false',
        'Error': 'false',
        'Skeleton': 'false',
      }),
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Default': 'false',
        'Focused': 'false',
        'Hover': 'false',
        'Filled': 'false',
        'Active/Typing': 'false',
        'Success': 'false',
        'Error': 'false',
        'Skeleton': 'false',
      }),
    },
    example: ({ hasError, hasSuccess, isDisabled }) => html`
IldsTextArea(
  label: 'Description',
  placeholder: 'Type your message',
  helperText: 'Helper text',
  errorText: ${hasError} ? 'Error message' : null,
  successText: ${hasSuccess} ? 'Success message' : null,
  isDisabled: ${isDisabled},
  onChanged: (value) {},
)`,
  },
)
