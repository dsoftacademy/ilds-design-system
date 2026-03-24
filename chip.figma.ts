import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=14018-6786',
  {
    props: {
      size: figma.enum('Size', {
        'Large': 'IldsChipSize.large',
        'Medium': 'IldsChipSize.medium',
      }),
      isSelected: figma.enum('State', {
        'Active': 'true',
        'Default': 'false',
        'Disabled': 'false',
      }),
      enabled: figma.enum('State', {
        'Active': 'true',
        'Default': 'true',
        'Disabled': 'false',
      }),
      showPrefixIcon: figma.boolean('Prefix Icon'),
      showSuffixButton: figma.boolean('Suffix Button'),
    },
    example: ({ size, isSelected, enabled, showPrefixIcon, showSuffixButton }) => html`
IldsChip(
  label: 'Label',
  size: ${size},
  isSelected: ${isSelected},
  enabled: ${enabled},
  showPrefixIcon: ${showPrefixIcon},
  showSuffixButton: ${showSuffixButton},
  onPressed: () {},
)`
  }
)
