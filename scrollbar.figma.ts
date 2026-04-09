import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17730-521',
  {
    props: {},
    example: () => html`
IldsScrollbar(
  child: ListView.builder(
    itemCount: 20,
    itemBuilder: (_, i) => ListTile(title: Text('Row $i')),
  ),
)`,
  },
)
