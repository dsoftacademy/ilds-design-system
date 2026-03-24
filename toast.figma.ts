import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17708-3491',
  {
    props: {
      variant: figma.enum('Appearance', {
        'Info': 'IldsToastVariant.info',
        'Success': 'IldsToastVariant.success',
        'Warning': 'IldsToastVariant.warning',
        'Error': 'IldsToastVariant.error',
      }),
      showSupportText: figma.boolean(' Support text'),
      showCloseButton: figma.boolean('Close Button'),
      showHeading: figma.boolean('Heading'),
    },
    example: ({ variant }) => html`
IldsToast(
  message: 'Toast message',
  variant: ${variant},
  showIcon: true,
)`
  }
)
