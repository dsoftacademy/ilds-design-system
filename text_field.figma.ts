import figma, { html } from '@figma/code-connect/html'

// Text Field component set — Figma node: 13478:25332
// All property names verified from componentPropertyDefinitions.
// Properties: Kind, States (plural), Show Label, Show Helper row,
//             Show Prefix, Show Suffix, Show Placeholder

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13478-25332',
  {
    props: {
      kind: figma.enum('Kind', {
        'Standard': 'IldsTextFieldKind.standard',
        'Password': 'IldsTextFieldKind.password',
        'OTP x 6':  'IldsTextFieldKind.otpX6',
        'OTP x 4':  'IldsTextFieldKind.otpX4',
      }),

      // "States" (plural) is the exact Figma property name
      hasError: figma.enum('States', {
        'Error':             'true',
        'Default':           'false',
        'Hover':             'false',
        'Focused':           'false',
        'Typing':            'false',
        'Filled':            'false',
        'Filled & Read Only':'false',
        'Success':           'false',
        'Disabled':          'false',
        'Loading':           'false',
        'Skeleton':          'false',
      }),

      hasSuccess: figma.enum('States', {
        'Success':           'true',
        'Default':           'false',
        'Hover':             'false',
        'Focused':           'false',
        'Typing':            'false',
        'Filled':            'false',
        'Filled & Read Only':'false',
        'Error':             'false',
        'Disabled':          'false',
        'Loading':           'false',
        'Skeleton':          'false',
      }),

      enabled: figma.enum('States', {
        'Disabled':          'false',
        'Default':           'true',
        'Hover':             'true',
        'Focused':           'true',
        'Typing':            'true',
        'Filled':            'true',
        'Filled & Read Only':'true',
        'Success':           'true',
        'Error':             'true',
        'Loading':           'true',
        'Skeleton':          'true',
      }),

      isReadOnly: figma.enum('States', {
        'Filled & Read Only':'true',
        'Default':           'false',
        'Hover':             'false',
        'Focused':           'false',
        'Typing':            'false',
        'Filled':            'false',
        'Success':           'false',
        'Error':             'false',
        'Disabled':          'false',
        'Loading':           'false',
        'Skeleton':          'false',
      }),

      // "Show Prefix" = leading icon, "Show Suffix" = trailing icon
      showLeadingIcon:  figma.boolean('Show Prefix'),
      showTrailingIcon: figma.boolean('Show Suffix'),
    },

    example: ({ kind, hasError, hasSuccess, enabled, isReadOnly, showLeadingIcon, showTrailingIcon }) => html`
IldsTextField(
  label: 'Label',
  placeholder: 'Placeholder text',
  kind: ${kind},
  enabled: ${enabled},
  isReadOnly: ${isReadOnly},
  errorText: ${hasError} ? 'Error message' : null,
  successText: ${hasSuccess} ? 'Success message' : null,
  leadingIcon: ${showLeadingIcon} ? const Icon(Icons.search) : null,
  trailingIcon: ${showTrailingIcon} ? const Icon(Icons.close) : null,
  onChanged: (value) {},
)`,
  },
)
