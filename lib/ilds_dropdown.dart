import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsDropdownSize { large, medium }

class IldsDropdownOption {
  final String label;
  final String value;
  final bool disabled;

  const IldsDropdownOption({
    required this.label,
    required this.value,
    this.disabled = false,
  });
}

class IldsDropdown extends StatefulWidget {
  final String label;
  final String placeholder;
  final List<IldsDropdownOption> options;
  final String? selectedValue;
  final ValueChanged<String?>? onChanged;
  final bool enabled;
  final bool isLoading;
  final String? errorText;
  final String? helperText;
  final IldsDropdownSize size;

  const IldsDropdown({
    super.key,
    required this.label,
    required this.placeholder,
    required this.options,
    this.selectedValue,
    this.onChanged,
    this.enabled = true,
    this.isLoading = false,
    this.errorText,
    this.helperText,
    this.size = IldsDropdownSize.large,
  });

  @override
  State<IldsDropdown> createState() => _IldsDropdownState();
}

class _IldsDropdownState extends State<IldsDropdown> {
  final LayerLink _layerLink = LayerLink();
  final GlobalKey _targetKey = GlobalKey();
  OverlayEntry? _overlayEntry;
  bool _isOpen = false;

  double get _triggerHeight =>
      widget.size == IldsDropdownSize.large ? ILDSTokens.spacing12 : ILDSTokens.spacing10;

  double get _optionRowHeight =>
      widget.size == IldsDropdownSize.large ? ILDSTokens.spacing12 : ILDSTokens.spacing10;

  double get _fontSize => widget.size == IldsDropdownSize.large ? 14 : 12;

  IldsDropdownOption? get _selectedOption {
    if (widget.selectedValue == null) return null;
    for (final IldsDropdownOption option in widget.options) {
      if (option.value == widget.selectedValue) return option;
    }
    return null;
  }

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant IldsDropdown oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!widget.enabled || widget.isLoading) {
      _removeOverlay();
    }
  }

  void _toggleDropdown() {
    if (!widget.enabled || widget.isLoading) return;
    if (_isOpen) {
      _removeOverlay();
    } else {
      _showOverlay();
    }
  }

  void _showOverlay() {
    if (_overlayEntry != null) return;
    final BuildContext? targetContext = _targetKey.currentContext;
    if (targetContext == null) return;
    final RenderBox renderBox = targetContext.findRenderObject()! as RenderBox;
    final Size size = renderBox.size;

    _overlayEntry = OverlayEntry(
      builder: (BuildContext context) {
        return Stack(
          children: [
            Positioned.fill(
              child: GestureDetector(
                behavior: HitTestBehavior.translucent,
                onTap: _removeOverlay,
              ),
            ),
            CompositedTransformFollower(
              link: _layerLink,
              showWhenUnlinked: false,
              offset: Offset(0, _triggerHeight),
              child: Material(
                color: Colors.transparent,
                child: SizedBox(
                  width: size.width,
                  child: _buildOptionsPanel(),
                ),
              ),
            ),
          ],
        );
      },
    );

    Overlay.of(context).insert(_overlayEntry!);
    setState(() => _isOpen = true);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
    if (mounted && _isOpen) {
      setState(() => _isOpen = false);
    } else {
      _isOpen = false;
    }
  }

  void _onOptionSelected(IldsDropdownOption option) {
    if (option.disabled) return;
    widget.onChanged?.call(option.value);
    _removeOverlay();
  }

  Widget _buildOptionsPanel() {
    final int visibleCount = widget.options.length > 5 ? 5 : widget.options.length;
    final double maxHeight = _optionRowHeight * visibleCount;
    return Material(
      elevation: 4, // TODO: add shadow elevation token to ILDSTokens.
      color: ILDSTokens.white,
      borderRadius: const BorderRadius.only(
        bottomLeft: Radius.circular(ILDSTokens.borderRadiusMd),
        bottomRight: Radius.circular(ILDSTokens.borderRadiusMd),
      ),
      child: Container(
        constraints: BoxConstraints(maxHeight: maxHeight),
        decoration: const BoxDecoration(
          color: ILDSTokens.white,
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(ILDSTokens.borderRadiusMd),
            bottomRight: Radius.circular(ILDSTokens.borderRadiusMd),
          ),
          border: Border(
            left: BorderSide(color: ILDSTokens.orange500, width: ILDSTokens.borderWidth2),
            right: BorderSide(color: ILDSTokens.orange500, width: ILDSTokens.borderWidth2),
            bottom: BorderSide(color: ILDSTokens.orange500, width: ILDSTokens.borderWidth2),
          ),
        ),
        child: ListView.builder(
          padding: EdgeInsets.zero,
          shrinkWrap: true,
          itemCount: widget.options.length,
          itemBuilder: (BuildContext context, int index) {
            final IldsDropdownOption option = widget.options[index];
            final bool isSelected = option.value == widget.selectedValue;
            final bool isDisabled = option.disabled;
            final Color textColor = isDisabled
                ? ILDSTokens.neutral300
                : (isSelected ? ILDSTokens.orange500 : ILDSTokens.neutral900);
            final FontWeight weight =
                isSelected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightRegular;

            return Semantics(
              button: true,
              enabled: !isDisabled,
              selected: isSelected,
              label: option.label,
              child: InkWell(
                onTap: isDisabled ? null : () => _onOptionSelected(option),
                hoverColor: ILDSTokens.neutral50,
                focusColor: ILDSTokens.neutral50,
                highlightColor: ILDSTokens.neutral50,
                child: Container(
                  height: _optionRowHeight,
                  padding: const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing4),
                  color: isSelected ? ILDSTokens.orange50 : null,
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          option.label,
                          style: TextStyle(
                            fontFamily: 'Mulish',
                            fontSize: _fontSize,
                            fontWeight: weight,
                            color: textColor,
                          ),
                        ),
                      ),
                      if (isSelected)
                        const Icon(
                          Icons.check,
                          color: ILDSTokens.orange500,
                          size: ILDSTokens.spacing5,
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool hasError = widget.errorText != null;
    final bool isDisabled = !widget.enabled;
    final IldsDropdownOption? selected = _selectedOption;

    Color borderColor = ILDSTokens.neutral200;
    double borderWidth = ILDSTokens.borderWidth1;
    Color fillColor = ILDSTokens.white;
    Color textColor = selected == null ? ILDSTokens.neutral300 : ILDSTokens.neutral900;
    Color iconColor = ILDSTokens.neutral400;

    if (isDisabled) {
      borderColor = ILDSTokens.neutral300;
      fillColor = ILDSTokens.neutral100;
      textColor = ILDSTokens.neutral300;
      iconColor = ILDSTokens.neutral300;
    } else if (hasError) {
      borderColor = ILDSTokens.red600;
      borderWidth = _isOpen ? ILDSTokens.borderWidth2 : ILDSTokens.borderWidth1;
      iconColor = ILDSTokens.red600;
    } else if (_isOpen) {
      borderColor = ILDSTokens.orange500;
      borderWidth = ILDSTokens.borderWidth2;
      iconColor = ILDSTokens.orange500;
    }

    final String? bottomText = hasError ? widget.errorText : widget.helperText;
    final Color bottomTextColor = hasError ? ILDSTokens.red600 : ILDSTokens.neutral400;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            fontFamily: 'Mulish',
            fontSize: 12,
            fontWeight: ILDSTokens.fontWeightMedium,
            color: ILDSTokens.neutral500,
          ),
        ),
        SizedBox(height: ILDSTokens.spacing1),
        CompositedTransformTarget(
          link: _layerLink,
          child: Semantics(
            label: widget.label,
            hint: widget.placeholder,
            button: true,
            enabled: widget.enabled && !widget.isLoading,
            expanded: _isOpen,
            child: GestureDetector(
              key: _targetKey,
              behavior: HitTestBehavior.opaque,
              onTap: _toggleDropdown,
              child: Container(
                height: _triggerHeight,
                decoration: BoxDecoration(
                  color: fillColor,
                  borderRadius: BorderRadius.only(
                    topLeft: const Radius.circular(ILDSTokens.borderRadiusMd),
                    topRight: const Radius.circular(ILDSTokens.borderRadiusMd),
                    bottomLeft: Radius.circular(_isOpen ? 0 : ILDSTokens.borderRadiusMd),
                    bottomRight: Radius.circular(_isOpen ? 0 : ILDSTokens.borderRadiusMd),
                  ),
                  border: _isOpen
                      ? Border(
                          top: BorderSide(color: borderColor, width: borderWidth),
                          left: BorderSide(color: borderColor, width: borderWidth),
                          right: BorderSide(color: borderColor, width: borderWidth),
                        )
                      : Border.all(color: borderColor, width: borderWidth),
                ),
                padding: const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing4),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        selected?.label ?? widget.placeholder,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: 'Mulish',
                          fontSize: _fontSize,
                          fontWeight: ILDSTokens.fontWeightRegular,
                          color: textColor,
                        ),
                      ),
                    ),
                    if (widget.isLoading)
                      SizedBox(
                        width: ILDSTokens.spacing5,
                        height: ILDSTokens.spacing5,
                        child: const CircularProgressIndicator(
                          strokeWidth: ILDSTokens.borderWidth2,
                          color: ILDSTokens.orange500,
                        ),
                      )
                    else
                      AnimatedRotation(
                        turns: _isOpen ? 0.5 : 0,
                        duration: const Duration(milliseconds: 150), // TODO: add motion duration token to ILDSTokens.
                        child: Icon(
                          Icons.keyboard_arrow_down,
                          color: iconColor,
                          size: ILDSTokens.spacing5,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
        if (bottomText != null) ...[
          SizedBox(height: ILDSTokens.spacing1),
          Text(
            bottomText,
            style: TextStyle(
              fontFamily: 'Mulish',
              fontSize: 12,
              fontWeight: ILDSTokens.fontWeightRegular,
              color: bottomTextColor,
            ),
          ),
        ],
      ],
    );
  }
}
