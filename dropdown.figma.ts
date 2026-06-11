import figma, { html } from '@figma/code-connect/html'

// Dropdown Trigger component set — Figma node: 13476:22316
// Page: "Select: Dropdown Trigger"
// Note: Figma splits this into Dropdown Trigger (13476:22316) + Dropdown Menu (16055:6151).
// IldsDropdown maps to the Trigger node as it is the widget designers place in screens.
// Figma property names verified from componentPropertyDefinitions.

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13476-22316',
  {
    props: {
      // "States" (plural) is the exact Figma property name
      enabled: figma.enum('States', {
        'Empty':              'true',
        'Filled':             'true',
        'Active':             'true',
        'Hover':              'true',
        'Focused':            'true',
        'Filled & Read Only': 'true',
        'Negative':           'true',
        'Loading':            'false',
        'Disabled':           'false',
        'Skeleton':           'false',
      }),

      isLoading: figma.enum('States', {
        'Loading':            'true',
        'Empty':              'false',
        'Filled':             'false',
        'Active':             'false',
        'Hover':              'false',
        'Focused':            'false',
        'Filled & Read Only': 'false',
        'Negative':           'false',
        'Disabled':           'false',
        'Skeleton':           'false',
      }),

      hasError: figma.enum('States', {
        'Negative':           'true',
        'Empty':              'false',
        'Filled':             'false',
        'Active':             'false',
        'Hover':              'false',
        'Focused':            'false',
        'Filled & Read Only': 'false',
        'Loading':            'false',
        'Disabled':           'false',
        'Skeleton':           'false',
      }),

      showLabel:    figma.boolean('Show Label'),
      showHelpText: figma.boolean('Show Help Text'),
    },

    example: ({ enabled, isLoading, hasError, showHelpText }) => html`
IldsDropdown(
  label: 'Label',
  placeholder: 'Select an option',
  options: const [
    IldsDropdownOption(label: 'Option 1', value: 'option_1'),
    IldsDropdownOption(label: 'Option 2', value: 'option_2'),
    IldsDropdownOption(label: 'Option 3', value: 'option_3'),
  ],
  enabled: ${enabled},
  isLoading: ${isLoading},
  errorText: ${hasError} ? 'Error message' : null,
  helperText: ${showHelpText} ? 'Helper text' : null,
  onChanged: (value) {},
)`,
  },
)
