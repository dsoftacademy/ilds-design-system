import figma, { html } from '@figma/code-connect/html'

figma.connect(
  'https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13478-25332',
  {
    props: {
      kind: figma.enum('Kind', {
        'Standard': 'IldsTextFieldKind.standard',
        'Password': 'IldsTextFieldKind.password',
        'OTP x 6': 'IldsTextFieldKind.otpX6',
        'OTP x 4': 'IldsTextFieldKind.otpX4',
      }),
    },
    example: ({ kind }) => html`
IldsTextField(
  label: 'Label',
  placeholder: 'Placeholder text',
  kind: ${kind},
  onChanged: (value) {},
)`
  }
)