import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

/// Scrollbar aligned with Figma component **Scrollbar** (`17730:521`).
///
/// Figma documents **Default** and **Hover** (thumb grows 6px → 12px; fills stay on-token).
/// **Active** (thumb drag) is mapped to Flutter’s [WidgetState.dragged] with a darker thumb
/// so pressed/drag feedback is visible (no separate Figma variant).
class IldsScrollbar extends StatefulWidget {
  const IldsScrollbar({
    super.key,
    required this.child,
    this.controller,
    this.thumbVisibility = true,
  });

  final Widget child;
  final ScrollController? controller;
  final bool thumbVisibility;

  /// Default rail thickness (Figma vertical default width 6px).
  static double get _thicknessDefault => ILDSTokens.borderWidth2 + ILDSTokens.spacing1;

  /// Hover / dragged rail thickness (Figma vertical hover width 12px).
  static double get _thicknessExpanded => ILDSTokens.spacing3;

  static Color _thumbColorFor(Set<WidgetState> states) {
    if (states.contains(WidgetState.dragged)) {
      return ILDSTokens.neutral400;
    }
    return ILDSTokens.neutral200;
  }

  static double _thicknessFor(Set<WidgetState> states) {
    if (states.contains(WidgetState.hovered) || states.contains(WidgetState.dragged)) {
      return _thicknessExpanded;
    }
    return _thicknessDefault;
  }

  @override
  State<IldsScrollbar> createState() => _IldsScrollbarState();
}

class _IldsScrollbarState extends State<IldsScrollbar> {
  late final ScrollController _effectiveController;

  @override
  void initState() {
    super.initState();
    _effectiveController = widget.controller ?? ScrollController();
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _effectiveController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Radius thumbRadius = Radius.circular(ILDSTokens.borderRadiusFull);

    return Semantics(
      label: 'Scrollable content',
      child: ScrollbarTheme(
        data: ScrollbarThemeData(
          thumbColor: WidgetStateColor.resolveWith(IldsScrollbar._thumbColorFor),
          trackColor: WidgetStateProperty.all(ILDSTokens.neutral100),
          thickness: WidgetStateProperty.resolveWith(IldsScrollbar._thicknessFor),
          radius: thumbRadius,
          crossAxisMargin: ILDSTokens.spacing1,
          mainAxisMargin: ILDSTokens.spacing1,
          interactive: true,
        ),
        child: RawScrollbar(
          controller: _effectiveController,
          thumbVisibility: widget.thumbVisibility,
          trackVisibility: true,
          radius: thumbRadius,
          child: PrimaryScrollController(
            controller: _effectiveController,
            child: widget.child,
          ),
        ),
      ),
    );
  }
}
