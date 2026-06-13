// lib/components/ilds_chip.dart
import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsChipSize { large, medium }

enum IldsChipKind { filter, tag }

enum IldsChipTagVariant { neutral, success, warning, error, info }

class IldsChip extends StatelessWidget {
  final String label;
  final IldsChipSize size;
  final IldsChipKind kind;
  final IldsChipTagVariant tagVariant;
  final bool isSelected;
  final bool enabled;
  final bool showPrefixIcon;
  final IconData? prefixIcon;
  final Widget? avatar;
  final int? count;
  final bool showSuffixButton;
  final VoidCallback? onPressed;
  final VoidCallback? onRemoved;

  const IldsChip({
    super.key,
    required this.label,
    this.size = IldsChipSize.large,
    this.kind = IldsChipKind.filter,
    this.tagVariant = IldsChipTagVariant.neutral,
    this.isSelected = false,
    this.enabled = true,
    this.showPrefixIcon = false,
    this.prefixIcon,
    this.avatar,
    this.count,
    this.showSuffixButton = false,
    this.onPressed,
    this.onRemoved,
  });

  @override
  Widget build(BuildContext context) {
    final bool isLarge = size == IldsChipSize.large;
    // Figma: large=24px, medium=20px — verified chip.spec.json offsetHeight
    final double height = isLarge ? 24.0 : 20.0;
    // Figma: both sizes use 12px — verified chip.spec.json shared.font-size
    const double fontSize = 12.0;
    final double iconSize = isLarge ? 16.0 : 14.0;

    // Figma: large h-padding=8px, medium=4px — verified chip.spec.json shared.padding
    final EdgeInsets padding = EdgeInsets.symmetric(
      horizontal: isLarge ? ILDSTokens.spacing2 : ILDSTokens.spacing1,
    );

    // Filter chip colors — verified from chip.spec.json Figma values
    // Default: bg=#ffffff, border=#9e9e9e, label=#212121, weight=Regular
    // Selected: bg=#fff2ed (primaryOrange50), border=#e3530f (orange500), label=#212121, weight=Regular
    Color borderColor = isSelected ? ILDSTokens.orange500 : ILDSTokens.neutralCoolgray500;
    Color labelColor = ILDSTokens.neutralCoolgray900; // #212121 for both states
    Color bgColor = isSelected
        ? ILDSTokens.primaryOrange50    // #fff2ed — verified Figma 14018:6806
        : ILDSTokens.globalWhite000;    // #ffffff — verified Figma 14018:6787
    FontWeight fontWeight = ILDSTokens.fontWeightRegular; // Regular for both states

    // Tag variant colors (unchanged — not audited in this pass)
    if (kind == IldsChipKind.tag) {
      fontWeight = ILDSTokens.fontWeightMedium;
      switch (tagVariant) {
        case IldsChipTagVariant.success:
          bgColor = ILDSTokens.green50;
          borderColor = ILDSTokens.green50;
          labelColor = ILDSTokens.green600;
          break;
        case IldsChipTagVariant.warning:
          bgColor = ILDSTokens.amber50;
          borderColor = ILDSTokens.amber50;
          labelColor = ILDSTokens.amber600;
          break;
        case IldsChipTagVariant.error:
          bgColor = ILDSTokens.red50;
          borderColor = ILDSTokens.red50;
          labelColor = ILDSTokens.red600;
          break;
        case IldsChipTagVariant.info:
          bgColor = ILDSTokens.blue50;
          borderColor = ILDSTokens.blue50;
          labelColor = ILDSTokens.blue600;
          break;
        case IldsChipTagVariant.neutral:
          bgColor = ILDSTokens.neutral50;
          borderColor = ILDSTokens.neutral200;
          labelColor = ILDSTokens.neutral600;
          break;
      }
    }

    if (!enabled) {
      // Figma: bg=#eeeeee (coolgray-200), border=#e0e0e0 (coolgray-300), label=#9e9e9e (coolgray-500)
      // Verified from chip.spec.json large-disabled / medium-disabled
      borderColor = ILDSTokens.neutralCoolgray300;
      labelColor = ILDSTokens.neutralCoolgray500;
      bgColor = ILDSTokens.neutralCoolgray200;
    }

    return Semantics(
      button: kind == IldsChipKind.filter,
      label: '$label chip',
      selected: isSelected,
      enabled: enabled,
      child: GestureDetector(
        onTap: enabled ? onPressed : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          height: height,
          padding: padding,
          decoration: BoxDecoration(
            color: bgColor,
            // Figma: border-width=0.5px — no token, use literal
            border: Border.all(color: borderColor, width: 0.5),
            // Figma: border-radius=4px = radiusMedium — verified chip.spec.json shared.border-radius
            borderRadius: BorderRadius.circular(ILDSTokens.radiusMedium),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (avatar != null) ...[
                SizedBox(
                  width: height - ILDSTokens.spacing2,
                  height: height - ILDSTokens.spacing2,
                  child: ClipOval(child: avatar),
                ),
                const SizedBox(width: ILDSTokens.spacing1),
              ] else if (showPrefixIcon && prefixIcon != null) ...[
                Icon(prefixIcon, size: iconSize, color: labelColor),
                const SizedBox(width: ILDSTokens.spacing1),
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: fontSize,
                  color: labelColor,
                  fontWeight: fontWeight,
                  fontFamily: 'Mulish',
                ),
              ),
              if (count != null) ...[
                const SizedBox(width: ILDSTokens.spacing1),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: ILDSTokens.spacing1,
                    vertical: ILDSTokens.borderWidth1,
                  ),
                  decoration: BoxDecoration(
                    color: ILDSTokens.orange500,
                    borderRadius: BorderRadius.circular(ILDSTokens.radiusMassive),
                  ),
                  child: Text(
                    count.toString(),
                    style: TextStyle(
                      fontSize: fontSize - 2,
                      color: ILDSTokens.white,
                      fontWeight: ILDSTokens.fontWeightBold,
                      fontFamily: 'Mulish',
                    ),
                  ),
                ),
              ],
              if (showSuffixButton) ...[
                const SizedBox(width: ILDSTokens.spacing1),
                GestureDetector(
                  onTap: enabled ? onRemoved : null,
                  child: Icon(Icons.close, size: iconSize, color: labelColor),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
