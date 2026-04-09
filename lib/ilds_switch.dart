import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsSwitchSize { small, medium, large }

class IldsSwitch extends StatefulWidget {
  const IldsSwitch({
    super.key,
    required this.value,
    required this.onChanged,
    this.label,
    this.leadingIcon,
    this.showLabel = true,
    this.showIcon = false,
    this.size = IldsSwitchSize.medium,
    this.isDisabled = false,
  });

  final bool value;
  final ValueChanged<bool>? onChanged;
  final String? label;
  final IconData? leadingIcon;
  final bool showLabel;
  final bool showIcon;
  final IldsSwitchSize size;
  final bool isDisabled;

  @override
  State<IldsSwitch> createState() => _IldsSwitchState();
}

class _IldsSwitchState extends State<IldsSwitch> {
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  double _trackWidth() {
    switch (widget.size) {
      case IldsSwitchSize.small:
        return ILDSTokens.spacing8 + ILDSTokens.spacing1;
      case IldsSwitchSize.medium:
        return ILDSTokens.spacing10 + ILDSTokens.spacing1;
      case IldsSwitchSize.large:
        return ILDSTokens.spacing12 + ILDSTokens.spacing1;
    }
  }

  double _trackHeight() {
    switch (widget.size) {
      case IldsSwitchSize.small:
        return ILDSTokens.spacing5;
      case IldsSwitchSize.medium:
        return ILDSTokens.spacing6;
      case IldsSwitchSize.large:
        return ILDSTokens.spacing6 + ILDSTokens.spacing1;
    }
  }

  double _thumbSize() {
    switch (widget.size) {
      case IldsSwitchSize.small:
        return ILDSTokens.spacing4;
      case IldsSwitchSize.medium:
        return ILDSTokens.spacing5;
      case IldsSwitchSize.large:
        return ILDSTokens.spacing6;
    }
  }

  double _radius() => _trackHeight() / ILDSTokens.borderWidth2;

  double _padding() => ILDSTokens.spacing1;

  double _labelSize() {
    switch (widget.size) {
      case IldsSwitchSize.small:
        return ILDSTokens.spacing3;
      case IldsSwitchSize.medium:
        return ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
      case IldsSwitchSize.large:
        return ILDSTokens.spacing4;
    }
  }

  Color _trackColor() {
    if (widget.isDisabled) return widget.value ? ILDSTokens.orange200 : ILDSTokens.neutral100;
    if (_isPressed) return widget.value ? ILDSTokens.orange700 : ILDSTokens.neutral400;
    if (_isHovered) return widget.value ? ILDSTokens.orange600 : ILDSTokens.neutral300;
    return widget.value ? ILDSTokens.orange500 : ILDSTokens.neutral200;
  }

  Color _thumbColor() {
    if (widget.isDisabled && !widget.value) return ILDSTokens.neutral200;
    return ILDSTokens.white;
  }

  Color _labelColor() => widget.isDisabled ? ILDSTokens.neutral300 : ILDSTokens.neutral900;

  void _handleTap() {
    if (widget.isDisabled || widget.onChanged == null) return;
    widget.onChanged!(!widget.value);
  }

  @override
  Widget build(BuildContext context) {
    final double leftPosition = widget.value
        ? _trackWidth() - _thumbSize() - _padding()
        : _padding();

    final Widget switchControl = Container(
      padding: _isFocused ? EdgeInsets.all(ILDSTokens.borderWidth2) : EdgeInsets.zero,
      decoration: _isFocused
          ? BoxDecoration(
              borderRadius: BorderRadius.circular(_radius() + ILDSTokens.borderWidth2),
              border: Border.all(color: ILDSTokens.orange500, width: ILDSTokens.borderWidth2),
            )
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: _trackWidth(),
        height: _trackHeight(),
        decoration: BoxDecoration(
          color: _trackColor(),
          borderRadius: BorderRadius.circular(_radius()),
        ),
        child: Stack(
          children: [
            AnimatedPositioned(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              left: leftPosition,
              top: (_trackHeight() - _thumbSize()) / ILDSTokens.borderWidth2,
              child: Container(
                width: _thumbSize(),
                height: _thumbSize(),
                decoration: BoxDecoration(
                  color: _thumbColor(),
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
      ),
    );

    return Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: Semantics(
        toggled: widget.value,
        enabled: !widget.isDisabled,
        label: widget.label ?? 'Switch',
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
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.showIcon && widget.leadingIcon != null) ...[
                  Icon(widget.leadingIcon, color: _labelColor(), size: _labelSize()),
                  const SizedBox(width: ILDSTokens.spacing2),
                ],
                switchControl,
                if (widget.showLabel && widget.label != null) ...[
                  const SizedBox(width: ILDSTokens.spacing2),
                  Text(
                    widget.label!,
                    style: TextStyle(
                      fontSize: _labelSize(),
                      color: _labelColor(),
                      fontWeight: ILDSTokens.fontWeightRegular,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
