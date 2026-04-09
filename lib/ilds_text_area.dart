import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

class IldsTextArea extends StatefulWidget {
  const IldsTextArea({
    super.key,
    this.label,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.successText,
    this.controller,
    this.minLines = 3,
    this.maxLines = 6,
    this.maxLength,
    this.showCharCount = false,
    this.isDisabled = false,
    this.isReadOnly = false,
    this.isLoading = false,
    this.onChanged,
  });

  final String? label;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final String? successText;
  final TextEditingController? controller;
  final int minLines;
  final int maxLines;
  final int? maxLength;
  final bool showCharCount;
  final bool isDisabled;
  final bool isReadOnly;
  final bool isLoading;
  final ValueChanged<String>? onChanged;

  @override
  State<IldsTextArea> createState() => _IldsTextAreaState();
}

class _IldsTextAreaState extends State<IldsTextArea> {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  bool _isHovered = false;
  double _minHeight = ILDSTokens.spacing16;

  bool get _hasError => widget.errorText != null;
  bool get _hasSuccess => widget.successText != null;
  bool get _isFocused => _focusNode.hasFocus;
  bool get _isInteractive => !widget.isDisabled && !widget.isLoading;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _focusNode = FocusNode();
    _focusNode.addListener(_onFocusChanged);
    _controller.addListener(_onTextChanged);
  }

  @override
  void didUpdateWidget(covariant IldsTextArea oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller && widget.controller != null) {
      _controller.removeListener(_onTextChanged);
      _controller = widget.controller!;
      _controller.addListener(_onTextChanged);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChanged);
    _focusNode.dispose();
    _controller.removeListener(_onTextChanged);
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  void _onFocusChanged() => setState(() {});
  void _onTextChanged() => setState(() {});

  Color _borderColor() {
    if (widget.isDisabled) return ILDSTokens.neutral200;
    if (_hasError) return ILDSTokens.red600;
    if (_isFocused) return ILDSTokens.orange500;
    if (_hasSuccess) return ILDSTokens.green600;
    if (_isHovered) return ILDSTokens.neutral400;
    return ILDSTokens.neutral300;
  }

  double _borderWidth() {
    if (_hasError || _isFocused) return ILDSTokens.borderWidth2;
    return ILDSTokens.borderWidth1;
  }

  Color _fillColor() {
    if (widget.isDisabled || widget.isReadOnly) return ILDSTokens.neutral50;
    if (_isHovered) return ILDSTokens.neutral50;
    return ILDSTokens.white;
  }

  Color _textColor() {
    if (widget.isDisabled) return ILDSTokens.neutral300;
    if (widget.isReadOnly) return ILDSTokens.neutral500;
    return ILDSTokens.neutral900;
  }

  String? _bottomText() {
    if (_hasError) return widget.errorText;
    if (_hasSuccess) return widget.successText;
    return widget.helperText;
  }

  Color _bottomTextColor() {
    if (_hasError) return ILDSTokens.red600;
    if (_hasSuccess) return ILDSTokens.green600;
    return ILDSTokens.neutral400;
  }

  int _charCount() => _controller.text.length;

  @override
  Widget build(BuildContext context) {
    final String? bottomText = _bottomText();
    final bool showCounter = widget.showCharCount && widget.maxLength != null;

    return Semantics(
      label: widget.label,
      hint: widget.placeholder,
      textField: true,
      multiline: true,
      enabled: _isInteractive,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (widget.label != null) ...[
              Text(
                widget.label!,
                style: const TextStyle(
                  fontSize: ILDSTokens.spacing3,
                  fontWeight: ILDSTokens.fontWeightMedium,
                  color: ILDSTokens.neutral500,
                ),
              ),
              const SizedBox(height: ILDSTokens.spacing1),
            ],
            AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              constraints: BoxConstraints(minHeight: _minHeight),
              decoration: BoxDecoration(
                color: _fillColor(),
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                border: Border.all(color: _borderColor(), width: _borderWidth()),
              ),
              child: Stack(
                children: [
                  TextField(
                    controller: _controller,
                    focusNode: _focusNode,
                    enabled: _isInteractive,
                    readOnly: widget.isReadOnly,
                    minLines: widget.minLines,
                    maxLines: widget.maxLines,
                    maxLength: widget.maxLength,
                    onChanged: widget.onChanged,
                    style: TextStyle(
                      fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
                      fontWeight: ILDSTokens.fontWeightRegular,
                      color: _textColor(),
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      hintText: widget.placeholder,
                      hintStyle: const TextStyle(
                        fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
                        fontWeight: ILDSTokens.fontWeightRegular,
                        color: ILDSTokens.neutral300,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: ILDSTokens.spacing4,
                        vertical: ILDSTokens.spacing3,
                      ),
                    ),
                  ),
                  if (widget.isLoading)
                    const Positioned(
                      right: ILDSTokens.spacing3,
                      top: ILDSTokens.spacing3,
                      child: SizedBox(
                        width: ILDSTokens.spacing5,
                        height: ILDSTokens.spacing5,
                        child: CircularProgressIndicator(
                          strokeWidth: ILDSTokens.borderWidth2,
                          color: ILDSTokens.orange500,
                        ),
                      ),
                    ),
                  Positioned(
                    right: ILDSTokens.spacing2,
                    bottom: ILDSTokens.spacing2,
                    child: GestureDetector(
                      onPanUpdate: (details) {
                        setState(() {
                          _minHeight = (_minHeight + details.delta.dy)
                              .clamp(ILDSTokens.spacing16, ILDSTokens.spacing16 * ILDSTokens.borderWidth2);
                        });
                      },
                      child: Icon(
                        Icons.drag_handle,
                        size: ILDSTokens.spacing3,
                        color: ILDSTokens.neutral300,
                      ), // TODO: resize handle — exact drag handle dimensions from Figma spec
                    ),
                  ),
                ],
              ),
            ),
            if (bottomText != null || showCounter) ...[
              const SizedBox(height: ILDSTokens.spacing1),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: bottomText == null
                        ? const SizedBox.shrink()
                        : Text(
                            bottomText,
                            style: TextStyle(
                              fontSize: ILDSTokens.spacing3,
                              fontWeight: ILDSTokens.fontWeightRegular,
                              color: _bottomTextColor(),
                            ),
                          ),
                  ),
                  if (showCounter)
                    Text(
                      '${_charCount()}/${widget.maxLength}',
                      style: const TextStyle(
                        fontSize: ILDSTokens.spacing3,
                        fontWeight: ILDSTokens.fontWeightRegular,
                        color: ILDSTokens.neutral400,
                      ),
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
