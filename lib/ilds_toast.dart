import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsToastVariant { info, success, warning, error }
enum IldsToastPosition { bottom, top }

/// Inline toast / snackbar body styled for ILDS (brand orange accent on info).
class IldsToast extends StatelessWidget {
  const IldsToast({
    super.key,
    required this.message,
    this.title,
    this.variant = IldsToastVariant.info,
    this.showIcon = true,
    this.actionLabel,
    this.onAction,
    this.showClose = false,
    this.showAccentBar = true,
  });

  final String message;
  final String? title;
  final IldsToastVariant variant;
  final bool showIcon;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool showClose;
  final bool showAccentBar;

  static void show(
    BuildContext context, {
    required String message,
    String? title,
    IldsToastVariant variant = IldsToastVariant.info,
    bool showIcon = true,
    String? actionLabel,
    VoidCallback? onAction,
    bool showClose = false,
    bool showAccentBar = true,
    bool isPersistent = false,
    IldsToastPosition position = IldsToastPosition.bottom,
    Duration duration = const Duration(seconds: 4),
  }) {
    assert(
      !isPersistent || showClose,
      'isPersistent requires showClose: true so the toast can be dismissed.',
    );
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;
    final MediaQueryData mediaQuery = MediaQuery.of(context);

    final Duration effectiveDuration = isPersistent && showClose
        ? const Duration(days: 365)
        : duration;

    final EdgeInsets margin = position == IldsToastPosition.top
        ? EdgeInsets.only(
            // TODO: add dedicated top toast offset token if required by spec.
            top: mediaQuery.padding.top + ILDSTokens.spacing4,
            left: ILDSTokens.spacing4,
            right: ILDSTokens.spacing4,
            bottom: ILDSTokens.spacing4,
          )
        : const EdgeInsets.all(ILDSTokens.spacing4);

    messenger.clearSnackBars();
    messenger.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        margin: margin,
        padding: EdgeInsets.zero,
        duration: effectiveDuration,
        backgroundColor: Colors.transparent,
        elevation: 0,
        content: IldsToast(
          message: message,
          title: title,
          variant: variant,
          showIcon: showIcon,
          actionLabel: actionLabel,
          onAction: onAction,
          showClose: showClose,
          showAccentBar: showAccentBar,
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
    final bool hasTitle = title != null && title!.isNotEmpty;

    return Semantics(
      label: hasTitle ? '$title. $message' : message,
      liveRegion: true,
      child: Material(
        // Token: color.neutral.0 (white surface)
        color: ILDSTokens.white,
        elevation: 4, // TODO: add shadow elevation token to ILDSTokens.
        shadowColor: Colors.black26,
        // Token: borderRadius.md
        borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (showAccentBar)
              Container(
                width: ILDSTokens.borderWidth4,
                decoration: BoxDecoration(
                  color: accent,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(ILDSTokens.borderRadiusMd),
                    bottomLeft: Radius.circular(ILDSTokens.borderRadiusMd),
                  ),
                ),
              ),
            Expanded(
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
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (hasTitle) ...[
                            Text(
                              title!,
                              style: const TextStyle(
                                fontFamily: 'Mulish',
                                fontSize: 14,
                                fontWeight: ILDSTokens.fontWeightBold,
                                color: ILDSTokens.neutral600,
                              ),
                            ),
                            const SizedBox(height: ILDSTokens.spacing1),
                          ],
                          Text(
                            message,
                            style: TextStyle(
                              fontFamily: 'Mulish',
                              fontSize: 14,
                              height: 1.35,
                              fontWeight: hasTitle
                                  ? ILDSTokens.fontWeightRegular
                                  : ILDSTokens.fontWeightMedium,
                              color: ILDSTokens.neutral500,
                            ),
                          ),
                        ],
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
                            fontFamily: 'Mulish',
                            fontWeight: ILDSTokens.fontWeightBold,
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                    if (showClose) ...[
                      const SizedBox(width: ILDSTokens.spacing2),
                      IconButton(
                        onPressed: () => ScaffoldMessenger.of(context).hideCurrentSnackBar(),
                        icon: const Icon(
                          Icons.close,
                          color: ILDSTokens.neutral400,
                          size: ILDSTokens.spacing5,
                        ),
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(
                          minWidth: ILDSTokens.spacing5,
                          minHeight: ILDSTokens.spacing5,
                        ),
                        splashRadius: ILDSTokens.spacing4,
                        tooltip: 'Close notification',
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
