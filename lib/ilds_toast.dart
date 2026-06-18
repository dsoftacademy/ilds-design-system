import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';
import 'ilds_button.dart';

enum IldsToastVariant { info, success, warning, error }
enum IldsToastPosition { bottom, top }

class IldsToastAction {
  const IldsToastAction({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;
}

class IldsToastActions {
  const IldsToastActions({this.primary, this.secondary});

  final IldsToastAction? primary;
  final IldsToastAction? secondary;

  bool get hasAny => primary != null || secondary != null;
}

/// Inline toast / snackbar body styled for ILDS (Figma set 17708:3491).
class IldsToast extends StatelessWidget {
  const IldsToast({
    super.key,
    required this.message,
    this.title,
    this.variant = IldsToastVariant.info,
    this.showIcon = true,
    this.actions,
    this.actionLabel,
    this.onAction,
    this.showClose = false,
    this.onClose,
    @Deprecated('Figma toast has no accent bar; border tint only.')
    this.showAccentBar = false,
  });

  final String message;
  final String? title;
  final IldsToastVariant variant;
  final bool showIcon;
  final IldsToastActions? actions;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool showClose;
  final VoidCallback? onClose;

  @Deprecated('Figma toast has no accent bar; border tint only.')
  final bool showAccentBar;

  static void show(
    BuildContext context, {
    required String message,
    String? title,
    IldsToastVariant variant = IldsToastVariant.info,
    bool showIcon = true,
    IldsToastActions? actions,
    String? actionLabel,
    VoidCallback? onAction,
    bool showClose = false,
    bool showAccentBar = false,
    bool isPersistent = false,
    IldsToastPosition position = IldsToastPosition.top,
    Duration duration = const Duration(seconds: 4),
  }) {
    assert(
      !isPersistent || showClose,
      'isPersistent requires showClose: true so the toast can be dismissed.',
    );
    final OverlayState? overlay = Overlay.maybeOf(context, rootOverlay: true);
    if (overlay == null) return;

    final Duration effectiveDuration = isPersistent && showClose
        ? const Duration(days: 365)
        : duration;

    final IldsToastActions? resolvedActions = actions ??
        (actionLabel != null && onAction != null
            ? IldsToastActions(
                primary: IldsToastAction(label: actionLabel, onPressed: onAction),
              )
            : null);

    _IldsToastOverlay.show(
      overlay: overlay,
      position: position,
      duration: effectiveDuration,
      isPersistent: isPersistent && showClose,
      builder: (VoidCallback dismiss) => SizedBox(
        width: 320,
        child: IldsToast(
          message: message,
          title: title,
          variant: variant,
          showIcon: showIcon,
          actions: resolvedActions,
          showClose: showClose,
          showAccentBar: showAccentBar,
          onClose: dismiss,
        ),
      ),
    );
  }

  IldsToastActions? get _resolvedActions {
    if (actions != null) return actions;
    if (actionLabel != null && onAction != null) {
      return IldsToastActions(
        primary: IldsToastAction(label: actionLabel!, onPressed: onAction!),
      );
    }
    return null;
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
  Color _iconColor() {
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
    final Color iconColor = _iconColor();
    final bool hasTitle = title != null && title!.isNotEmpty;
    final IldsToastActions? footerActions = _resolvedActions;
    final VoidCallback? closeHandler = onClose;

    Widget content = DecoratedBox(
      decoration: BoxDecoration(
        color: ILDSTokens.white,
        borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusLg),
        border: Border.all(color: _borderColor(), width: ILDSTokens.borderWidth1),
        boxShadow: const [
          BoxShadow(
            color: Color(0xFFE0E0E0),
            offset: Offset(0, 8),
            blurRadius: 12,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(ILDSTokens.spacing3),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (showIcon) ...[
                  Icon(_iconForVariant(), color: iconColor, size: 24),
                  const SizedBox(width: ILDSTokens.spacing2),
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
                            height: 18 / 14,
                            color: ILDSTokens.neutralCoolgray900,
                          ),
                        ),
                        const SizedBox(height: ILDSTokens.spacing1),
                      ],
                      Text(
                        message,
                        style: const TextStyle(
                          fontFamily: 'Mulish',
                          fontSize: 14,
                          height: 18 / 14,
                          fontWeight: ILDSTokens.fontWeightRegular,
                          color: ILDSTokens.neutralCoolgray800,
                        ),
                      ),
                    ],
                  ),
                ),
                if (showClose && closeHandler != null) ...[
                  const SizedBox(width: ILDSTokens.spacing2),
                  IconButton(
                    onPressed: closeHandler,
                    icon: const Icon(
                      Icons.close,
                      color: ILDSTokens.neutralCoolgray500,
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
            if (footerActions != null && footerActions.hasAny) ...[
              const SizedBox(height: ILDSTokens.spacing3),
              Row(
                children: [
                  if (footerActions.secondary != null)
                    IldsButton(
                      label: footerActions.secondary!.label,
                      type: IldsButtonType.secondary,
                      size: IldsButtonSize.medium,
                      onPressed: footerActions.secondary!.onPressed,
                    ),
                  if (footerActions.secondary != null && footerActions.primary != null)
                    const SizedBox(width: ILDSTokens.spacing2),
                  if (footerActions.primary != null)
                    IldsButton(
                      label: footerActions.primary!.label,
                      type: IldsButtonType.primary,
                      size: IldsButtonSize.medium,
                      onPressed: footerActions.primary!.onPressed,
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );

    if (showAccentBar) {
      content = Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: ILDSTokens.borderWidth4,
            decoration: BoxDecoration(
              color: iconColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(ILDSTokens.borderRadiusLg),
                bottomLeft: Radius.circular(ILDSTokens.borderRadiusLg),
              ),
            ),
          ),
          Expanded(child: content),
        ],
      );
    }

    return Semantics(
      label: hasTitle ? '$title. $message' : message,
      liveRegion: true,
      child: Material(
        color: Colors.transparent,
        child: content,
      ),
    );
  }
}

typedef _IldsToastBuilder = Widget Function(VoidCallback dismiss);

class _ActiveToast {
  _ActiveToast({
    required this.id,
    required this.builder,
    required this.duration,
    required this.isPersistent,
  });

  final int id;
  final _IldsToastBuilder builder;
  final Duration duration;
  final bool isPersistent;
}

/// Root overlay host — top-right stack, max width 320px per toast (Figma 17708:3491).
class _IldsToastOverlay {
  static final List<_ActiveToast> _toasts = <_ActiveToast>[];
  static OverlayEntry? _entry;
  static int _nextId = 0;
  static IldsToastPosition _position = IldsToastPosition.top;

  static void show({
    required OverlayState overlay,
    required IldsToastPosition position,
    required Duration duration,
    required bool isPersistent,
    required _IldsToastBuilder builder,
  }) {
    _position = position;
    final int id = _nextId++;
    _toasts.add(_ActiveToast(
      id: id,
      builder: builder,
      duration: duration,
      isPersistent: isPersistent,
    ));

    void dismiss() => _remove(id);

    if (!isPersistent) {
      Future<void>.delayed(duration, () {
        if (_toasts.any((toast) => toast.id == id)) {
          dismiss();
        }
      });
    }

    if (_entry == null) {
      _entry = OverlayEntry(builder: _buildOverlay);
      overlay.insert(_entry!);
    } else {
      _entry!.markNeedsBuild();
    }
  }

  static void _remove(int id) {
    _toasts.removeWhere((toast) => toast.id == id);
    if (_toasts.isEmpty) {
      _entry?.remove();
      _entry = null;
    } else {
      _entry?.markNeedsBuild();
    }
  }

  static Widget _buildOverlay(BuildContext context) {
    final MediaQueryData mediaQuery = MediaQuery.of(context);
    final double inset = ILDSTokens.spacing4;

    return Positioned.fill(
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            top: _position == IldsToastPosition.top
                ? mediaQuery.padding.top + inset
                : null,
            bottom: _position == IldsToastPosition.bottom ? inset : null,
            right: inset,
            child: Material(
              type: MaterialType.transparency,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    for (final _ActiveToast toast in _toasts) ...[
                      Padding(
                        padding: const EdgeInsets.only(bottom: ILDSTokens.spacing2),
                        child: toast.builder(() => _remove(toast.id)),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
