import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsTagSize { medium, large }

class IldsTag extends StatefulWidget {
  const IldsTag({
    super.key,
    required this.label,
    this.isActive = false,
    this.onTap,
    this.onRemove,
    this.prefixIcon,
    this.size = IldsTagSize.medium,
    this.isDisabled = false,
  });

  final String label;
  final bool isActive;
  final VoidCallback? onTap;
  final VoidCallback? onRemove;
  final IconData? prefixIcon;
  final IldsTagSize size;
  final bool isDisabled;

  @override
  State<IldsTag> createState() => _IldsTagState();
}

class _IldsTagState extends State<IldsTag> {
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  double _height() => widget.size == IldsTagSize.medium ? ILDSTokens.spacing8 : ILDSTokens.spacing10;
  double _fontSize() =>
      widget.size == IldsTagSize.medium ? ILDSTokens.spacing3 + ILDSTokens.borderWidth1 : ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
  double _horizontalPadding() => widget.size == IldsTagSize.medium ? ILDSTokens.spacing2 : ILDSTokens.spacing3;

  Color _bgColor() {
    if (widget.isDisabled) return ILDSTokens.neutral50;
    if (widget.isActive) return ILDSTokens.orange50;
    if (_isPressed) return ILDSTokens.neutral100;
    if (_isHovered) return ILDSTokens.neutral50;
    return ILDSTokens.white;
  }

  Color _borderColor() {
    if (widget.isDisabled) return ILDSTokens.neutral100;
    if (widget.isActive || _isFocused) return ILDSTokens.orange500;
    if (_isPressed || _isHovered) return ILDSTokens.neutral300;
    return ILDSTokens.neutral200;
  }

  double _borderWidth() {
    if (widget.isActive || _isFocused) return ILDSTokens.borderWidth2;
    return ILDSTokens.borderWidth1;
  }

  Color _textColor() {
    if (widget.isDisabled) return ILDSTokens.neutral300;
    if (widget.isActive || _isFocused) return ILDSTokens.orange600;
    if (_isHovered || _isPressed) return ILDSTokens.neutral900;
    return ILDSTokens.neutral600;
  }

  void _tapMain() {
    if (widget.isDisabled || widget.onTap == null) return;
    widget.onTap!();
  }

  @override
  Widget build(BuildContext context) {
    return Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: Semantics(
        button: true,
        selected: widget.isActive,
        enabled: !widget.isDisabled,
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
            onTap: _tapMain,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              height: _height(),
              padding: EdgeInsets.symmetric(horizontal: _horizontalPadding()),
              decoration: BoxDecoration(
                color: _bgColor(),
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusFull),
                border: Border.all(color: _borderColor(), width: _borderWidth()),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.prefixIcon != null) ...[
                    Icon(widget.prefixIcon, size: _fontSize(), color: _textColor()),
                    const SizedBox(width: ILDSTokens.spacing1),
                  ],
                  Text(
                    widget.label,
                    style: TextStyle(
                      fontSize: _fontSize(),
                      color: _textColor(),
                      fontWeight: ILDSTokens.fontWeightMedium,
                    ),
                  ),
                  if (widget.onRemove != null) ...[
                    const SizedBox(width: ILDSTokens.spacing1),
                    GestureDetector(
                      onTap: widget.isDisabled ? null : widget.onRemove,
                      child: Icon(Icons.close, size: _fontSize(), color: _textColor()),
                    ),
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
