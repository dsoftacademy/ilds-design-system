import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17724-3361',
  {
    props: {
      type: figma.enum('Type', {
        'Selection': 'IldsPaginationType.selection',
        'Non-Selection': 'IldsPaginationType.nonSelection',
      }),
      variant: figma.enum('Verient', {
        'Compact': 'IldsPaginationVariant.compact',
        'Extended': 'IldsPaginationVariant.extended',
      }),
    },
    example: ({ type, variant }) => html`
IldsPagination(
  currentPage: 3,
  totalPages: 12,
  type: ${type},
  variant: ${variant},
  onPageChanged: (page) {},
)`,
  },
)
