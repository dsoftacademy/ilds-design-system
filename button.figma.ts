import figma, { html } from "@figma/code-connect/html";

// ── NORMAL PRIMARY (default) ─────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: {
    Appearance: "Normal",
    Type: "Primary",
    State: "Default",
    isLoading: "False",
  },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.primary,
  size: IldsButtonSize.medium,
)`,
  },
);

// ── NORMAL PRIMARY DISABLED ──────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Appearance: "Normal", Type: "Primary", State: "Disabled" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: null,
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.primary,
  size: IldsButtonSize.medium,
)`,
  },
);

// ── NORMAL PRIMARY LOADING ───────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Appearance: "Normal", Type: "Primary", isLoading: "True" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.primary,
  isLoading: true,
)`,
  },
);

// ── NORMAL SECONDARY ─────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Appearance: "Normal", Type: "Secondary", State: "Default" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.secondary,
  size: IldsButtonSize.medium,
)`,
  },
);

// ── NORMAL TERTIARY ──────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Appearance: "Normal", Type: "Tertiary", State: "Default" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.tertiary,
  size: IldsButtonSize.medium,
)`,
  },
);

// ── DESTRUCTIVE PRIMARY ───────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Appearance: "Destructive", Type: "Primary", State: "Default" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.destructive,
  type: IldsButtonType.primary,
  size: IldsButtonSize.medium,
)`,
  },
);

// ── LARGE SIZE ───────────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Size: "Large", Type: "Primary", State: "Default" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.primary,
  size: IldsButtonSize.large,
)`,
  },
);

// ── SMALL SIZE ───────────────────────────────────────────────────────────────
figma.connect(
  "https://www.figma.com/design/PCUj412f0Z1zZLLxQUX22e/ILDS-Master-%7C-Design?node-id=13472-2804",
  {
  variant: { Size: "Small", Type: "Primary", State: "Default" },
  example: () => html`IldsButton(
  label: 'Button',
  onPressed: () {},
  appearance: IldsButtonAppearance.normal,
  type: IldsButtonType.primary,
  size: IldsButtonSize.small,
)`,
  },
);
