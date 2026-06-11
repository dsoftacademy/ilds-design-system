import figma, { html } from '@figma/code-connect/html'

// Button component set — Figma node: 13472:2804
// All property names verified from componentPropertyDefinitions.
// Properties: Appearance, Type, Size, State, Variant, isLoading

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804',
  {
    props: {
      type: figma.enum('Type', {
        'Primary':   'IldsButtonType.primary',
        'Secondary': 'IldsButtonType.secondary',
        'Tertiary':  'IldsButtonType.tertiary',
      }),

      appearance: figma.enum('Appearance', {
        'Normal':      'IldsButtonAppearance.normal',
        'Destructive': 'IldsButtonAppearance.destructive',
      }),

      size: figma.enum('Size', {
        'Large':  'IldsButtonSize.large',
        'Medium': 'IldsButtonSize.medium',
        'Small':  'IldsButtonSize.small',
      }),

      // State → isDisabled. Hover/Focused/Pressed/Skeleton are runtime — not set in code.
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Default':  'false',
        'Hover':    'false',
        'Focused':  'false',
        'Pressed':  'false',
        'Skeleton': 'false',
      }),

      isLoading: figma.enum('isLoading', {
        'True':  'true',
        'False': 'false',
      }),

      // Variant drives leading/trailing icon slots
      hasLeadingIcon: figma.enum('Variant', {
        'Prefix Icon + Label':  'true',
        'Both Icon + Label':    'true',
        'Label + Suffix Icon':  'false',
        'Label Only':           'false',
        'Icon Only':            'false',
      }),

      hasTrailingIcon: figma.enum('Variant', {
        'Label + Suffix Icon': 'true',
        'Both Icon + Label':   'true',
        'Prefix Icon + Label': 'false',
        'Label Only':          'false',
        'Icon Only':           'false',
      }),
    },

    example: ({ type, appearance, size, isDisabled, isLoading, hasLeadingIcon, hasTrailingIcon }) => html`
IldsButton(
  label: 'Button',
  onPressed: () {},
  type: ${type},
  appearance: ${appearance},
  size: ${size},
  isDisabled: ${isDisabled},
  isLoading: ${isLoading},
  leading: ${hasLeadingIcon} ? const Icon(Icons.favorite_border) : null,
  trailing: ${hasTrailingIcon} ? const Icon(Icons.arrow_forward) : null,
)`,
  },
)
