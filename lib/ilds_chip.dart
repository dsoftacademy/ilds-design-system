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
    final double height = isLarge ? 36.0 : 28.0;
    final double fontSize = isLarge ? 14.0 : 12.0;
    final double iconSize = isLarge ? 16.0 : 14.0;
    
    final EdgeInsets padding = EdgeInsets.symmetric(
      horizontal: isLarge ? ILDSTokens.spacing3 : ILDSTokens.spacing2,
    );

    // Filter Logic Colors
    Color borderColor = isSelected ? ILDSTokens.orange500 : ILDSTokens.neutral200;
    Color labelColor = isSelected ? ILDSTokens.orange500 : ILDSTokens.neutral500;
    Color bgColor = isSelected
        ? ILDSTokens.orange500.withValues(alpha: 0.08)
        : Colors.transparent;
    FontWeight fontWeight = isSelected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightRegular;

    // Tag Variant Logic Colors
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
      borderColor = ILDSTokens.neutral300;
      labelColor = ILDSTokens.neutral300;
      bgColor = Colors.transparent;
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
            border: Border.all(color: borderColor, width: ILDSTokens.borderWidth1),
            borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusFull),
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
                    borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusFull),
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