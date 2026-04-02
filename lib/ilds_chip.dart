import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

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

  @override
  Widget build(BuildContext context) {
    final bool isLarge = size == IldsChipSize.large;
    final double height = isLarge ? 36.0 : 28.0;
    final double fontSize = isLarge ? 14.0 : 12.0;
    final EdgeInsets padding = EdgeInsets.symmetric(
      horizontal: isLarge ? ILDSTokens.spacing3 : ILDSTokens.spacing2,
    );

    // Token: color.orange.500 (selected) | color.neutral.200 (default border)
    Color borderColor = isSelected ? ILDSTokens.orange500 : ILDSTokens.neutral200;
    // Token: color.orange.500 (selected) | color.neutral.500 (default label)
    Color labelColor  = isSelected ? ILDSTokens.orange500 : ILDSTokens.neutral500;
    // Token: color.orange.500 @ opacity.10 (selected bg) | transparent (default)
    Color bgColor = isSelected
        ? ILDSTokens.orange500.withOpacity(0.08)
        : Colors.transparent;

    if (!enabled) {
      // Token: color.neutral.300 — disabled text / placeholder
      borderColor = ILDSTokens.neutral300;
      labelColor  = ILDSTokens.neutral300;
      bgColor     = Colors.transparent;
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
          // Token: borderRadius.full — pill / chip shape
          borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusFull),
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
                // Token: fontWeight.bold (selected) | fontWeight.regular (default)
                fontWeight: isSelected
                    ? ILDSTokens.fontWeightBold
                    : ILDSTokens.fontWeightRegular,
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
