import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsSelectionButtonSize { small, medium, large }
enum IldsSelectionButtonVariant { labelOnly, labelWithSuffix, iconOnly }

class IldsSelectionButton extends StatefulWidget {
  const IldsSelectionButton({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.suffixIcon,
    this.variant = IldsSelectionButtonVariant.labelOnly,
    this.size = IldsSelectionButtonSize.medium,
    this.isDisabled = false,
  });

  final String label;
  final bool isSelected;
  final VoidCallback? onTap;
  final IconData? suffixIcon;
  final IldsSelectionButtonVariant variant;
  final IldsSelectionButtonSize size;
  final bool isDisabled;

  @override
  State<IldsSelectionButton> createState() => _IldsSelectionButtonState();
}

class _IldsSelectionButtonState extends State<IldsSelectionButton> {
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  double _height() {
    switch (widget.size) {
      case IldsSelectionButtonSize.small:
        return ILDSTokens.spacing8;
      case IldsSelectionButtonSize.medium:
        return ILDSTokens.spacing10;
      case IldsSelectionButtonSize.large:
        return ILDSTokens.spacing12;
    }
  }

  double _horizontalPadding() {
    switch (widget.size) {
      case IldsSelectionButtonSize.small:
        return ILDSTokens.spacing2;
      case IldsSelectionButtonSize.medium:
        return ILDSTokens.spacing3;
      case IldsSelectionButtonSize.large:
        return ILDSTokens.spacing4;
    }
  }

  double _fontSize() {
    switch (widget.size) {
      case IldsSelectionButtonSize.small:
        return ILDSTokens.spacing3;
      case IldsSelectionButtonSize.medium:
        return ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
      case IldsSelectionButtonSize.large:
        return ILDSTokens.spacing4;
    }
  }

  Color _backgroundColor() {
    if (widget.isDisabled) return ILDSTokens.neutral50;
    if (widget.isSelected) return ILDSTokens.orange50;
    if (_isPressed) return ILDSTokens.neutral100;
    if (_isHovered) return ILDSTokens.neutral50;
    return ILDSTokens.white;
  }

  Color _textColor() {
    if (widget.isDisabled) return ILDSTokens.neutral300;
    if (widget.isSelected || _isFocused) return ILDSTokens.orange500;
    if (_isPressed || _isHovered) return ILDSTokens.neutral900;
    return ILDSTokens.neutral600;
  }

  Color _borderColor() {
    if (widget.isDisabled) return ILDSTokens.neutral100;
    if (widget.isSelected || _isFocused) return ILDSTokens.orange500;
    if (_isPressed || _isHovered) return ILDSTokens.neutral300;
    return ILDSTokens.neutral200;
  }

  double _borderWidth() {
    if (widget.isSelected || _isFocused) return ILDSTokens.borderWidth2;
    return ILDSTokens.borderWidth1;
  }

  void _handleTap() {
    if (widget.isDisabled || widget.onTap == null) return;
    widget.onTap!();
  }

  @override
  Widget build(BuildContext context) {
    final bool iconOnly = widget.variant == IldsSelectionButtonVariant.iconOnly;

    return Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: Semantics(
        button: true,
        selected: widget.isSelected,
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
            onTap: _handleTap,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              height: _height(),
              padding: EdgeInsets.symmetric(horizontal: _horizontalPadding()),
              decoration: BoxDecoration(
                color: _backgroundColor(),
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                border: Border.all(color: _borderColor(), width: _borderWidth()),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (!iconOnly)
                    Text(
                      widget.label,
                      style: TextStyle(
                        fontSize: _fontSize(),
                        fontWeight: ILDSTokens.fontWeightMedium,
                        color: _textColor(),
                      ),
                    ),
                  if (widget.variant == IldsSelectionButtonVariant.labelWithSuffix &&
                      widget.suffixIcon != null) ...[
                    const SizedBox(width: ILDSTokens.spacing1),
                    Icon(widget.suffixIcon, size: _fontSize(), color: _textColor()),
                  ],
                  if (iconOnly)
                    Icon(
                      widget.suffixIcon ?? Icons.check,
                      size: _fontSize(),
                      color: _textColor(),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
