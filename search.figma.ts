import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13965-16190',
  {
    props: {
      isLoading: figma.enum('State', {
        'Loading': 'true',
        'Focused': 'false',
        'Active': 'false',
        'Empty': 'false',
        'Filled': 'false',
        'Hover': 'false',
        'Skeleton': 'false',
      }),
    },
    example: ({ isLoading }) => html`
IldsSearch(
  placeholder: 'Search',
  isLoading: ${isLoading},
  onChanged: (value) {},
  onSubmitted: (value) {},
  onClear: () {},
)`,
  },
)
