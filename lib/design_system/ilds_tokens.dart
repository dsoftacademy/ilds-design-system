// lib/design_system/ilds_tokens.dart
import 'package:flutter/material.dart';

class ILDSTokens {
  // ── Orange ────────────────────────────────────────────────────────────────
  static const Color orange50  = Color(0xFFFDF0EB); // Hover surface
  static const Color orange100 = Color(0xFFFAD9CC);
  static const Color orange200 = Color(0xFFF5B399); // Disabled primary bg
  static const Color orange300 = Color(0xFFF08D66);
  static const Color orange400 = Color(0xFFEB6733);
  static const Color orange500 = Color(0xFFE8440C); // Primary brand
  static const Color orange600 = Color(0xFFB93409); // Hover
  static const Color orange700 = Color(0xFF8A2807); // Pressed / active

  // ── Neutral ───────────────────────────────────────────────────────────────
  static const Color neutral0   = Color(0xFFFFFFFF); // Pure white
  static const Color neutral50  = Color(0xFFFAFAFA); // Off-white surface
  static const Color neutral100 = Color(0xFFF4F4F4); // Light grey background
  static const Color neutral200 = Color(0xFFE0E0E0); // Default border
  static const Color neutral300 = Color(0xFFADADAD); // Disabled text / placeholder
  static const Color neutral400 = Color(0xFF6B6B6B); // Secondary icon / subtle text
  static const Color neutral500 = Color(0xFF3D3D3D); // Secondary body text
  static const Color neutral600 = Color(0xFF2A2A2A);
  static const Color neutral900 = Color(0xFF111111); // Primary body text — near black
  static const Color white      = Color(0xFFFFFFFF); // Alias for neutral0

  // ── Blue ──────────────────────────────────────────────────────────────────
  static const Color blue50  = Color(0xFFEFF6FF); // Info surface
  static const Color blue100 = Color(0xFFDBEAFE);
  static const Color blue300 = Color(0xFF93C5FD);
  static const Color blue500 = Color(0xFF2563EB); // Info / link colour
  static const Color blue600 = Color(0xFF1D4ED8);
  static const Color blue700 = Color(0xFF1E40AF);

  // ── Green ─────────────────────────────────────────────────────────────────
  static const Color green50  = Color(0xFFDCFCE7); // Success surface
  static const Color green100 = Color(0xFFBBF7D0);
  static const Color green300 = Color(0xFF86EFAC);
  static const Color green500 = Color(0xFF22C55E);
  static const Color green600 = Color(0xFF16A34A); // Success state colour
  static const Color green700 = Color(0xFF15803D);

  // ── Red ───────────────────────────────────────────────────────────────────
  static const Color red50  = Color(0xFFFEE2E2); // Error surface
  static const Color red100 = Color(0xFFFECACA);
  static const Color red300 = Color(0xFFFCA5A5);
  static const Color red500 = Color(0xFFEF4444);
  static const Color red600 = Color(0xFFDC2626); // Error / destructive colour
  static const Color red700 = Color(0xFFB91C1C);

  // ── Amber ─────────────────────────────────────────────────────────────────
  static const Color amber50  = Color(0xFFFEF9C3); // Warning surface
  static const Color amber100 = Color(0xFFFEF08A);
  static const Color amber300 = Color(0xFFFCD34D);
  static const Color amber500 = Color(0xFFF59E0B); // Warning colour
  static const Color amber600 = Color(0xFFD97706);
  static const Color amber700 = Color(0xFFB45309);

  // ── Border Radius ─────────────────────────────────────────────────────────
  static const double borderRadiusXs   = 2.0;
  static const double borderRadiusSm   = 4.0;
  static const double borderRadiusMd   = 8.0;    // Button, input
  static const double borderRadiusLg   = 12.0;   // Card
  static const double borderRadiusXl   = 16.0;   // Modal, bottom sheet
  static const double borderRadius2xl  = 24.0;
  static const double borderRadiusFull = 9999.0; // Badge, chip, pill

  // ── Spacing ───────────────────────────────────────────────────────────────
  static const double spacing1  = 4.0;
  static const double spacing2  = 8.0;
  static const double spacing3  = 12.0;
  static const double spacing4  = 16.0;
  static const double spacing5  = 20.0;
  static const double spacing6  = 24.0;
  static const double spacing8  = 32.0;
  static const double spacing10 = 40.0;
  static const double spacing12 = 48.0;
  static const double spacing16 = 64.0;

  // ── Border Width ──────────────────────────────────────────────────────────
  static const double borderWidth1 = 1.0;
  static const double borderWidth2 = 2.0; // Focus ring
  static const double borderWidth4 = 4.0;

  // ── Font Weights ──────────────────────────────────────────────────────────
  static const FontWeight fontWeightRegular = FontWeight.w400;
  static const FontWeight fontWeightMedium  = FontWeight.w500;
  static const FontWeight fontWeightBold    = FontWeight.w700;
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
        bodyLarge: TextStyle(
          fontFamily: 'Mulish',
          fontWeight: ILDSTokens.fontWeightRegular,
        ),
        titleLarge: TextStyle(
          fontFamily: 'Mulish',
          fontWeight: ILDSTokens.fontWeightBold,
        ),
      ),
    );
  }
}
