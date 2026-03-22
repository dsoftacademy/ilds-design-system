import 'package:flutter/material.dart';

/// ILDS button — aligned with Figma component set `13472:2804` (ILDS Master | Design).
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

  /// Token: `global.color.orange.500`
  static const Color primaryColor = Color(0xFFE8440C);

  /// Token: `global.color.orange.200` — primary disabled background
  static const Color disabledBackground = Color(0xFFF5B399);

  /// Token: `semantic.radius.button` → `global.borderRadius.md`
  static const double borderRadius = 8.0;

  /// Figma `fill_NJ5Y2N` — destructive accent
  static const Color _destructiveColor = Color(0xFFE00903);

  static const Color _white = Color(0xFFFFFFFF);

  /// Secondary / tertiary disabled (Figma `fill_MUMX5M`, `stroke_QDNR5L`, text `fill_3RP421`)
  static const Color _disabledSurface = Color(0xFFFAFAFA);
  static const Color _disabledBorder = Color(0xFFBDBDBD);
  static const Color _disabledLabel = Color(0xFFBDBDBD);

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

  Color get _accent =>
      appearance == IldsButtonAppearance.normal ? primaryColor : _destructiveColor;

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
        return 8;
      case IldsButtonSize.small:
        return 6;
    }
  }

  TextStyle _labelStyle() {
    switch (size) {
      case IldsButtonSize.large:
        return const TextStyle(
          fontSize: 16,
          height: 1.25,
          fontWeight: FontWeight.w700,
        );
      case IldsButtonSize.medium:
        return const TextStyle(
          fontSize: 14,
          height: 1.1428571428571428,
          fontWeight: FontWeight.w700,
        );
      case IldsButtonSize.small:
        return const TextStyle(
          fontSize: 12,
          height: 1.3333333333333333,
          fontWeight: FontWeight.w700,
        );
    }
  }

  double _spinnerSize() {
    switch (size) {
      case IldsButtonSize.large:
        return 24;
      case IldsButtonSize.medium:
        return 20;
      case IldsButtonSize.small:
        return 16;
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
          return _ButtonColors(
            background: disabledBackground,
            foreground: _white,
            borderColor: null,
            borderWidth: 0,
          );
        case IldsButtonType.secondary:
          return _ButtonColors(
            background: _disabledSurface,
            foreground: _disabledLabel,
            borderColor: _disabledBorder,
            borderWidth: 1,
          );
        case IldsButtonType.tertiary:
          return _ButtonColors(
            background: Colors.transparent,
            foreground: _disabledLabel,
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
            foreground: _white,
            borderColor: null,
            borderWidth: 0,
          );
        case IldsButtonType.secondary:
          return _ButtonColors(
            background: _white,
            foreground: accent,
            borderColor: accent,
            borderWidth: 1,
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
          foreground: _white,
          borderColor: null,
          borderWidth: 0,
        );
      case IldsButtonType.secondary:
        return _ButtonColors(
          background: _white,
          foreground: accent,
          borderColor: accent,
          borderWidth: 1,
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
    final spinner = _IldsButtonSpinner(
      size: _spinnerSize(),
      color: colors.foreground,
    );

    final showLeading = leading != null && !isLoading;
    final showTrailing = trailing != null && !isLoading;

    final row = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (showLeading) ...[
          IconTheme.merge(
            data: IconThemeData(size: _spinnerSize(), color: colors.foreground),
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
          spinner,
        ],
        if (showTrailing) ...[
          SizedBox(width: gap),
          IconTheme.merge(
            data: IconThemeData(size: _spinnerSize(), color: colors.foreground),
            child: trailing!,
          ),
        ],
      ],
    );

    final child = ConstrainedBox(
      constraints: BoxConstraints(minHeight: _minHeight() ?? 0),
      child: Padding(padding: padding, child: row),
    );

    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(borderRadius),
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

class _IldsButtonSpinner extends StatefulWidget {
  const _IldsButtonSpinner({
    required this.size,
    required this.color,
  });

  final double size;
  final Color color;

  @override
  State<_IldsButtonSpinner> createState() => _IldsButtonSpinnerState();
}

class _IldsButtonSpinnerState extends State<_IldsButtonSpinner>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return Transform.rotate(
            angle: _controller.value * 6.283185307179586,
            child: CustomPaint(
              painter: _ArcPainter(color: widget.color),
              size: Size.square(widget.size),
            ),
          );
        },
      ),
    );
  }
}

class _ArcPainter extends CustomPainter {
  _ArcPainter({required this.color});

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final stroke = (size.shortestSide / 12).clamp(1.5, 2.5);
    final rect = Offset.zero & size;
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      rect.deflate(stroke / 2),
      -0.5,
      4.5,
      false,
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant _ArcPainter oldDelegate) =>
      oldDelegate.color != color;
}
