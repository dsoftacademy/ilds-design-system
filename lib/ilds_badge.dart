import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsBadgeVariant { subtle, intense, success, error, warning, info, skeleton }
enum IldsBadgeSize { small, medium, large }

class IldsBadge extends StatelessWidget {
  const IldsBadge({
    super.key,
    required this.label,
    this.variant = IldsBadgeVariant.subtle,
    this.size = IldsBadgeSize.medium,
    this.prefixIcon,
    this.isLoading = false,
  });

  final String label;
  final IldsBadgeVariant variant;
  final IldsBadgeSize size;
  final IconData? prefixIcon;
  final bool isLoading;

  /// Figma: large + medium = 12/16; small = 10/12 (10px is an off-scale outlier).
  TextStyle _labelStyle(Color fg) {
    switch (size) {
      case IldsBadgeSize.small:
        return TextStyle(
          fontFamily: ILDSTokens.fontFamilyPrimary,
          // OUTLIER: Figma small badge = 10px; tokenize as fontSize10 in future typography pass.
          fontSize: 10,
          // OUTLIER: Figma 10/12 line-height for small badge.
          height: 1.2,
          color: fg,
          fontWeight: ILDSTokens.fontWeightMedium,
        );
      case IldsBadgeSize.medium:
      case IldsBadgeSize.large:
        return TextStyle(
          fontFamily: ILDSTokens.fontFamilyPrimary,
          fontSize: ILDSTokens.fontSize12,
          height: ILDSTokens.lineHeight12,
          color: fg,
          fontWeight: ILDSTokens.fontWeightMedium,
        );
    }
  }

  double _iconSize() {
    switch (size) {
      case IldsBadgeSize.small:
        return 10;
      case IldsBadgeSize.medium:
      case IldsBadgeSize.large:
        return ILDSTokens.fontSize12;
    }
  }

  EdgeInsets _padding() {
    switch (size) {
      case IldsBadgeSize.small:
        return const EdgeInsets.symmetric(
          horizontal: ILDSTokens.spacing2,
          vertical: ILDSTokens.borderWidth2,
        );
      case IldsBadgeSize.medium:
        return const EdgeInsets.symmetric(
          horizontal: ILDSTokens.spacing2,
          vertical: ILDSTokens.spacing1,
        );
      case IldsBadgeSize.large:
        return const EdgeInsets.symmetric(
          horizontal: ILDSTokens.spacing3,
          vertical: ILDSTokens.spacing1,
        );
    }
  }

  // Figma 13965:24550 (verified via get_variable_defs): solid fills, white text.
  // subtle = pale secondary-blue; intense = secondary-blue-500.
  Color _bgColor() {
    if (isLoading || variant == IldsBadgeVariant.skeleton) return ILDSTokens.neutralCoolgray100;
    switch (variant) {
      case IldsBadgeVariant.subtle:
        return ILDSTokens.secondaryBlue50;
      case IldsBadgeVariant.intense:
        return ILDSTokens.secondaryBlue500;
      case IldsBadgeVariant.success:
        return ILDSTokens.successGreen500;
      case IldsBadgeVariant.error:
        return ILDSTokens.errorRed600;
      case IldsBadgeVariant.warning:
        return ILDSTokens.warningAmber500;
      case IldsBadgeVariant.info:
        return ILDSTokens.informativeBlue500;
      case IldsBadgeVariant.skeleton:
        return ILDSTokens.neutralCoolgray100;
    }
  }

  Color _fgColor() {
    if (isLoading || variant == IldsBadgeVariant.skeleton) return Colors.transparent;
    switch (variant) {
      case IldsBadgeVariant.subtle:
        return ILDSTokens.secondaryBlue500;
      case IldsBadgeVariant.intense:
        return ILDSTokens.globalWhite000;
      case IldsBadgeVariant.success:
      case IldsBadgeVariant.error:
      case IldsBadgeVariant.warning:
      case IldsBadgeVariant.info:
        return ILDSTokens.globalWhite000;
      case IldsBadgeVariant.skeleton:
        return Colors.transparent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final Color fg = _fgColor();
    return Semantics(
      label: label,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: _padding(),
        decoration: BoxDecoration(
          color: _bgColor(),
          borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusFull),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (prefixIcon != null && !isLoading && variant != IldsBadgeVariant.skeleton) ...[
              Icon(prefixIcon, size: _iconSize(), color: fg),
              const SizedBox(width: ILDSTokens.spacing1),
            ],
            Text(
              isLoading ? '' : label,
              style: _labelStyle(fg),
            ),
          ],
        ),
      ),
    );
  }
}
