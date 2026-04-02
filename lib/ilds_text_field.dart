import 'package:flutter/material.dart';
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
    final bool hasError   = widget.errorText != null;
    final bool hasSuccess = widget.successText != null;

    // Token: color.red.600 (error) | color.green.600 (success) | color.neutral.200 (default)
    Color borderColor = ILDSTokens.neutral200;
    if (hasError)   borderColor = ILDSTokens.red600;
    if (hasSuccess) borderColor = ILDSTokens.green600;

    // Token: color.neutral.400 (helper) | color.red.600 (error) | color.green.600 (success)
    String? bottomText      = widget.helperText;
    Color   bottomTextColor = ILDSTokens.neutral400;
    if (hasError) {
      bottomText      = widget.errorText;
      bottomTextColor = ILDSTokens.red600;
    } else if (hasSuccess) {
      bottomText      = widget.successText;
      bottomTextColor = ILDSTokens.green600;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Token: color.neutral.500, fontWeight.medium
        Text(
          widget.label,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: ILDSTokens.fontWeightMedium,
            color: ILDSTokens.neutral500,
          ),
        ),
        const SizedBox(height: 4),
        TextField(
          controller: widget.controller,
          enabled: widget.enabled && !widget.isLoading,
          readOnly: widget.isReadOnly,
          obscureText: isPassword ? _obscureText : false,
          onChanged: widget.onChanged,
          decoration: InputDecoration(
            hintText: widget.placeholder,
            // Token: color.neutral.300 — placeholder / hint text
            hintStyle: const TextStyle(color: ILDSTokens.neutral300),
            suffixIcon: widget.isLoading
                ? Padding(
                    padding: const EdgeInsets.all(12),
                    child: SizedBox(
                      width: 20,
                      height: 20,
                      // Token: color.orange.500 — loading indicator
                      child: CircularProgressIndicator(
                        strokeWidth: ILDSTokens.borderWidth2,
                        color: ILDSTokens.orange500,
                      ),
                    ),
                  )
                : isPassword
                    ? IconButton(
                        // Token: color.neutral.400 — secondary icon
                        icon: Icon(
                          _obscureText
                              ? Icons.visibility_off_outlined
                              : Icons.visibility_outlined,
                          color: ILDSTokens.neutral400,
                        ),
                        onPressed: () =>
                            setState(() => _obscureText = !_obscureText),
                      )
                    : null,
            // Token: borderRadius.md, color.neutral.200 (enabled border)
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
              borderSide: BorderSide(color: borderColor),
            ),
            // Token: borderRadius.md, color.orange.500, borderWidth.2 (focus ring)
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
              borderSide: const BorderSide(
                color: ILDSTokens.orange500,
                width: ILDSTokens.borderWidth2,
              ),
            ),
            // Token: borderRadius.md, color.neutral.300 (disabled border)
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
              borderSide: const BorderSide(color: ILDSTokens.neutral300),
            ),
            filled: !widget.enabled,
            // Token: color.neutral.100 — disabled fill
            fillColor: !widget.enabled ? ILDSTokens.neutral100 : null,
            contentPadding: const EdgeInsets.symmetric(
              horizontal: ILDSTokens.spacing4,
              vertical: 14,
            ),
          ),
        ),
        if (bottomText != null) ...[
          const SizedBox(height: 4),
          Text(
            bottomText,
            style: TextStyle(fontSize: 12, color: bottomTextColor),
          ),
        ],
      ],
    );
  }

  Widget _buildOtp() {
    final int count = widget.kind == IldsTextFieldKind.otpX6 ? 6 : 4;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(
        count,
        (index) => Container(
          width: 48,
          height: 56,
          margin: EdgeInsets.only(right: index < count - 1 ? ILDSTokens.spacing2 : 0),
          child: TextField(
            textAlign: TextAlign.center,
            maxLength: 1,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              counterText: '',
              // Token: borderRadius.md, color.neutral.200
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
                borderSide: const BorderSide(color: ILDSTokens.neutral200),
              ),
              // Token: borderRadius.md, color.orange.500, borderWidth.2
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
  }
}
