import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

/// ILDS button — component set `13472:2804`; loading variants (e.g. `13472:2884`)
/// use a trailing progress indicator while blocking taps.
///
/// Icon-only: Figma 13472:2810 (L), 13472:3718 (S). Requires [semanticLabel].
/// Icon slots: L 24px (2805), M 20px (3397), S 12px (3713).
///
/// TODO(web/desktop): hover states (orange-400 / red-500) — out of scope for mobile-first.
enum IldsButtonType { primary, secondary, tertiary }

enum IldsButtonSize { large, medium, small }

enum IldsButtonAppearance { normal, destructive }

class IldsButton extends StatefulWidget {
  const IldsButton({
    super.key,
    this.label,
    required this.onPressed,
    this.type = IldsButtonType.primary,
    this.size = IldsButtonSize.large,
    this.appearance = IldsButtonAppearance.normal,
    this.isDisabled = false,
    this.isLoading = false,
    this.leading,
    this.trailing,
    this.iconOnly = false,
    this.icon,
    this.semanticLabel,
  }) : assert(
          iconOnly ? icon != null && label == null && semanticLabel != null : label != null,
          'iconOnly requires icon + semanticLabel and no label; labeled buttons require label',
        );

  final String? label;
  final VoidCallback? onPressed;
  final IldsButtonType type;
  final IldsButtonSize size;
  final IldsButtonAppearance appearance;
  final bool isDisabled;
  final bool isLoading;
  final Widget? leading;
  final Widget? trailing;
  /// Figma Variant=Icon Only — 13472:2810 (L), 13472:3718 (S).
  final bool iconOnly;
  final Widget? icon;
  final String? semanticLabel;

  @override
  State<IldsButton> createState() => _IldsButtonState();
}

class _IldsButtonState extends State<IldsButton> {
  bool _pressed = false;

  bool get _interactive =>
      !widget.isDisabled && !widget.isLoading && widget.onPressed != null;

  Color get _accent => widget.appearance == IldsButtonAppearance.normal
      ? ILDSTokens.orange500
      : ILDSTokens.red600;

  EdgeInsets _padding() {
    if (widget.iconOnly && widget.size == IldsButtonSize.small) {
      // Figma 13472:3718 — small icon-only px-8 py-6
      return const EdgeInsets.symmetric(horizontal: 8, vertical: 6);
    }

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

  double _iconSlotSize() {
    switch (widget.size) {
      case IldsButtonSize.large:
        return 24;
      case IldsButtonSize.medium:
        return 20;
      case IldsButtonSize.small:
        return 12;
    }
  }

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

  Color? _primaryPressedOverlayColor() {
    if (widget.type != IldsButtonType.primary) return null;
    if (widget.appearance == IldsButtonAppearance.normal) {
      return ILDSTokens.orange600;
    }
    return ILDSTokens.red700;
  }

  _ButtonColors? _pressedColors() {
    if (!_pressed || !_interactive) return null;

    switch (widget.type) {
      case IldsButtonType.primary:
        return null;
      case IldsButtonType.secondary:
        if (widget.appearance == IldsButtonAppearance.normal) {
          return _ButtonColors(
            background: ILDSTokens.orange100,
            foreground: ILDSTokens.orange600,
            borderColor: ILDSTokens.orange600,
            borderWidth: ILDSTokens.borderWidth1,
          );
        }
        return _ButtonColors(
          background: ILDSTokens.red100,
          foreground: ILDSTokens.red700,
          borderColor: ILDSTokens.red600,
          borderWidth: ILDSTokens.borderWidth1,
        );
      case IldsButtonType.tertiary:
        if (widget.appearance == IldsButtonAppearance.normal) {
          return _ButtonColors(
            background: Colors.transparent,
            foreground: ILDSTokens.orange600,
            borderColor: null,
            borderWidth: 0,
          );
        }
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
          return _ButtonColors(
            background: ILDSTokens.neutralCoolgray400,
            foreground: ILDSTokens.white,
            borderColor: null,
            borderWidth: 0,
          );
        case IldsButtonType.secondary:
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

  Widget _iconSlot(Widget child, Color color) {
    final dim = _iconSlotSize();
    return SizedBox(
      width: dim,
      height: dim,
      child: IconTheme.merge(
        data: IconThemeData(size: dim, color: color),
        child: Center(child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = _resolveColors();
    final gap = _gap();
    final padding = _padding();
    final style = _labelStyle().copyWith(color: colors.foreground);
    final slotDim = _iconSlotSize();

    final progress = SizedBox(
      width: slotDim,
      height: slotDim,
      child: CircularProgressIndicator(
        strokeWidth: _progressStrokeWidth(),
        valueColor: AlwaysStoppedAnimation<Color>(colors.foreground),
      ),
    );

    final Widget? leadingContent =
        widget.iconOnly ? widget.icon : widget.leading;

    // Figma 13472:2877 — leading stays visible; spinner replaces trailing slot only.
    final showLeading = leadingContent != null;
    final showTrailingIcon = !widget.iconOnly && widget.trailing != null && !widget.isLoading;
    final showTrailingSpinner = widget.isLoading;

    final row = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showLeading) ...[
          _iconSlot(leadingContent, colors.foreground),
          if (!widget.iconOnly) SizedBox(width: gap),
        ],
        if (!widget.iconOnly && widget.label != null)
          Text(
            widget.label!,
            style: style,
            textAlign: TextAlign.center,
            overflow: TextOverflow.ellipsis,
            maxLines: 1,
          ),
        if (showTrailingSpinner) ...[
          SizedBox(width: gap),
          _iconSlot(progress, colors.foreground),
        ],
        if (showTrailingIcon) ...[
          SizedBox(width: gap),
          _iconSlot(widget.trailing!, colors.foreground),
        ],
      ],
    );

    final child = ConstrainedBox(
      constraints: BoxConstraints(minHeight: _minHeight() ?? 0),
      child: Padding(padding: padding, child: row),
    );

    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
      side: colors.borderColor != null
          ? BorderSide(color: colors.borderColor!, width: colors.borderWidth)
          : BorderSide.none,
    );

    final primaryOverlay = _primaryPressedOverlayColor();
    final semanticsLabel = widget.iconOnly ? widget.semanticLabel! : widget.label!;

    return Semantics(
      button: true,
      enabled: _interactive,
      label: semanticsLabel,
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
