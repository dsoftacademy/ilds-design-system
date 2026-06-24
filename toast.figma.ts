import figma, { html } from '@figma/code-connect/html'

// Toast component set — Figma node: 17708:3491
// All property names verified from componentPropertyDefinitions.
// Properties: Appearance, Heading, Close Button, " Support text" (leading space — exact name)
// Note: Figma has no accent bar — border tint + icon only (set 17708:3491).
// IldsToast is invoked via IldsToast.show() — no widget tree instantiation.

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=17708-3491',
  {
    props: {
      variant: figma.enum('Appearance', {
        'Info':    'IldsToastVariant.info',
        'Success': 'IldsToastVariant.success',
        'Warning': 'IldsToastVariant.warning',
        'Error':   'IldsToastVariant.error',
      }),

      showHeading: figma.boolean('Heading'),
      showClose:   figma.boolean('Close Button'),

      // Property name has a leading space — exact match required
      showSupportText: figma.boolean(' Support text'),
    },

    example: ({ variant, showHeading, showClose, showSupportText }) => html`
IldsToast.show(
  context,
  message: 'Toast message',
  variant: ${variant},
  title: ${showHeading} ? 'Toast title' : null,
  showClose: ${showClose},
  showAccentBar: false,
  isPersistent: false,
)`,
  },
)
