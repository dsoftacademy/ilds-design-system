import 'package:flutter/material.dart';

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

  static const Color _primaryOrange = Color(0xFFEB440C);
  static const Color _textPrimary = Color(0xFF424242);
  static const Color _surface = Color(0xFFFFFFFF);
  static const Color _success = Color(0xFF2E7D32);
  static const Color _warning = Color(0xFFF59E0B);
  static const Color _error = Color(0xFFD32F2F);

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
        margin: const EdgeInsets.all(16),
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

  Color _accent() {
    switch (variant) {
      case IldsToastVariant.info:
        return _primaryOrange;
      case IldsToastVariant.success:
        return _success;
      case IldsToastVariant.warning:
        return _warning;
      case IldsToastVariant.error:
        return _error;
    }
  }

  @override
  Widget build(BuildContext context) {
    final accent = _accent();

    return Material(
      color: _surface,
      elevation: 4,
      shadowColor: Colors.black26,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showIcon) ...[
              Icon(_iconForVariant(), color: accent, size: 22),
              const SizedBox(width: 12),
            ],
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontSize: 14,
                  height: 1.35,
                  fontWeight: FontWeight.w500,
                  color: _textPrimary,
                ),
              ),
            ),
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(width: 12),
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
                    fontWeight: FontWeight.w600,
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
