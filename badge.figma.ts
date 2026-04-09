import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13965-24550',
  {
    props: {
      variant: figma.enum('Variant', {
        'Subtle': 'IldsBadgeVariant.subtle',
        'Intense': 'IldsBadgeVariant.intense',
        'Success': 'IldsBadgeVariant.success',
        'Error': 'IldsBadgeVariant.error',
        'Warning': 'IldsBadgeVariant.warning',
        'Info': 'IldsBadgeVariant.info',
        'Skeleton': 'IldsBadgeVariant.skeleton',
      }),
      size: figma.enum('Size', {
        'Small': 'IldsBadgeSize.small',
        'Medium': 'IldsBadgeSize.medium',
        'Large': 'IldsBadgeSize.large',
      }),
    },
    example: ({ variant, size }) => html`
IldsBadge(
  label: 'Badge',
  variant: ${variant},
  size: ${size},
  prefixIcon: Icons.info_outline,
)`,
  },
)
