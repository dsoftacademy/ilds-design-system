import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsToastVariant { info, success, warning, error }

/// Inline toast / snackbar body styled for ILDS (brand orange accent on info).
class IldsToast extends StatelessWidget {
  const IldsToast({
    super.key,
    required this.message,
    this.variant = IldsToastVariant.info,
    this.showIcon = true,
    this.actionLabel,
    this.onAction,
  });

  final String message;
  final IldsToastVariant variant;
  final bool showIcon;
  final String? actionLabel;
  final VoidCallback? onAction;

  static void show(
    BuildContext context, {
    required String message,
    IldsToastVariant variant = IldsToastVariant.info,
    bool showIcon = true,
    String? actionLabel,
    VoidCallback? onAction,
    Duration duration = const Duration(seconds: 4),
  }) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;

    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(ILDSTokens.spacing4),
        padding: EdgeInsets.zero,
        duration: duration,
        backgroundColor: Colors.transparent,
        elevation: 0,
        content: IldsToast(
          message: message,
          variant: variant,
          showIcon: showIcon,
          actionLabel: actionLabel,
          onAction: onAction,
        ),
      ),
    );
  }

  IconData _iconForVariant() {
    switch (variant) {
      case IldsToastVariant.info:
        return Icons.info_outline_rounded;
      case IldsToastVariant.success:
        return Icons.check_circle_outline_rounded;
      case IldsToastVariant.warning:
        return Icons.warning_amber_rounded;
      case IldsToastVariant.error:
        return Icons.error_outline_rounded;
    }
  }

  /// Token: orange.500 (info) | green.600 (success) | amber.500 (warning) | red.600 (error)
  Color _accent() {
    switch (variant) {
      case IldsToastVariant.info:
        return ILDSTokens.orange500;
      case IldsToastVariant.success:
        return ILDSTokens.green600;
      case IldsToastVariant.warning:
        return ILDSTokens.amber500;
      case IldsToastVariant.error:
        return ILDSTokens.red600;
    }
  }

  @override
  Widget build(BuildContext context) {
    final accent = _accent();

    return Material(
      // Token: color.neutral.0 (white surface)
      color: ILDSTokens.white,
      elevation: 4,
      shadowColor: Colors.black26,
      // Token: borderRadius.md
      borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
      child: Padding(
        padding: const EdgeInsets.symmetric(
          horizontal: ILDSTokens.spacing4,
          vertical: ILDSTokens.spacing3,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showIcon) ...[
              Icon(_iconForVariant(), color: accent, size: 22),
              const SizedBox(width: ILDSTokens.spacing3),
            ],
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.35,
                  // Token: fontWeight.medium, color.neutral.500
                  fontWeight: ILDSTokens.fontWeightMedium,
                  color: ILDSTokens.neutral500,
                ),
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(width: ILDSTokens.spacing3),
              TextButton(
                onPressed: onAction,
                style: TextButton.styleFrom(
                  foregroundColor: accent,
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  actionLabel!,
                  style: const TextStyle(
                    // Token: fontWeight.bold
                    fontWeight: ILDSTokens.fontWeightBold,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
