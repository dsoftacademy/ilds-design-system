import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

class IldsSearch extends StatefulWidget {
  const IldsSearch({
    super.key,
    this.placeholder = 'Search',
    this.controller,
    this.onChanged,
    this.onSubmitted,
    this.onClear,
    this.isLoading = false,
    this.autofocus = false,
  });

  final String placeholder;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onClear;
  final bool isLoading;
  final bool autofocus;

  @override
  State<IldsSearch> createState() => _IldsSearchState();
}

class _IldsSearchState extends State<IldsSearch> {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  bool _isHovered = false;

  bool get _isFocused => _focusNode.hasFocus;
  bool get _hasText => _controller.text.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _focusNode = FocusNode();
    _controller.addListener(_onTextChanged);
  }

  @override
  void didUpdateWidget(covariant IldsSearch oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller && widget.controller != null) {
      _controller.removeListener(_onTextChanged);
      _controller = widget.controller!;
      _controller.addListener(_onTextChanged);
    }
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    if (widget.controller == null) {
      _controller.dispose();
    }
    _focusNode.dispose();
    super.dispose();
  }

  void _onTextChanged() => setState(() {});

  Color _borderColor() {
    if (_isFocused) return ILDSTokens.orange600;
    if (_isHovered) return ILDSTokens.neutralCoolgray800;
    return ILDSTokens.neutralCoolgray500;
  }

  Color _backgroundColor() {
    if (_isHovered && !_isFocused) return ILDSTokens.neutralCoolgray100;
    return ILDSTokens.neutralCoolgray50;
  }

  Color _leadingIconColor() {
    if (_isFocused) return ILDSTokens.orange600;
    if (_isHovered) return ILDSTokens.neutralCoolgray800;
    return ILDSTokens.neutralCoolgray600;
  }

  void _clear() {
    _controller.clear();
    widget.onClear?.call();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      textField: true,
      label: widget.placeholder,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          height: ILDSTokens.spacing10,
          decoration: BoxDecoration(
            color: _backgroundColor(),
            borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusSm),
            border: Border.all(
              color: _borderColor(),
              width: _isFocused ? ILDSTokens.borderWidth2 : ILDSTokens.borderWidth1,
            ),
          ),
          padding: const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing3),
          child: Row(
            children: [
              Icon(Icons.search, size: ILDSTokens.spacing4, color: _leadingIconColor()),
              const SizedBox(width: ILDSTokens.spacing2),
              Expanded(
                child: TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  autofocus: widget.autofocus,
                  onChanged: widget.onChanged,
                  onSubmitted: widget.onSubmitted,
                  style: const TextStyle(
                    fontFamily: ILDSTokens.fontFamilyPrimary,
                    fontSize: ILDSTokens.fontSize14,
                    height: ILDSTokens.lineHeight14,
                    fontWeight: ILDSTokens.fontWeightRegular,
                    color: ILDSTokens.neutral600,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: widget.placeholder,
                    hintStyle: const TextStyle(
                      fontFamily: ILDSTokens.fontFamilyPrimary,
                      fontSize: ILDSTokens.fontSize14,
                      height: ILDSTokens.lineHeight14,
                      fontWeight: ILDSTokens.fontWeightRegular,
                      color: ILDSTokens.neutral300,
                    ),
                    isCollapsed: true,
                  ),
                ),
              ),
              if (widget.isLoading)
                const SizedBox(
                  width: ILDSTokens.spacing5,
                  height: ILDSTokens.spacing5,
                  child: CircularProgressIndicator(
                    strokeWidth: ILDSTokens.borderWidth2,
                    color: ILDSTokens.orange500,
                  ),
                )
              else if (_hasText)
                GestureDetector(
                  onTap: _clear,
                  child: const Icon(
                    Icons.close,
                    size: ILDSTokens.spacing4,
                    color: ILDSTokens.neutral500,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
