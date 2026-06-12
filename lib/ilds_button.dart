import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

/// ILDS button — component set `13472:2804`; loading variants (e.g. `13472:2884`)
/// use a trailing progress indicator while blocking taps.
///
/// TODO(web/desktop): hover states (orange-400 / red-500) — out of scope for mobile-first.
enum IldsButtonType { primary, secondary, tertiary }

enum IldsButtonSize { large, medium, small }

enum IldsButtonAppearance { normal, destructive }

class IldsButton extends StatefulWidget {
  const IldsButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.type = IldsButtonType.primary,
    this.size = IldsButtonSize.large,
    this.appearance = IldsButtonAppearance.normal,
    this.isDisabled = false,
    this.isLoading = false,
    this.leading,
    this.trailing,
  });

  final String label;
  final VoidCallback? onPressed;
  final IldsButtonType type;
  final IldsButtonSize size;
  final IldsButtonAppearance appearance;
  final bool isDisabled;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;

  @override
  State<IldsButton> createState() => _IldsButtonState();
}

class _IldsButtonState extends State<IldsButton> {
  bool _pressed = false;

  bool get _interactive =>
      !widget.isDisabled && !widget.isLoading && widget.onPressed != null;

  /// Token: `color.orange.500` (normal) or `color.red.600` (destructive)
  Color get _accent => widget.appearance == IldsButtonAppearance.normal
      ? ILDSTokens.orange500
      : ILDSTokens.red600;

  EdgeInsets _padding() {
    if (widget.type == IldsButtonType.tertiary) {
      switch (widget.size) {
        case IldsButtonSize.large:
          return const EdgeInsets.symmetric(vertical: 12);
        case IldsButtonSize.medium:
          return const EdgeInsets.symmetric(vertical: 8);
        case IldsButtonSize.small:
          return const EdgeInsets.symmetric(vertical: 6);
      }
    }
    switch (widget.size) {
      case IldsButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
      case IldsButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case IldsButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
    }
  }

  double _gap() {
    switch (widget.size) {
      case IldsButtonSize.large:
      case IldsButtonSize.medium:
        return ILDSTokens.spacing2;
      case IldsButtonSize.small:
        return 6;
    }
  }

  /// Token: `typography.fontWeight.bold` + size-specific fontSize
  TextStyle _labelStyle() {
    switch (widget.size) {
      case IldsButtonSize.large:
        return const TextStyle(
          fontSize: 16,
          height: 1.25,
          fontWeight: ILDSTokens.fontWeightBold,
        );
      case IldsButtonSize.medium:
        return const TextStyle(
          fontSize: 14,
          height: 1.1428571428571428,
          fontWeight: ILDSTokens.fontWeightBold,
        );
      case IldsButtonSize.small:
        return const TextStyle(
          fontSize: 12,
          height: 1.3333333333333333,
          fontWeight: ILDSTokens.fontWeightBold,
        );
    }
  }

  double _progressSize() {
    switch (widget.size) {
      case IldsButtonSize.large:
        return 24;
      case IldsButtonSize.medium:
        return 20;
      case IldsButtonSize.small:
        return 16;
    }
  }

  double _progressStrokeWidth() {
    switch (widget.size) {
      case IldsButtonSize.large:
        return 2.5;
      case IldsButtonSize.medium:
        return 2.25;
      case IldsButtonSize.small:
        return 2;
    }
  }

  double? _minHeight() {
    switch (widget.size) {
      case IldsButtonSize.large:
        return 48;
      case IldsButtonSize.medium:
        return 36;
      case IldsButtonSize.small:
        return 28;
    }
  }

  /// Primary only — Figma pressed primary normal `13472:2988` (orange-600 overlay).
  Color? _primaryPressedOverlayColor() {
    if (widget.type != IldsButtonType.primary) return null;
    if (widget.appearance == IldsButtonAppearance.normal) {
      return ILDSTokens.orange600;
    }
    return ILDSTokens.red700;
  }

  /// Secondary/tertiary pressed — bg/border/label change; overlay cannot express this.
  _ButtonColors? _pressedColors() {
    if (!_pressed || !_interactive) return null;

    switch (widget.type) {
      case IldsButtonType.primary:
        return null;
      case IldsButtonType.secondary:
        if (widget.appearance == IldsButtonAppearance.normal) {
          // Figma 13472:3024 — bg primary-orange-100, border + label primary-orange-600
          return _ButtonColors(
            background: ILDSTokens.orange100,
            foreground: ILDSTokens.orange600,
            borderColor: ILDSTokens.orange600,
            borderWidth: ILDSTokens.borderWidth1,
          );
        }
        // Figma 16186:2051 — bg red-100, label red-700, border stays red-600
        return _ButtonColors(
          background: ILDSTokens.red100,
          foreground: ILDSTokens.red700,
          borderColor: ILDSTokens.red600,
          borderWidth: ILDSTokens.borderWidth1,
        );
      case IldsButtonType.tertiary:
        if (widget.appearance == IldsButtonAppearance.normal) {
          // Figma 13472:3042 — label primary-orange-600, bg transparent
          return _ButtonColors(
            background: Colors.transparent,
            foreground: ILDSTokens.orange600,
            borderColor: null,
            borderWidth: 0,
          );
        }
        // Figma 16186:2581 — label error-red-700 (designer updated 2026-06-12)
        return _ButtonColors(
          background: Colors.transparent,
          foreground: ILDSTokens.red700,
          borderColor: null,
          borderWidth: 0,
        );
    }
  }

  _ButtonColors _resolveColors() {
    final pressed = _pressedColors();
    if (pressed != null) return pressed;

    final accent = _accent;

    if (widget.isDisabled) {
      switch (widget.type) {
        case IldsButtonType.primary:
          // Figma disabled primary — neutral-coolgray-400 surface, white label
          return _ButtonColors(
            background: ILDSTokens.neutralCoolgray400,
            foreground: ILDSTokens.white,
            borderColor: null,
            borderWidth: 0,
          );
        case IldsButtonType.secondary:
          // Figma disabled secondary — coolgray-50 / coolgray-400 border + label
          return _ButtonColors(
            background: ILDSTokens.neutralCoolgray50,
            foreground: ILDSTokens.neutralCoolgray400,
            borderColor: ILDSTokens.neutralCoolgray400,
            borderWidth: ILDSTokens.borderWidth1,
          );
        case IldsButtonType.tertiary:
          return _ButtonColors(
            background: Colors.transparent,
            foreground: ILDSTokens.neutralCoolgray400,
            borderColor: null,
            borderWidth: 0,
          );
      }
    }

    if (widget.isLoading) {
      switch (widget.type) {
        case IldsButtonType.primary:
          return _ButtonColors(
            background: accent,
            foreground: ILDSTokens.white,
            borderColor: null,
            borderWidth: 0,
          );
        case IldsButtonType.secondary:
          return _ButtonColors(
            background: ILDSTokens.white,
            foreground: accent,
            borderColor: accent,
            borderWidth: ILDSTokens.borderWidth1,
          );
        case IldsButtonType.tertiary:
          return _ButtonColors(
            background: Colors.transparent,
            foreground: accent,
            borderColor: null,
            borderWidth: 0,
          );
      }
    }

    switch (widget.type) {
      case IldsButtonType.primary:
        return _ButtonColors(
          background: accent,
          foreground: ILDSTokens.white,
          borderColor: null,
          borderWidth: 0,
        );
      case IldsButtonType.secondary:
        return _ButtonColors(
          background: ILDSTokens.white,
          foreground: accent,
          borderColor: accent,
          borderWidth: ILDSTokens.borderWidth1,
        );
      case IldsButtonType.tertiary:
        return _ButtonColors(
          background: Colors.transparent,
          foreground: accent,
          borderColor: null,
          borderWidth: 0,
        );
    }
  }

  void _onHighlightChanged(bool highlighted) {
    if (widget.type == IldsButtonType.primary) return;
    if (_pressed == highlighted) return;
    setState(() => _pressed = highlighted);
  }

  @override
  Widget build(BuildContext context) {
    final colors = _resolveColors();
    final gap = _gap();
    final padding = _padding();
    final style = _labelStyle().copyWith(color: colors.foreground);
    final dim = _progressSize();
    final progress = SizedBox(
      width: dim,
      height: dim,
      child: CircularProgressIndicator(
        strokeWidth: _progressStrokeWidth(),
        valueColor: AlwaysStoppedAnimation<Color>(colors.foreground),
      ),
    );

    final showLeading = widget.leading != null && !widget.isLoading;
    final showTrailing = widget.trailing != null && !widget.isLoading;

    final row = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showLeading) ...[
          IconTheme.merge(
            data: IconThemeData(size: dim, color: colors.foreground),
            child: widget.leading!,
          ),
          SizedBox(width: gap),
        ],
        Text(
          widget.label,
          style: style,
          textAlign: TextAlign.center,
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
        if (widget.isLoading) ...[
          SizedBox(width: gap),
          progress,
        ],
        if (showTrailing) ...[
          SizedBox(width: gap),
          IconTheme.merge(
            data: IconThemeData(size: dim, color: colors.foreground),
            child: widget.trailing!,
          ),
        ],
      ],
    );

    final child = ConstrainedBox(
      constraints: BoxConstraints(minHeight: _minHeight() ?? 0),
      child: Padding(padding: padding, child: row),
    );

    // Token: borderRadius.md
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
      side: colors.borderColor != null
          ? BorderSide(color: colors.borderColor!, width: colors.borderWidth)
          : BorderSide.none,
    );

    final primaryOverlay = _primaryPressedOverlayColor();

    return Semantics(
      button: true,
      enabled: _interactive,
      label: widget.label,
      child: Material(
        color: colors.background,
        shape: shape,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: _interactive ? widget.onPressed : null,
          onHighlightChanged: _onHighlightChanged,
          customBorder: shape,
          overlayColor: primaryOverlay == null
              ? const WidgetStatePropertyAll(Colors.transparent)
              : WidgetStateProperty.resolveWith<Color?>((states) {
                  if (states.contains(WidgetState.pressed)) {
                    return primaryOverlay;
                  }
                  return null;
                }),
          child: child,
        ),
      ),
    );
  }
}

class _ButtonColors {
  const _ButtonColors({
    required this.background,
    required this.foreground,
    required this.borderColor,
    required this.borderWidth,
  });

  final Color background;
  final Color foreground;
  final Color? borderColor;
  final double borderWidth;
}
