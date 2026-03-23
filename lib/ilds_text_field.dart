import 'package:flutter/material.dart';

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
  });

  @override
  State<IldsTextField> createState() => _IldsTextFieldState();
}

class _IldsTextFieldState extends State<IldsTextField> {
  bool _obscureText = true;

  static const Color _primaryOrange = Color(0xFFEB440C);
  static const Color _errorRed = Color(0xFFD32F2F);
  static const Color _successGreen = Color(0xFF2E7D32);
  static const Color _disabledGrey = Color(0xFFADADAD);
  static const Color _borderDefault = Color(0xFFE0E0E0);

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

    Color borderColor = _borderDefault;
    if (hasError) borderColor = _errorRed;
    if (hasSuccess) borderColor = _successGreen;

    String? bottomText = widget.helperText;
    Color bottomTextColor = const Color(0xFF757575);
    if (hasError) { bottomText = widget.errorText; bottomTextColor = _errorRed; }
    else if (hasSuccess) { bottomText = widget.successText; bottomTextColor = _successGreen; }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(widget.label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF424242))),
        const SizedBox(height: 4),
        TextField(
          controller: widget.controller,
          enabled: widget.enabled && !widget.isLoading,
          readOnly: widget.isReadOnly,
          obscureText: isPassword ? _obscureText : false,
          onChanged: widget.onChanged,
          decoration: InputDecoration(
            hintText: widget.placeholder,
            hintStyle: const TextStyle(color: Color(0xFFBDBDBD)),
            suffixIcon: widget.isLoading
                ? const Padding(padding: EdgeInsets.all(12), child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFEB440C))))
                : isPassword
                    ? IconButton(
                        icon: Icon(_obscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: const Color(0xFF757575)),
                        onPressed: () => setState(() => _obscureText = !_obscureText))
                    : null,
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide(color: borderColor)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: _primaryOrange, width: 2)),
            disabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: _disabledGrey)),
            filled: !widget.enabled,
            fillColor: !widget.enabled ? const Color(0xFFF5F5F5) : null,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
        if (bottomText != null) ...[
          const SizedBox(height: 4),
          Text(bottomText, style: TextStyle(fontSize: 12, color: bottomTextColor)),
        ],
      ],
    );
  }

  Widget _buildOtp() {
    final int count = widget.kind == IldsTextFieldKind.otpX6 ? 6 : 4;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(count, (index) => Container(
        width: 48, height: 56,
        margin: EdgeInsets.only(right: index < count - 1 ? 8 : 0),
        child: TextField(
          textAlign: TextAlign.center,
          maxLength: 1,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            counterText: '',
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFE0E0E0))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: Color(0xFFEB440C), width: 2)),
            contentPadding: EdgeInsets.zero,
          ),
        ),
      )),
    );
  }
}