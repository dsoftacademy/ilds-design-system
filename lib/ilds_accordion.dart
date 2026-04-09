import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

class IldsAccordion extends StatefulWidget {
  const IldsAccordion({
    super.key,
    required this.title,
    required this.content,
    this.prefix,
    this.prefixNumber,
    this.initiallyOpen = false,
    this.isDisabled = false,
  });

  final String title;
  final Widget content;
  final IconData? prefix;
  final int? prefixNumber;
  final bool initiallyOpen;
  final bool isDisabled;

  @override
  State<IldsAccordion> createState() => _IldsAccordionState();
}

class _IldsAccordionState extends State<IldsAccordion> with TickerProviderStateMixin {
  late bool _isOpen;
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _isOpen = widget.initiallyOpen;
  }

  Color _headerBg() {
    if (_isPressed) return ILDSTokens.neutral100;
    if (_isHovered) return ILDSTokens.neutral50;
    return ILDSTokens.white;
  }

  Color _titleColor() {
    if (_isFocused) return ILDSTokens.orange500;
    return ILDSTokens.neutral900;
  }

  Color _iconColor() {
    if (_isFocused) return ILDSTokens.orange500;
    if (_isPressed) return ILDSTokens.neutral900;
    if (_isHovered) return ILDSTokens.neutral600;
    return ILDSTokens.neutral600;
  }

  void _toggle() {
    if (widget.isDisabled) return;
    setState(() => _isOpen = !_isOpen);
  }

  @override
  Widget build(BuildContext context) {
    final Widget header = Focus(
      onFocusChange: (value) => setState(() => _isFocused = value),
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() {
          _isHovered = false;
          _isPressed = false;
        }),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: widget.isDisabled ? null : (_) => setState(() => _isPressed = true),
          onTapUp: widget.isDisabled ? null : (_) => setState(() => _isPressed = false),
          onTapCancel: widget.isDisabled ? null : () => setState(() => _isPressed = false),
          onTap: _toggle,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.symmetric(
              horizontal: ILDSTokens.spacing4,
              vertical: ILDSTokens.spacing3,
            ),
            color: _headerBg(),
            child: Row(
              children: [
                if (widget.prefix != null) ...[
                  Icon(widget.prefix, size: ILDSTokens.spacing4, color: _iconColor()),
                  const SizedBox(width: ILDSTokens.spacing2),
                ],
                if (widget.prefixNumber != null) ...[
                  Text(
                    '${widget.prefixNumber}',
                    style: const TextStyle(
                      fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
                      fontWeight: ILDSTokens.fontWeightBold,
                      color: ILDSTokens.neutral600,
                    ),
                  ),
                  const SizedBox(width: ILDSTokens.spacing2),
                ],
                Expanded(
                  child: Text(
                    widget.title,
                    style: TextStyle(
                      fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
                      color: widget.isDisabled ? ILDSTokens.neutral300 : _titleColor(),
                      fontWeight: ILDSTokens.fontWeightMedium,
                    ),
                  ),
                ),
                AnimatedRotation(
                  duration: const Duration(milliseconds: 200),
                  turns: _isOpen ? 0.5 : 0,
                  child: Icon(Icons.expand_more, color: _iconColor(), size: ILDSTokens.spacing5),
                ),
              ],
            ),
          ),
        ),
      ),
    );

    return Semantics(
      button: true,
      expanded: _isOpen,
      enabled: !widget.isDisabled,
      label: widget.title,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          header,
          const Divider(
            height: ILDSTokens.borderWidth1,
            thickness: ILDSTokens.borderWidth1,
            color: ILDSTokens.neutral200,
          ),
          ClipRect(
            child: AnimatedSize(
              duration: const Duration(milliseconds: 200),
              curve: Curves.easeInOut,
              child: _isOpen
                  ? Padding(
                      padding: const EdgeInsets.all(ILDSTokens.spacing4),
                      child: widget.content,
                    )
                  : const SizedBox.shrink(),
            ),
          ),
        ],
      ),
    );
  }
}
