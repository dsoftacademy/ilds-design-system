import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

/// ILDS button — component set `13472:2804`; loading variants (e.g. `13472:2884`)
/// use a trailing progress indicator while blocking taps.
enum IldsButtonType { primary, secondary, tertiary }

enum IldsButtonSize { large, medium, small }

enum IldsButtonAppearance { normal, destructive }

class IldsButton extends StatelessWidget {
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

  bool get _interactive => !isDisabled && !isLoading && onPressed != null;

  /// Token: `color.orange.500` (normal) or `color.red.600` (destructive)
  Color get _accent => appearance == IldsButtonAppearance.normal
      ? ILDSTokens.orange500
      : ILDSTokens.red600;

  EdgeInsets _padding() {
    switch (size) {
      case IldsButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
      case IldsButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case IldsButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
    }
  }

  double _gap() {
    switch (size) {
      case IldsButtonSize.large:
      case IldsButtonSize.medium:
        return ILDSTokens.spacing2;
      case IldsButtonSize.small:
        return 6;
    }
  }

  /// Token: `typography.fontWeight.bold` + size-specific fontSize
  TextStyle _labelStyle() {
    switch (size) {
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
    switch (size) {
      case IldsButtonSize.large:
        return 24;
      case IldsButtonSize.medium:
        return 20;
      case IldsButtonSize.small:
        return 16;
    }
  }

  double _progressStrokeWidth() {
    switch (size) {
      case IldsButtonSize.large:
        return 2.5;
      case IldsButtonSize.medium:
        return 2.25;
      case IldsButtonSize.small:
        return 2;
    }
  }

  double? _minHeight() {
    if (size == IldsButtonSize.small) return 28;
    return null;
  }

  _ButtonColors _resolveColors() {
    final accent = _accent;

    if (isDisabled) {
      switch (type) {
        case IldsButtonType.primary:
          // Token: color.orange.200 — disabled primary background
          return _ButtonColors(
            background: ILDSTokens.orange200,
            foreground: ILDSTokens.white,
            borderColor: null,
            borderWidth: 0,
          );
        case IldsButtonType.secondary:
          // Token: color.neutral.50 surface, color.neutral.300 border + label
          return _ButtonColors(
            background: ILDSTokens.neutral50,
            foreground: ILDSTokens.neutral300,
            borderColor: ILDSTokens.neutral300,
            borderWidth: ILDSTokens.borderWidth1,
          );
        case IldsButtonType.tertiary:
          return _ButtonColors(
            background: Colors.transparent,
            foreground: ILDSTokens.neutral300,
            borderColor: null,
            borderWidth: 0,
          );
      }
    }

    if (isLoading) {
      switch (type) {
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

    switch (type) {
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

    final showLeading = leading != null && !isLoading;
    final showTrailing = trailing != null && !isLoading;

    final row = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showLeading) ...[
          IconTheme.merge(
            data: IconThemeData(size: dim, color: colors.foreground),
            child: leading!,
          ),
          SizedBox(width: gap),
        ],
        Text(
          label,
          style: style,
          textAlign: TextAlign.center,
          overflow: TextOverflow.ellipsis,
          maxLines: 1,
        ),
        if (isLoading) ...[
          SizedBox(width: gap),
          progress,
        ],
        if (showTrailing) ...[
          SizedBox(width: gap),
          IconTheme.merge(
            data: IconThemeData(size: dim, color: colors.foreground),
            child: trailing!,
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

    return Semantics(
      button: true,
      enabled: _interactive,
      label: label,
      child: Material(
        color: colors.background,
        shape: shape,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: _interactive ? onPressed : null,
          customBorder: shape,
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
