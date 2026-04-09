import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17667-2334',
  {
    props: {
      emphasis: figma.enum('Emphasis', {
        'High': 'IldsTabEmphasis.high',
        'Medium': 'IldsTabEmphasis.medium',
      }),
      type: figma.enum('Type', {
        'Fixed': 'IldsTabType.fixed',
        'Default': 'IldsTabType.scrollable',
      }),
      alignment: figma.enum('Alignment', {
        'Center': 'IldsTabAlignment.center',
        'Left': 'IldsTabAlignment.left',
      }),
      showIcon: figma.enum('Icon', {
        'True': 'true',
        'False': 'false',
      }),
    },
    example: ({ emphasis, type, alignment, showIcon }) => html`
IldsTabBar(
  tabs: [
    IldsTabItem(label: 'Overview', icon: ${showIcon} ? Icons.dashboard_outlined : null),
    IldsTabItem(label: 'Details', icon: ${showIcon} ? Icons.info_outline : null),
    IldsTabItem(label: 'Activity', icon: ${showIcon} ? Icons.history : null),
  ],
  selectedIndex: 0,
  emphasis: ${emphasis},
  type: ${type},
  alignment: ${alignment},
  onTabChanged: (index) {},
)`,
  },
)
