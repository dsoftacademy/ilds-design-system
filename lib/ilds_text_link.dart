import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsTextLinkSize { small, medium, large }
enum IldsTextLinkColour { defaultBlue, white }

class IldsTextLink extends StatefulWidget {
  const IldsTextLink({
    super.key,
    required this.label,
    required this.onTap,
    this.size = IldsTextLinkSize.medium,
    this.colour = IldsTextLinkColour.defaultBlue,
    this.isVisited = false,
    this.isDisabled = false,
    this.prefixIcon,
    this.suffixIcon,
  });

  final String label;
  final VoidCallback? onTap;
  final IldsTextLinkSize size;
  final IldsTextLinkColour colour;
  final bool isVisited;
  final bool isDisabled;
  final IconData? prefixIcon;
  final IconData? suffixIcon;

  @override
  State<IldsTextLink> createState() => _IldsTextLinkState();
}

class _IldsTextLinkState extends State<IldsTextLink> {
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  double _fontSize() {
    switch (widget.size) {
      case IldsTextLinkSize.small:
        return ILDSTokens.spacing3;
      case IldsTextLinkSize.medium:
        return ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
      case IldsTextLinkSize.large:
        return ILDSTokens.spacing4;
    }
  }

  Color _resolveColor() {
    if (widget.colour == IldsTextLinkColour.defaultBlue) {
      if (widget.isDisabled) return ILDSTokens.neutral300;
      if (widget.isVisited) return ILDSTokens.neutral500;
      if (_isPressed) return ILDSTokens.blue700;
      if (_isHovered) return ILDSTokens.blue600;
      return ILDSTokens.blue500;
    }

    if (widget.isDisabled) return ILDSTokens.neutral400;
    if (widget.isVisited) return ILDSTokens.neutral300;
    if (_isPressed) return ILDSTokens.neutral300;
    if (_isHovered) return ILDSTokens.neutral200;
    return ILDSTokens.white;
  }

  void _handleTap() {
    if (widget.isDisabled || widget.onTap == null) return;
    widget.onTap!();
  }

  @override
  Widget build(BuildContext context) {
    final Color c = _resolveColor();
    return Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: Semantics(
        button: true,
        enabled: !widget.isDisabled,
        link: true,
        label: widget.label,
        child: MouseRegion(
          onEnter: (_) => setState(() => _isHovered = true),
          onExit: (_) => setState(() {
            _isHovered = false;
            _isPressed = false;
          }),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: widget.isDisabled ? null : (_) => setState(() => _isPressed = true),
            onTapUp: widget.isDisabled ? null : (_) => setState(() => _isPressed = false),
            onTapCancel: widget.isDisabled ? null : () => setState(() => _isPressed = false),
            onTap: _handleTap,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              padding: _isFocused ? const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing1) : EdgeInsets.zero,
              decoration: _isFocused
                  ? BoxDecoration(
                      border: Border.all(
                        color: widget.colour == IldsTextLinkColour.defaultBlue ? ILDSTokens.blue500 : ILDSTokens.white,
                        width: ILDSTokens.borderWidth2,
                      ),
                      borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusSm),
                    )
                  : null,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.prefixIcon != null) ...[
                    Icon(widget.prefixIcon, size: _fontSize(), color: c),
                    const SizedBox(width: ILDSTokens.spacing1),
                  ],
                  Text(
                    widget.label,
                    style: TextStyle(
                      fontSize: _fontSize(),
                      color: c,
                      fontWeight: ILDSTokens.fontWeightMedium,
                      decoration: widget.isDisabled ? TextDecoration.none : TextDecoration.underline,
                    ),
                  ),
                  if (widget.suffixIcon != null) ...[
                    const SizedBox(width: ILDSTokens.spacing1),
                    Icon(widget.suffixIcon, size: _fontSize(), color: c),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
