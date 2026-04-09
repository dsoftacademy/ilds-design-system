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

  double _fontSize() {
    switch (size) {
      case IldsBadgeSize.small:
        return ILDSTokens.spacing2 + ILDSTokens.borderWidth1 + ILDSTokens.borderWidth2;
      case IldsBadgeSize.medium:
        return ILDSTokens.spacing3;
      case IldsBadgeSize.large:
        return ILDSTokens.spacing3 + ILDSTokens.borderWidth1;
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

  Color _bgColor() {
    if (isLoading || variant == IldsBadgeVariant.skeleton) return ILDSTokens.neutral100;
    switch (variant) {
      case IldsBadgeVariant.subtle:
        return ILDSTokens.neutral100;
      case IldsBadgeVariant.intense:
        return ILDSTokens.neutral900;
      case IldsBadgeVariant.success:
        return ILDSTokens.green50;
      case IldsBadgeVariant.error:
        return ILDSTokens.red50;
      case IldsBadgeVariant.warning:
        return ILDSTokens.amber50;
      case IldsBadgeVariant.info:
        return ILDSTokens.blue50;
      case IldsBadgeVariant.skeleton:
        return ILDSTokens.neutral100;
    }
  }

  Color _fgColor() {
    if (isLoading || variant == IldsBadgeVariant.skeleton) return Colors.transparent;
    switch (variant) {
      case IldsBadgeVariant.subtle:
        return ILDSTokens.neutral600;
      case IldsBadgeVariant.intense:
        return ILDSTokens.white;
      case IldsBadgeVariant.success:
        return ILDSTokens.green700;
      case IldsBadgeVariant.error:
        return ILDSTokens.red700;
      case IldsBadgeVariant.warning:
        return ILDSTokens.amber700;
      case IldsBadgeVariant.info:
        return ILDSTokens.blue700;
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
              Icon(prefixIcon, size: _fontSize(), color: fg),
              const SizedBox(width: ILDSTokens.spacing1),
            ],
            Text(
              isLoading ? '' : label,
              style: TextStyle(
                fontSize: _fontSize(),
                color: fg,
                fontWeight: ILDSTokens.fontWeightMedium,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
