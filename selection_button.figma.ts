import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=14776-1685',
  {
    props: {
      size: figma.enum('Size', {
        'Small': 'IldsSelectionButtonSize.small',
        'Medium': 'IldsSelectionButtonSize.medium',
        'Large': 'IldsSelectionButtonSize.large',
      }),
      isSelected: figma.enum('State', {
        'Selected': 'true',
        'Default': 'false',
        'Hover': 'false',
        'Pressed': 'false',
        'Focused': 'false',
        'Disabled': 'false',
        'Skeleton': 'false',
      }),
      isDisabled: figma.enum('State', {
        'Disabled': 'true',
        'Selected': 'false',
        'Default': 'false',
        'Hover': 'false',
        'Pressed': 'false',
        'Focused': 'false',
        'Skeleton': 'false',
      }),
      variant: figma.enum('Variant', {
        'Label Only': 'IldsSelectionButtonVariant.labelOnly',
        'Label + Suffix Icon': 'IldsSelectionButtonVariant.labelWithSuffix',
        'Icon Only': 'IldsSelectionButtonVariant.iconOnly',
      }),
    },
    example: ({ size, isSelected, isDisabled, variant }) => html`
IldsSelectionButton(
  label: 'Select',
  size: ${size},
  isSelected: ${isSelected},
  isDisabled: ${isDisabled},
  variant: ${variant},
  suffixIcon: Icons.keyboard_arrow_down,
  onTap: () {},
)`,
  },
)
