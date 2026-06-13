import type { ReactNode } from 'react';

export type IldsToastVariant = 'success' | 'info' | 'warning' | 'error';

export type IldsToastAction = {
  label: string;
  onClick: () => void;
};

export type IldsToastProps = {
  /**
   * Visual variant — controls border tint and icon.
   * Structure is identical across all variants.
   */
  variant: IldsToastVariant;
  heading?: string;
  message: string;
  showClose?: boolean;
  actions?: {
    /** Rendered second (right). bg-primary-orange-500 white text. */
    primary?: IldsToastAction;
    /** Rendered first (left). outline style, orange-500 text. */
    secondary?: IldsToastAction;
  };
  onClose?: () => void;
  className?: string;
};

/* ── Icons (PRESUMED paths — icon asset nodes not pulled separately) ── */

/** Figma: Circle_Check. Success variant. */
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12l3 3 5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Figma: Info circle. Info variant. */
function InfoCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="11" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

/** Figma: Triangle_Warning. Warning variant. */
function TriangleWarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Figma: Circle_Warning. Error variant. */
function CircleWarningIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.75" fill="currentColor" />
    </svg>
  );
}

/** Close button X icon. */
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Variant lookup tables ──────────────────────────────────── */

/**
 * Border tint — light-50 shade per variant.
 * Verified Figma values:
 *   success-green-50  = #dfffe6  (node 17708:3492)
 *   secondary-blue-50 = #edf6ff  (node 17708:3510) — matches Figma custom/tertiary/50 exactly
 *   warning-amber-50  = #fff3e3  (node 17708:3501)
 *   error-red-50      = #fff2ee  (node 17708:3519)
 */
const borderClass: Record<IldsToastVariant, string> = {
  success: 'border-success-green-50',
  info:    'border-secondary-blue-50',
  warning: 'border-warning-amber-50',
  error:   'border-error-red-50',
};

/**
 * Icon color — PRESUMED (icon color nodes not individually pulled from Figma).
 * Semantic mapping: each variant uses its -500/-600 shade.
 */
const iconColorClass: Record<IldsToastVariant, string> = {
  success: 'text-success-green-500',
  info:    'text-informative-blue-500',
  warning: 'text-warning-amber-500',
  error:   'text-error-red-600',
};

const iconNode: Record<IldsToastVariant, ReactNode> = {
  success: <CheckCircleIcon />,
  info:    <InfoCircleIcon />,
  warning: <TriangleWarningIcon />,
  error:   <CircleWarningIcon />,
};

/**
 * ARIA role — alerts are announced immediately; status is polite.
 */
const roleMap: Record<IldsToastVariant, 'alert' | 'status'> = {
  success: 'status',
  info:    'status',
  warning: 'alert',
  error:   'alert',
};

/**
 * ILDS Toast.
 *
 * Figma component set: 17708:3491.
 * Verified nodes: 17708:3492 (Success), 17708:3510 (Info),
 *   17708:3501 (Warning), 17708:3519 (Error).
 *
 * Shared layout (all variants):
 *   - Root: w-320px, rounded-xlarge (12px), border (tint varies), bg white,
 *           p-sp-12 (12px), shadow (0 8px 12px #e0e0e0), flex-col gap-sp-12
 *   - Top section: icon (24px) + flex-col text + optional close (20px)
 *   - Action buttons: secondary (outline) + primary (filled), rounded-large (8px),
 *                     px-sp-12 py-sp-6, text-12 font-bold
 *
 * Icon SVG paths are PRESUMED — replace with actual ILDS icon assets when available.
 */
export function IldsToast({
  variant,
  heading,
  message,
  showClose = false,
  actions,
  onClose,
  className = '',
}: IldsToastProps) {
  const hasActions = !!actions && (!!actions.primary || !!actions.secondary);
  const role = roleMap[variant];

  return (
    <div
      data-testid="toast"
      role={role}
      aria-live={role === 'status' ? 'polite' : 'assertive'}
      className={[
        // Root container
        'w-[320px] rounded-xlarge border bg-white-000 p-sp-12',
        // Shadow — Figma: Shadow/shadow.2 (y=8, blur=12, color=#e0e0e0)
        'shadow-[0_8px_12px_0_#e0e0e0]',
        'flex flex-col gap-sp-12 font-primary',
        // Border tint (varies by variant)
        borderClass[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Top section: icon + text column + optional close button */}
      <div className="flex items-start gap-sp-8">

        {/* Variant icon — 24px slot */}
        <span
          className={[
            'inline-flex shrink-0 size-sp-24 items-center justify-center [&>svg]:size-full',
            iconColorClass[variant],
          ].join(' ')}
        >
          {iconNode[variant]}
        </span>

        {/* Heading + message */}
        <div className="flex flex-col gap-sp-4 flex-1 min-w-0">
          {heading ? (
            <p className="text-14 font-bold leading-[18px] text-neutral-coolgray-900">
              {heading}
            </p>
          ) : null}
          <p className="text-14 font-normal leading-[18px] text-neutral-coolgray-800">
            {message}
          </p>
        </div>

        {/* Close button — 20px, coolgray-500 */}
        {showClose ? (
          <button
            type="button"
            aria-label="Close notification"
            onClick={onClose}
            className="inline-flex shrink-0 size-sp-20 items-center justify-center text-neutral-coolgray-500 [&>svg]:size-full cursor-pointer"
          >
            <CloseIcon />
          </button>
        ) : null}

      </div>

      {/* Action buttons
          Figma: secondary (outline) left, primary (filled) right
          Both: rounded-large (8px), px-sp-12 py-sp-6, text-12 font-bold */}
      {hasActions ? (
        <div className="flex items-center gap-sp-8">
          {actions?.secondary ? (
            <button
              type="button"
              onClick={actions.secondary.onClick}
              className="px-sp-12 py-sp-6 rounded-large border border-primary-orange-500 bg-white-000 text-12 font-bold font-primary leading-[16px] text-primary-orange-500 cursor-pointer"
            >
              {actions.secondary.label}
            </button>
          ) : null}
          {actions?.primary ? (
            <button
              type="button"
              onClick={actions.primary.onClick}
              className="px-sp-12 py-sp-6 rounded-large bg-primary-orange-500 text-12 font-bold font-primary leading-[16px] text-white-000 cursor-pointer"
            >
              {actions.primary.label}
            </button>
          ) : null}
        </div>
      ) : null}

    </div>
  );
}
