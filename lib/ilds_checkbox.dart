import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsCheckboxSize { small, medium, large }
enum IldsCheckboxState { unchecked, checked, indeterminate }

class IldsCheckbox extends StatefulWidget {
  const IldsCheckbox({
    super.key,
    required this.state,
    required this.onChanged,
    this.label,
    this.size = IldsCheckboxSize.medium,
    this.isDisabled = false,
    this.hasError = false,
    this.errorText,
  });

  final IldsCheckboxState state;
  final ValueChanged<IldsCheckboxState>? onChanged;
  final String? label;
  final IldsCheckboxSize size;
  final bool isDisabled;
  final bool hasError;
  final String? errorText;

  @override
  State<IldsCheckbox> createState() => _IldsCheckboxState();
}

class _IldsCheckboxState extends State<IldsCheckbox> {
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  bool get _isChecked => widget.state == IldsCheckboxState.checked;
  bool get _isIndeterminate => widget.state == IldsCheckboxState.indeterminate;

  double _boxSize() {
    switch (widget.size) {
      case IldsCheckboxSize.small:
        return ILDSTokens.spacing4;
      case IldsCheckboxSize.medium:
        return ILDSTokens.spacing5;
      case IldsCheckboxSize.large:
        return ILDSTokens.spacing6;
    }
  }

  double _iconSize() {
    switch (widget.size) {
      case IldsCheckboxSize.small:
        return ILDSTokens.spacing5 / ILDSTokens.borderWidth2 - ILDSTokens.borderWidth2;
      case IldsCheckboxSize.medium:
        return ILDSTokens.spacing3;
      case IldsCheckboxSize.large:
        return ILDSTokens.spacing4 - ILDSTokens.borderWidth1;
    }
  }

  double _fontSize() {
    switch (widget.size) {
      case IldsCheckboxSize.small:
        return ILDSTokens.spacing3;
      case IldsCheckboxSize.medium:
        return ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
      case IldsCheckboxSize.large:
        return ILDSTokens.spacing4;
    }
  }

  double _radius() {
    switch (widget.size) {
      case IldsCheckboxSize.small:
        return ILDSTokens.borderRadiusXs;
      case IldsCheckboxSize.medium:
      case IldsCheckboxSize.large:
        return ILDSTokens.borderRadiusSm;
    }
  }

  Color _borderColor() {
    if (widget.isDisabled) return _isChecked || _isIndeterminate ? ILDSTokens.neutral300 : ILDSTokens.neutral200;
    if (widget.hasError) return ILDSTokens.red600;
    if (_isPressed) return ILDSTokens.orange700;
    if (_isHovered && (_isChecked || _isIndeterminate)) return ILDSTokens.orange600;
    if (_isHovered) return ILDSTokens.neutral400;
    if (_isChecked || _isIndeterminate || _isFocused) return ILDSTokens.orange500;
    return ILDSTokens.neutral300;
  }

  Color _fillColor() {
    if (widget.isDisabled) return _isChecked || _isIndeterminate ? ILDSTokens.neutral200 : ILDSTokens.neutral50;
    if (widget.hasError) return _isChecked || _isIndeterminate ? ILDSTokens.red600 : ILDSTokens.red50;
    if (_isPressed) return ILDSTokens.orange700;
    if (_isHovered && (_isChecked || _isIndeterminate)) return ILDSTokens.orange600;
    if (_isHovered && !(_isChecked || _isIndeterminate)) return ILDSTokens.neutral50;
    if (_isChecked || _isIndeterminate) return ILDSTokens.orange500;
    return ILDSTokens.white;
  }

  Color _iconColor() {
    if (widget.isDisabled && (_isChecked || _isIndeterminate)) return ILDSTokens.neutral400;
    return ILDSTokens.white;
  }

  double _borderWidth() {
    if (_isChecked || _isIndeterminate || _isPressed || _isFocused || widget.hasError) {
      return ILDSTokens.borderWidth2;
    }
    return ILDSTokens.borderWidth1;
  }

  IldsCheckboxState _nextState() {
    switch (widget.state) {
      case IldsCheckboxState.unchecked:
        return IldsCheckboxState.checked;
      case IldsCheckboxState.checked:
        return IldsCheckboxState.indeterminate;
      case IldsCheckboxState.indeterminate:
        return IldsCheckboxState.unchecked;
    }
  }

  void _handleTap() {
    if (widget.isDisabled || widget.onChanged == null) return;
    widget.onChanged!(_nextState());
  }

  @override
  Widget build(BuildContext context) {
    final Widget indicator = _isIndeterminate
        ? Container(
            width: _iconSize(),
            height: ILDSTokens.borderWidth2,
            color: _iconColor(),
          )
        : Icon(
            _isChecked ? Icons.check : null,
            size: _iconSize(),
            color: _iconColor(),
          );

    final Widget checkbox = Container(
      padding: _isFocused ? EdgeInsets.all(ILDSTokens.borderWidth2) : EdgeInsets.zero,
      decoration: _isFocused
          ? BoxDecoration(
              border: Border.all(color: ILDSTokens.orange500, width: ILDSTokens.borderWidth2),
              borderRadius: BorderRadius.circular(_radius() + ILDSTokens.borderWidth2),
            )
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: _boxSize(),
        height: _boxSize(),
        decoration: BoxDecoration(
          color: _fillColor(),
          borderRadius: BorderRadius.circular(_radius()),
          border: Border.all(color: _borderColor(), width: _borderWidth()),
        ),
        child: Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 150),
            child: (_isChecked || _isIndeterminate) ? indicator : const SizedBox.shrink(),
          ),
        ),
      ),
    );

    final Widget body = Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        checkbox,
        if (widget.label != null) ...[
          const SizedBox(width: ILDSTokens.spacing2),
          Flexible(
            child: Text(
              widget.label!,
              style: TextStyle(
                fontSize: _fontSize(),
                fontWeight: ILDSTokens.fontWeightRegular,
                color: widget.isDisabled ? ILDSTokens.neutral300 : ILDSTokens.neutral900,
              ),
            ),
          ),
        ],
      ],
    );

    return Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: Semantics(
        label: widget.label,
        checked: _isChecked,
        mixed: _isIndeterminate,
        enabled: !widget.isDisabled,
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                body,
                if (widget.hasError && widget.errorText != null) ...[
                  const SizedBox(height: ILDSTokens.spacing1),
                  Text(
                    widget.errorText!,
                    style: const TextStyle(
                      fontSize: ILDSTokens.spacing3,
                      color: ILDSTokens.red600,
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
