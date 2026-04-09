import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsRadioSize { small, medium, large }

class IldsRadio extends StatefulWidget {
  const IldsRadio({
    super.key,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    this.label,
    this.size = IldsRadioSize.medium,
    this.isDisabled = false,
    this.hasError = false,
    this.errorText,
  });

  final dynamic value;
  final dynamic groupValue;
  final ValueChanged<dynamic>? onChanged;
  final String? label;
  final IldsRadioSize size;
  final bool isDisabled;
  final bool hasError;
  final String? errorText;

  @override
  State<IldsRadio> createState() => _IldsRadioState();
}

class _IldsRadioState extends State<IldsRadio> {
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  bool get _isSelected => widget.value == widget.groupValue;

  double _outerSize() {
    switch (widget.size) {
      case IldsRadioSize.small:
        return ILDSTokens.spacing4;
      case IldsRadioSize.medium:
        return ILDSTokens.spacing5;
      case IldsRadioSize.large:
        return ILDSTokens.spacing6;
    }
  }

  double _innerSize() {
    switch (widget.size) {
      case IldsRadioSize.small:
        return ILDSTokens.spacing2;
      case IldsRadioSize.medium:
        return ILDSTokens.spacing5 / ILDSTokens.borderWidth2;
      case IldsRadioSize.large:
        return ILDSTokens.spacing3;
    }
  }

  double _fontSize() {
    switch (widget.size) {
      case IldsRadioSize.small:
        return ILDSTokens.spacing3;
      case IldsRadioSize.medium:
        return ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
      case IldsRadioSize.large:
        return ILDSTokens.spacing4;
    }
  }

  Color _borderColor() {
    if (widget.isDisabled) {
      return _isSelected ? ILDSTokens.neutral300 : ILDSTokens.neutral200;
    }
    if (widget.hasError) {
      return ILDSTokens.red600;
    }
    if (_isPressed) {
      return ILDSTokens.orange700;
    }
    if (_isHovered && _isSelected) {
      return ILDSTokens.orange600;
    }
    if (_isHovered && !_isSelected) {
      return ILDSTokens.neutral400;
    }
    if (_isSelected || _isFocused) {
      return ILDSTokens.orange500;
    }
    return ILDSTokens.neutral300;
  }

  Color _backgroundColor() {
    if (widget.isDisabled) return ILDSTokens.neutral50;
    if (widget.hasError) return ILDSTokens.red50;
    if (_isPressed) return ILDSTokens.orange100;
    if (_isHovered && _isSelected) return ILDSTokens.orange50;
    if (_isHovered && !_isSelected) return ILDSTokens.neutral50;
    return ILDSTokens.white;
  }

  Color _dotColor() {
    if (widget.isDisabled) return ILDSTokens.neutral300;
    if (widget.hasError) return ILDSTokens.red600;
    if (_isPressed) return ILDSTokens.orange700;
    if (_isHovered && _isSelected) return ILDSTokens.orange600;
    return ILDSTokens.orange500;
  }

  double _borderWidth() {
    if (_isSelected || _isPressed || _isFocused || widget.hasError) {
      return ILDSTokens.borderWidth2;
    }
    return ILDSTokens.borderWidth1;
  }

  void _handleTap() {
    if (widget.isDisabled || widget.onChanged == null) return;
    widget.onChanged!(widget.value);
  }

  @override
  Widget build(BuildContext context) {
    final Widget radioVisual = Container(
      padding: _isFocused ? EdgeInsets.all(ILDSTokens.borderWidth2) : EdgeInsets.zero,
      decoration: _isFocused
          ? BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: ILDSTokens.orange500,
                width: ILDSTokens.borderWidth2,
              ),
            )
          : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        width: _outerSize(),
        height: _outerSize(),
        decoration: BoxDecoration(
          color: _backgroundColor(),
          shape: BoxShape.circle,
          border: Border.all(color: _borderColor(), width: _borderWidth()),
        ),
        child: Center(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            width: _isSelected ? _innerSize() : 0,
            height: _isSelected ? _innerSize() : 0,
            decoration: BoxDecoration(
              color: _isSelected ? _dotColor() : Colors.transparent,
              shape: BoxShape.circle,
            ),
          ),
        ),
      ),
    );

    final Widget body = Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        radioVisual,
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

    final Widget main = MouseRegion(
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
        child: body,
      ),
    );

    return Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: Semantics(
        label: widget.label ?? widget.value.toString(),
        inMutuallyExclusiveGroup: true,
        checked: _isSelected,
        enabled: !widget.isDisabled,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            main,
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
    );
  }
}

class IldsRadioOption {
  const IldsRadioOption({
    required this.value,
    required this.label,
    this.isDisabled = false,
  });

  final dynamic value;
  final String label;
  final bool isDisabled;
}

class IldsRadioGroup extends StatelessWidget {
  const IldsRadioGroup({
    super.key,
    required this.options,
    required this.groupValue,
    required this.onChanged,
    this.orientation = Axis.vertical,
    this.size = IldsRadioSize.medium,
    this.isDisabled = false,
    this.hasError = false,
    this.errorText,
  });

  final List<IldsRadioOption> options;
  final dynamic groupValue;
  final ValueChanged<dynamic>? onChanged;
  final Axis orientation;
  final IldsRadioSize size;
  final bool isDisabled;
  final bool hasError;
  final String? errorText;

  @override
  Widget build(BuildContext context) {
    final List<Widget> items = options
        .map(
          (option) => IldsRadio(
            value: option.value,
            groupValue: groupValue,
            onChanged: onChanged,
            label: option.label,
            size: size,
            isDisabled: isDisabled || option.isDisabled,
            hasError: hasError,
          ),
        )
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        orientation == Axis.vertical
            ? Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: items
                    .expand((item) => [item, const SizedBox(height: ILDSTokens.spacing2)])
                    .toList()
                  ..removeLast(),
              )
            : Wrap(
                spacing: ILDSTokens.spacing4,
                runSpacing: ILDSTokens.spacing2,
                children: items,
              ),
        if (hasError && errorText != null) ...[
          const SizedBox(height: ILDSTokens.spacing1),
          Text(
            errorText!,
            style: const TextStyle(
              fontSize: ILDSTokens.spacing3,
              color: ILDSTokens.red600,
              fontWeight: ILDSTokens.fontWeightRegular,
            ),
          ),
        ],
      ],
    );
  }
}
