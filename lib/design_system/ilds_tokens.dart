// lib/design_system/ilds_tokens.dart
import 'package:flutter/material.dart';

class ILDSTokens {
  // Brand Colors
  static const Color orange500 = Color(0xFFE8440C);
  static const Color orange50 = Color(0xFFFDF0EB);
  
  // Neutral Colors
  static const Color neutral900 = Color(0xFF111111);
  static const Color neutral400 = Color(0xFF6B6B6B);
  static const Color neutral200 = Color(0xFFE0E0E0);
  static const Color neutral100 = Color(0xFFF4F4F4);
  static const Color white = Color(0xFFFFFFFF);

  // Border Radius
  static const double borderRadiusMd = 8.0;
  static const double borderRadiusFull = 9999.0;
}

class ILDSTheme {
  static ThemeData data() {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Mulish',
      colorScheme: ColorScheme.fromSeed(
        seedColor: ILDSTokens.orange500,
        primary: ILDSTokens.orange500,
        surface: ILDSTokens.white,
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(fontFamily: 'Mulish', fontWeight: FontWeight.w400),
        titleLarge: TextStyle(fontFamily: 'Mulish', fontWeight: FontWeight.w700),
      ),
    );
  }
}
