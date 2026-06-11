import figma, { html } from '@figma/code-connect/html'

// Tag component set — Figma node: 14018:6786
// Page: "Filter: Tag"
// Note: Figma calls this component "Tag". Flutter implementation is IldsChip.
// Property names verified from componentPropertyDefinitions:
//   State: Active | Default | Disabled | Hover | Skeleton | Focused
//   Size: Large | Medium
//   Prefix Icon (boolean), Suffix Button (boolean)
//
// The tag display variants (success/warning/error/info colors) added in Phase 3
// do not yet have a corresponding Figma component set — they will be added
// when the designer publishes the Tag Display variant to the ILDS Figma file.

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=14018-6786',
  {
    props: {
      size: figma.enum('Size', {
        'Large':  'IldsChipSize.large',
        'Medium': 'IldsChipSize.medium',
      }),

      isSelected: figma.enum('State', {
        'Active':   'true',
        'Default':  'false',
        'Disabled': 'false',
        'Hover':    'false',
        'Focused':  'false',
        'Skeleton': 'false',
      }),

      enabled: figma.enum('State', {
        'Active':   'true',
        'Default':  'true',
        'Hover':    'true',
        'Focused':  'true',
        'Skeleton': 'true',
        'Disabled': 'false',
      }),

      showPrefixIcon:   figma.boolean('Prefix Icon'),
      showSuffixButton: figma.boolean('Suffix Button'),
    },

    example: ({ size, isSelected, enabled, showPrefixIcon, showSuffixButton }) => html`
IldsChip(
  label: 'Label',
  size: ${size},
  kind: IldsChipKind.filter,
  isSelected: ${isSelected},
  enabled: ${enabled},
  showPrefixIcon: ${showPrefixIcon},
  showSuffixButton: ${showSuffixButton},
  onPressed: () {},
)`,
  },
)
