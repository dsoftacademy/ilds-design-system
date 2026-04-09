import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17726-494',
  {
    props: {
      initiallyOpen: figma.enum('Type', {
        'Open': 'true',
        'Close': 'false',
      }),
    },
    example: ({ initiallyOpen }) => html`
IldsAccordion(
  title: 'Accordion title',
  content: const Text('Accordion content'),
  initiallyOpen: ${initiallyOpen},
  prefix: Icons.list_alt,
)`,
  },
)
