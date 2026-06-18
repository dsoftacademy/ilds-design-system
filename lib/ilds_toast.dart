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
        content: SizedBox(
          width: 320,
          child: IldsToast(
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

  /// Token: informativeBlue500 (info) | green.600 (success) | amber.500 (warning) | red.600 (error)
  Color _accent() {
    switch (variant) {
      case IldsToastVariant.info:
        return ILDSTokens.informativeBlue500;
      case IldsToastVariant.success:
        return ILDSTokens.green600;
      case IldsToastVariant.warning:
        return ILDSTokens.amber500;
      case IldsToastVariant.error:
        return ILDSTokens.red600;
    }
  }

  Color _borderColor() {
    switch (variant) {
      case IldsToastVariant.info:
        return ILDSTokens.secondaryBlue50;
      case IldsToastVariant.success:
        return ILDSTokens.green50;
      case IldsToastVariant.warning:
        return ILDSTokens.amber50;
      case IldsToastVariant.error:
        return ILDSTokens.red50;
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
        color: ILDSTokens.white,
        elevation: 4,
        shadowColor: Colors.black26,
        borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusLg),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: ILDSTokens.white,
            borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusLg),
            border: Border.all(color: _borderColor(), width: ILDSTokens.borderWidth1),
          ),
          child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (showAccentBar)
              Container(
                width: ILDSTokens.borderWidth4,
                decoration: BoxDecoration(
                  color: accent,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(ILDSTokens.borderRadiusLg),
                    bottomLeft: Radius.circular(ILDSTokens.borderRadiusLg),
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
                                fontFamily: ILDSTokens.fontFamilyPrimary,
                                fontSize: ILDSTokens.fontSize14,
                                height: ILDSTokens.lineHeight14,
                                fontWeight: ILDSTokens.fontWeightBold,
                                color: ILDSTokens.neutral600,
                              ),
                            ),
                            const SizedBox(height: ILDSTokens.spacing1),
                          ],
                          Text(
                            message,
                            style: TextStyle(
                              fontFamily: ILDSTokens.fontFamilyPrimary,
                              fontSize: ILDSTokens.fontSize14,
                              height: ILDSTokens.lineHeight14,
                              fontWeight: hasTitle
                                  ? ILDSTokens.fontWeightRegular
                                  : ILDSTokens.fontWeightMedium,
                              color: ILDSTokens.neutralCoolgray800,
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
                            fontFamily: ILDSTokens.fontFamilyPrimary,
                            fontWeight: ILDSTokens.fontWeightBold,
                            fontSize: ILDSTokens.fontSize14,
                            height: ILDSTokens.lineHeight14,
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
      ),
    );
  }
}
