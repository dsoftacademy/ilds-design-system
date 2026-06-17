import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';
import 'ilds_button.dart';

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
  final String? sectionLabel;
  final bool showMenuFooter;
  final String menuSecondaryLabel;
  final String menuPrimaryLabel;
  final VoidCallback? onMenuSecondary;
  final VoidCallback? onMenuPrimary;

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
    this.sectionLabel = 'Section Label',
    this.showMenuFooter = true,
    this.menuSecondaryLabel = 'Secondary button',
    this.menuPrimaryLabel = 'Primary button',
    this.onMenuSecondary,
    this.onMenuPrimary,
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
    return Material(
      elevation: 4,
      color: ILDSTokens.white,
      borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
      child: Container(
        padding: const EdgeInsets.all(ILDSTokens.spacing2),
        decoration: BoxDecoration(
          color: ILDSTokens.white,
          borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
          border: Border.all(color: ILDSTokens.neutralCoolgray200),
          boxShadow: const [
            BoxShadow(
              color: Color(0xFFBDBDBD),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (widget.sectionLabel != null && widget.sectionLabel!.isNotEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: ILDSTokens.spacing2,
                  vertical: ILDSTokens.spacing3,
                ),
                decoration: BoxDecoration(
                  color: ILDSTokens.neutralCoolgray100,
                  borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                ),
                child: Text(
                  widget.sectionLabel!,
                  style: const TextStyle(
                    fontFamily: 'Mulish',
                    fontSize: ILDSTokens.fontSize14,
                    fontWeight: ILDSTokens.fontWeightBold,
                    color: ILDSTokens.neutralCoolgray800,
                    height: 18 / 14,
                  ),
                ),
              ),
            for (int index = 0; index < widget.options.length; index++) ...[
              _buildMenuRow(widget.options[index]),
              if (index < widget.options.length - 1)
                const Divider(
                  height: 1,
                  thickness: 1,
                  color: ILDSTokens.neutralCoolgray200,
                ),
            ],
            if (widget.showMenuFooter) ...[
              const SizedBox(height: ILDSTokens.spacing3),
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  ILDSTokens.spacing2,
                  ILDSTokens.spacing3,
                  ILDSTokens.spacing2,
                  ILDSTokens.spacing1 + ILDSTokens.borderWidth2,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: IldsButton(
                        label: widget.menuSecondaryLabel,
                        type: IldsButtonType.secondary,
                        size: IldsButtonSize.medium,
                        onPressed: widget.onMenuSecondary ?? _removeOverlay,
                      ),
                    ),
                    const SizedBox(width: ILDSTokens.spacing3),
                    Expanded(
                      child: IldsButton(
                        label: widget.menuPrimaryLabel,
                        type: IldsButtonType.primary,
                        size: IldsButtonSize.medium,
                        onPressed: widget.onMenuPrimary ?? _removeOverlay,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildMenuRow(IldsDropdownOption option) {
    final bool isSelected = option.value == widget.selectedValue;
    final bool isDisabled = option.disabled;
    final Color textColor = isDisabled
        ? ILDSTokens.neutralCoolgray300
        : (isSelected ? ILDSTokens.orange500 : ILDSTokens.neutralCoolgray800);

    return Semantics(
      button: true,
      enabled: !isDisabled,
      selected: isSelected,
      label: option.label,
      child: InkWell(
        onTap: isDisabled ? null : () => _onOptionSelected(option),
        hoverColor: ILDSTokens.neutralCoolgray50,
        child: Container(
          color: isSelected ? ILDSTokens.orange50 : null,
          padding: const EdgeInsets.symmetric(
            horizontal: ILDSTokens.spacing2,
            vertical: ILDSTokens.spacing3,
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _DropdownMenuRadioIcon(isSelected: isSelected && !isDisabled),
              const SizedBox(width: ILDSTokens.spacing2),
              Expanded(
                child: Text(
                  option.label,
                  style: TextStyle(
                    fontFamily: 'Mulish',
                    fontSize: ILDSTokens.fontSize14,
                    fontWeight: isSelected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightRegular,
                    color: textColor,
                    height: 1.6,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool hasError = widget.errorText != null;
    final bool isDisabled = !widget.enabled;
    final IldsDropdownOption? selected = _selectedOption;

    Color borderColor = ILDSTokens.neutralCoolgray500;
    double borderWidth = ILDSTokens.borderWidth1;
    Color fillColor = ILDSTokens.white;
    Color textColor = selected == null ? ILDSTokens.neutralCoolgray500 : ILDSTokens.neutralCoolgray800;
    Color iconColor = ILDSTokens.neutralCoolgray500;

    if (isDisabled) {
      borderColor = ILDSTokens.neutralCoolgray300;
      fillColor = ILDSTokens.neutralCoolgray200;
      textColor = ILDSTokens.neutralCoolgray500;
      iconColor = ILDSTokens.neutralCoolgray500;
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
    final Color bottomTextColor = hasError ? ILDSTokens.red600 : ILDSTokens.neutralCoolgray700;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            fontFamily: 'Mulish',
            fontSize: 16,
            fontWeight: ILDSTokens.fontWeightBold,
            color: ILDSTokens.neutral600,
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
                      const SizedBox(
                        width: ILDSTokens.spacing5,
                        height: ILDSTokens.spacing5,
                        child: CircularProgressIndicator(
                          strokeWidth: ILDSTokens.borderWidth2,
                          color: ILDSTokens.orange500,
                        ),
                      )
                    else
                      AnimatedRotation(
                        turns: _isOpen ? 0.5 : 0,
                        duration: const Duration(milliseconds: 150),
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

class _DropdownMenuRadioIcon extends StatelessWidget {
  const _DropdownMenuRadioIcon({required this.isSelected});

  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: ILDSTokens.spacing5,
      height: ILDSTokens.spacing5,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: ILDSTokens.spacing5,
            height: ILDSTokens.spacing5,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? ILDSTokens.orange500 : ILDSTokens.neutralCoolgray500,
                width: 1.5,
              ),
            ),
          ),
          if (isSelected)
            Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: ILDSTokens.orange500,
              ),
            ),
        ],
      ),
    );
  }
}
