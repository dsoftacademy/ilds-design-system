// lib/components/ilds_text_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'design_system/ilds_tokens.dart';

enum IldsTextFieldKind { standard, password, otpX6, otpX4 }

class IldsTextField extends StatefulWidget {
  final String label;
  final String? placeholder;
  final String? helperText;
  final String? errorText;
  final String? successText;
  final IldsTextFieldKind kind;
  final bool enabled;
  final bool isReadOnly;
  final bool isLoading;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final int? maxLength;

  const IldsTextField({
    super.key,
    required this.label,
    this.placeholder,
    this.helperText,
    this.errorText,
    this.successText,
    this.kind = IldsTextFieldKind.standard,
    this.enabled = true,
    this.isReadOnly = false,
    this.isLoading = false,
    this.controller,
    this.onChanged,
    this.leadingIcon,
    this.trailingIcon,
    this.maxLength,
  });

  @override
  State<IldsTextField> createState() => _IldsTextFieldState();
}

class _IldsTextFieldState extends State<IldsTextField> {
  bool _obscureText = true;
  late TextEditingController _effectiveController;

  @override
  void initState() {
    super.initState();
    _effectiveController = widget.controller ?? TextEditingController();
    if (widget.maxLength != null) {
      _effectiveController.addListener(_onTextChanged);
    }
  }

  @override
  void didUpdateWidget(IldsTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.controller != null && widget.controller != _effectiveController) {
      if (widget.maxLength != null) {
        _effectiveController.removeListener(_onTextChanged);
      }
      _effectiveController = widget.controller!;
      if (widget.maxLength != null) {
        _effectiveController.addListener(_onTextChanged);
      }
    }
  }

  @override
  void dispose() {
    if (widget.maxLength != null) {
      _effectiveController.removeListener(_onTextChanged);
    }
    if (widget.controller == null) {
      _effectiveController.dispose();
    }
    super.dispose();
  }

  void _onTextChanged() {
    setState(() {}); // Rebuild to update character count
  }

  @override
  Widget build(BuildContext context) {
    if (widget.kind == IldsTextFieldKind.otpX6 ||
        widget.kind == IldsTextFieldKind.otpX4) {
      return _buildOtp();
    }
    return _buildStandard();
  }

  Widget _buildStandard() {
    final bool isPassword = widget.kind == IldsTextFieldKind.password;
    final bool hasError = widget.errorText != null;
    final bool hasSuccess = widget.successText != null;

    // Determine Border Colors
    Color borderColor = ILDSTokens.neutralCoolgray500;
    if (widget.isReadOnly) {
      borderColor = ILDSTokens.neutralCoolgray500;
    } else if (hasError) {
      borderColor = ILDSTokens.red600;
    } else if (hasSuccess) {
      borderColor = ILDSTokens.green600;
    }

    Color focusedBorderColor = ILDSTokens.orange500;
    if (!widget.isReadOnly && hasError) {
      focusedBorderColor = ILDSTokens.red600;
    }

    // Determine Bottom Text and Colors
    String? bottomText = widget.helperText;
    Color bottomTextColor = ILDSTokens.neutral400;
    if (hasError) {
      bottomText = widget.errorText;
      bottomTextColor = ILDSTokens.red600;
    } else if (hasSuccess) {
      bottomText = widget.successText;
      bottomTextColor = ILDSTokens.green600;
    }

    // Determine Suffix Icon
    Widget? activeSuffixIcon;
    if (widget.isLoading) {
      // TODO: add icon size tokens (e.g. iconSizeMd = 20.0) to ILDSTokens.
      activeSuffixIcon = Padding(
        padding: const EdgeInsets.all(12),
        child: SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            strokeWidth: ILDSTokens.borderWidth2,
            color: ILDSTokens.orange500,
          ),
        ),
      );
    } else if (isPassword) {
      activeSuffixIcon = IconButton(
        icon: Icon(
          _obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
          color: ILDSTokens.neutral400,
        ),
        onPressed: () => setState(() => _obscureText = !_obscureText),
      );
    } else if (widget.trailingIcon != null) {
      activeSuffixIcon = widget.trailingIcon;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: ILDSTokens.fontWeightMedium,
            color: ILDSTokens.neutral500,
          ),
        ),
        SizedBox(height: ILDSTokens.spacing1),
        Semantics(
          label: widget.label,
          hint: widget.placeholder,
          textField: true,
          child: TextField(
            controller: _effectiveController,
            enabled: widget.enabled && !widget.isLoading,
            readOnly: widget.isReadOnly,
            obscureText: isPassword ? _obscureText : false,
            onChanged: widget.onChanged,
            maxLength: widget.maxLength,
            style: TextStyle(
              fontSize: 14,
              fontWeight: ILDSTokens.fontWeightRegular,
              color: widget.isReadOnly ? ILDSTokens.neutral500 : ILDSTokens.neutral600,
            ),
            decoration: InputDecoration(
              hintText: widget.placeholder,
              hintStyle: const TextStyle(
                fontSize: 14,
                fontWeight: ILDSTokens.fontWeightRegular,
                color: ILDSTokens.neutral300,
              ),
              counterText: '',
              prefixIcon: widget.leadingIcon,
              prefixIconColor: WidgetStateColor.resolveWith((states) {
                if (widget.isReadOnly) return ILDSTokens.neutral400;
                if (hasError) return ILDSTokens.red600;
                if (hasSuccess) return ILDSTokens.green600;
                if (states.contains(WidgetState.focused)) return ILDSTokens.orange500;
                return ILDSTokens.neutral400;
              }),
              suffixIcon: activeSuffixIcon,
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                borderSide: BorderSide(color: borderColor, width: ILDSTokens.borderWidth1),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                borderSide: BorderSide(
                  color: focusedBorderColor,
                  width: ILDSTokens.borderWidth2,
                ),
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                borderSide: const BorderSide(
                  color: ILDSTokens.neutralCoolgray300,
                  width: ILDSTokens.borderWidth1,
                ),
              ),
              filled: !widget.enabled || widget.isReadOnly,
              fillColor: !widget.enabled
                  ? ILDSTokens.neutralCoolgray200
                  : (widget.isReadOnly ? ILDSTokens.neutralCoolgray50 : null),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: ILDSTokens.spacing4,
                // TODO: verify Figma spec if spacing3 should be spacing4 here.
                vertical: ILDSTokens.spacing3,
              ),
            ),
          ),
        ),
        if (bottomText != null || widget.maxLength != null) ...[
          SizedBox(height: ILDSTokens.spacing1),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (bottomText != null)
                Expanded(
                  child: Text(
                    bottomText,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: ILDSTokens.fontWeightRegular,
                      color: bottomTextColor,
                    ),
                  ),
                )
              else
                const Spacer(),
              if (widget.maxLength != null)
                Padding(
                  padding: const EdgeInsets.only(left: ILDSTokens.spacing2),
                  child: Text(
                    '${_effectiveController.text.length}/${widget.maxLength}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: ILDSTokens.fontWeightRegular,
                      color: ILDSTokens.neutral400,
                    ),
                  ),
                ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildOtp() {
    final int count = widget.kind == IldsTextFieldKind.otpX6 ? 6 : 4;
    return _OtpInput(
      count: count,
      enabled: widget.enabled,
      onChanged: widget.onChanged,
    );
  }
}

class _OtpInput extends StatefulWidget {
  const _OtpInput({
    required this.count,
    required this.enabled,
    this.onChanged,
  });

  final int count;
  final bool enabled;
  final ValueChanged<String>? onChanged;

  @override
  State<_OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<_OtpInput> {
  late final List<TextEditingController> _controllers;
  late final List<FocusNode> _focusNodes;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.count, (_) => TextEditingController());
    _focusNodes = List.generate(widget.count, (_) => FocusNode());
  }

  @override
  void dispose() {
    for (final TextEditingController controller in _controllers) {
      controller.dispose();
    }
    for (final FocusNode node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _emitValue() {
    widget.onChanged?.call(_controllers.map((c) => c.text).join());
  }

  void _onDigitChanged(int index, String value) {
    if (value.isEmpty) {
      if (index > 0) {
        _focusNodes[index - 1].requestFocus();
      }
      _emitValue();
      return;
    }

    if (value.length > 1) {
      final digits = value.replaceAll(RegExp(r'\D'), '');
      for (int i = 0; i < digits.length && index + i < widget.count; i++) {
        _controllers[index + i].text = digits[i];
      }
      final int next = (index + digits.length).clamp(0, widget.count - 1);
      _focusNodes[next].requestFocus();
      _emitValue();
      return;
    }

    if (value.isNotEmpty && index < widget.count - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    _emitValue();
  }

  KeyEventResult _onKey(int index, KeyEvent event) {
    if (event is! KeyDownEvent || event.logicalKey != LogicalKeyboardKey.backspace) {
      return KeyEventResult.ignored;
    }
    if (_controllers[index].text.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(widget.count, (index) {
        return Container(
          width: 48,
          height: 56,
          margin: EdgeInsets.only(
            right: index < widget.count - 1 ? ILDSTokens.spacing2 : 0,
          ),
          child: Focus(
            onKeyEvent: (node, event) => _onKey(index, event),
            child: Semantics(
              label: 'OTP digit ${index + 1}',
              textField: true,
              child: TextField(
                controller: _controllers[index],
                focusNode: _focusNodes[index],
                enabled: widget.enabled,
                textAlign: TextAlign.center,
                maxLength: 1,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: (value) => _onDigitChanged(index, value),
                textInputAction:
                    index < widget.count - 1 ? TextInputAction.next : TextInputAction.done,
                onSubmitted: (_) {
                  if (index < widget.count - 1) {
                    _focusNodes[index + 1].requestFocus();
                  }
                },
                onTap: () {
                  _controllers[index].selection = TextSelection(
                    baseOffset: 0,
                    extentOffset: _controllers[index].text.length,
                  );
                },
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: ILDSTokens.fontWeightBold,
                  color: ILDSTokens.neutral600,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                    borderSide: const BorderSide(color: ILDSTokens.neutral200),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                    borderSide: const BorderSide(
                      color: ILDSTokens.orange500,
                      width: ILDSTokens.borderWidth2,
                    ),
                  ),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),
          ),
        );
      }),
    );
  }
}