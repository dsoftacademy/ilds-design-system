import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=14018-6786',
  {
    props: {
      size: figma.enum('Size', {
        'Medium': 'IldsTagSize.medium',
        'Large': 'IldsTagSize.large',
      }),
      isActive: figma.enum('State', {
        'Active': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Focused': 'false',
        'Disabled': 'false',
        'Skeleton': 'false',
      }),
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Active': 'false',
        'Default': 'false',
        'Hover': 'false',
        'Focused': 'false',
        'Skeleton': 'false',
      }),
    },
    example: ({ size, isActive, isDisabled }) => html`
IldsTag(
  label: 'Tag',
  size: ${size},
  isActive: ${isActive},
  isDisabled: ${isDisabled},
  prefixIcon: Icons.label_outline,
  onRemove: () {},
  onTap: () {},
)`,
  },
)
