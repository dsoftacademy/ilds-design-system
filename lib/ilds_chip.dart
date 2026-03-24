import 'package:flutter/material.dart';

enum IldsChipSize { large, medium }

class IldsChip extends StatelessWidget {
  final String label;
  final IldsChipSize size;
  final bool isSelected;
  final bool enabled;
  final bool showPrefixIcon;
  final IconData? prefixIcon;
  final bool showSuffixButton;
  final VoidCallback? onPressed;
  final VoidCallback? onRemoved;

  const IldsChip({
    super.key,
    required this.label,
    this.size = IldsChipSize.large,
    this.isSelected = false,
    this.enabled = true,
    this.showPrefixIcon = false,
    this.prefixIcon,
    this.showSuffixButton = false,
    this.onPressed,
    this.onRemoved,
  });

  static const Color _primaryOrange = Color(0xFFEB440C);
  static const Color _disabledGrey = Color(0xFFADADAD);
  static const Color _borderDefault = Color(0xFFE0E0E0);
  static const Color _labelDefault = Color(0xFF424242);

  @override
  Widget build(BuildContext context) {
    final bool isLarge = size == IldsChipSize.large;
    final double height = isLarge ? 36.0 : 28.0;
    final double fontSize = isLarge ? 14.0 : 12.0;
    final EdgeInsets padding = EdgeInsets.symmetric(
      horizontal: isLarge ? 12.0 : 8.0,
    );

    Color borderColor = isSelected ? _primaryOrange : _borderDefault;
    Color labelColor = isSelected ? _primaryOrange : _labelDefault;
    Color bgColor = isSelected
        ? _primaryOrange.withOpacity(0.08)
        : Colors.transparent;

    if (!enabled) {
      borderColor = _disabledGrey;
      labelColor = _disabledGrey;
      bgColor = Colors.transparent;
    }

    return GestureDetector(
      onTap: enabled ? onPressed : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        height: height,
        padding: padding,
        decoration: BoxDecoration(
          color: bgColor,
          border: Border.all(color: borderColor),
          borderRadius: BorderRadius.circular(height / 2),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (showPrefixIcon && prefixIcon != null) ...[
              Icon(prefixIcon, size: fontSize + 2, color: labelColor),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: fontSize,
                color: labelColor,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
            if (showSuffixButton) ...[
              const SizedBox(width: 4),
              GestureDetector(
                onTap: enabled ? onRemoved : null,
                child: Icon(Icons.close, size: fontSize, color: labelColor),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
