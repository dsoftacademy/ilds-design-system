import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

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
    return Semantics(
      label: 'Scrollable content',
      child: ScrollbarTheme(
        data: ScrollbarThemeData(
          thumbColor: WidgetStateProperty.all(ILDSTokens.neutral400),
          trackColor: WidgetStateProperty.all(ILDSTokens.neutral100),
          thickness: WidgetStateProperty.all(ILDSTokens.spacing1),
          radius: const Radius.circular(ILDSTokens.borderRadiusFull),
        ),
        child: RawScrollbar(
          controller: _effectiveController,
          thumbVisibility: widget.thumbVisibility,
          trackVisibility: true,
          radius: const Radius.circular(ILDSTokens.borderRadiusFull),
          thickness: ILDSTokens.spacing1,
          child: PrimaryScrollController(
            controller: _effectiveController,
            child: widget.child,
          ),
        ),
      ),
    );
  }
}
