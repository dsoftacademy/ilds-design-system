import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13474-16003',
  {
    props: {
      size: figma.enum('Size', {
        'Small': 'IldsTextLinkSize.small',
        'Medium': 'IldsTextLinkSize.medium',
        'Large': 'IldsTextLinkSize.large',
      }),
      colour: figma.enum('Colour', {
        'Default': 'IldsTextLinkColour.defaultBlue',
        'White': 'IldsTextLinkColour.white',
      }),
      isDisabled: figma.enum('States', {
        'Disabled': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Pressed': 'false',
        'Focus': 'false',
        'Visited': 'false',
      }),
      isVisited: figma.enum('States', {
        'Visited': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Pressed': 'false',
        'Focus': 'false',
        'Disabled': 'false',
      }),
    },
    example: ({ size, colour, isDisabled, isVisited }) => html`
IldsTextLink(
  label: 'Learn more',
  size: ${size},
  colour: ${colour},
  isDisabled: ${isDisabled},
  isVisited: ${isVisited},
  prefixIcon: Icons.open_in_new,
  onTap: () {},
)`,
  },
)
