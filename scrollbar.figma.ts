import figma, { html } from '@figma/code-connect/html'

// Scrollbar component set — Figma node: 17730:521
// Properties on the set: Orientation, State, Position. Position is illustrative only (thumb slot).
// State (Default | Hover) is reflected in IldsScrollbar via theme; Active = drag uses WidgetState.dragged.

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17730-521',
  {
    props: {
      orientation: figma.enum('Orientation', {
        Vertical: 'Axis.vertical',
        Horizontal: 'Axis.horizontal',
      }),
    },
    example: ({ orientation }) => html`
IldsScrollbar(
  child: ListView.builder(
    scrollDirection: ${orientation},
    itemCount: 20,
    itemBuilder: (_, i) => ListTile(title: Text('Row $i')),
  ),
)`,
  },
)
