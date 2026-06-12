// tool/generate_ilds_tokens.dart
//
// Code generator: tokens/tokens.json (W3C DTCG, Figma source of truth)
//   -> lib/design_system/ilds_tokens.dart
//
// Run from repo root:
//   dart run tool/generate_ilds_tokens.dart
//
// Design decisions baked in (see ILDS_PROJECT_MASTER decisions, Jun 2026):
//   - Figma tokens.json is the source of truth for COLOR values.
//   - A "Figma-faithful" section mirrors every Figma group verbatim
//     (primaryOrange*, neutralCoolgray*, secondaryMaroon*, informativeBlue*, ...).
//   - A "semantic alias" section preserves the legacy ILDSTokens API
//     (orange500, neutral200, blue500, ...) so existing components compile
//     unchanged. Aliases now resolve to Figma values.
//   - neutral* -> neutral-coolgray ; blue* -> informative-blue.
//   - Border radius and spacing keep their current px values (legacy scale),
//     flagged as a separate design decision. Figma's radius/spacing are also
//     emitted under faithful names (radius*, sp*) for new work.
//   - Typography (family, sizes, weights, line-heights) emitted from tokens.json.
//   - Border widths are not in tokens.json; kept hand-authored.

import 'dart:convert';
import 'dart:io';

void main() {
  final jsonFile = File('tokens/tokens.json');
  if (!jsonFile.existsSync()) {
    stderr.writeln('tokens/tokens.json not found. Run from repo root.');
    exitCode = 1;
    return;
  }

  final root = jsonDecode(jsonFile.readAsStringSync()) as Map<String, dynamic>;
  final global = root['global'] as Map<String, dynamic>;
  final colors = global['color'] as Map<String, dynamic>;
  final spacing = global['spacing'] as Map<String, dynamic>;
  final radius = global['borderRadius'] as Map<String, dynamic>;
  final typography = global['typography'] as Map<String, dynamic>?;

  final buf = StringBuffer();
  buf.writeln('// GENERATED FILE — DO NOT EDIT BY HAND.');
  buf.writeln('// Source: tokens/tokens.json  Generator: tool/generate_ilds_tokens.dart');
  buf.writeln('// Regenerate: dart run tool/generate_ilds_tokens.dart');
  buf.writeln("import 'package:flutter/material.dart';");
  buf.writeln();
  buf.writeln('class ILDSTokens {');

  // ── Figma-faithful colours ────────────────────────────────────────────────
  buf.writeln('  // ===== Figma-faithful colours (source of truth) =====');
  colors.forEach((group, steps) {
    final prefix = _camel(group);
    buf.writeln('  // $group');
    (steps as Map<String, dynamic>).forEach((stepKey, token) {
      final hex = (token as Map<String, dynamic>)[r'$value'] as String;
      final name = '$prefix${_stepSuffix(stepKey)}';
      buf.writeln('  static const Color $name = ${_color(hex)};');
    });
  });
  buf.writeln();

  // ── Figma-faithful spacing (literal px) ───────────────────────────────────
  buf.writeln('  // ===== Figma-faithful spacing (px) =====');
  final spEntries = spacing.entries.toList()
    ..sort((a, b) => _num(a.value).compareTo(_num(b.value)));
  for (final e in spEntries) {
    final v = _num(e.value);
    buf.writeln('  static const double sp${_int(v)} = $v;');
  }
  buf.writeln();

  // ── Figma-faithful border radius ──────────────────────────────────────────
  buf.writeln('  // ===== Figma-faithful border radius (px) =====');
  radius.forEach((key, token) {
    final v = _num(token);
    buf.writeln('  static const double ${_radiusName(key)} = $v;');
  });
  buf.writeln();

  // ── Semantic aliases (legacy API) ─────────────────────────────────────────
  buf.writeln('  // ===== Semantic aliases (backward-compatible API) =====');
  buf.writeln('  // Colours resolve to Figma values; names preserved so components compile.');

  _aliasGroup(buf, 'orange', 'primaryOrange', const [50, 100, 200, 300, 400, 500, 600, 700]);
  _aliasGroup(buf, 'red', 'errorRed', const [50, 100, 300, 500, 600, 700]);
  _aliasGroup(buf, 'green', 'successGreen', const [50, 100, 300, 500, 600, 700]);
  _aliasGroup(buf, 'amber', 'warningAmber', const [50, 100, 300, 500, 600, 700]);
  _aliasGroup(buf, 'blue', 'informativeBlue', const [50, 100, 300, 500, 600, 700]);

  buf.writeln('  // neutral* -> neutral-coolgray (mapped to preserve the current ramp)');
  const neutralMap = <String, String>{
    'neutral0': 'globalWhite000',
    'neutral50': 'neutralCoolgray50',
    'neutral100': 'neutralCoolgray100',
    'neutral200': 'neutralCoolgray300',
    'neutral300': 'neutralCoolgray500',
    'neutral400': 'neutralCoolgray600',
    'neutral500': 'neutralCoolgray800',
    'neutral600': 'neutralCoolgray900',
    'neutral900': 'globalBlack1000',
    'white': 'globalWhite000',
  };
  neutralMap.forEach((alias, target) {
    buf.writeln('  static const Color $alias = $target;');
  });
  buf.writeln();

  // ── Legacy scales kept at current px (per keep_px decision) ────────────────
  buf.writeln('  // ===== Legacy radius scale (current px — separate design decision) =====');
  buf.writeln('  static const double borderRadiusXs   = 2.0;');
  buf.writeln('  static const double borderRadiusSm   = 4.0;');
  buf.writeln('  static const double borderRadiusMd   = 8.0;');
  buf.writeln('  static const double borderRadiusLg   = 12.0;');
  buf.writeln('  static const double borderRadiusXl   = 16.0;');
  buf.writeln('  static const double borderRadius2xl  = 24.0;');
  buf.writeln('  static const double borderRadiusFull = 9999.0;');
  buf.writeln();
  buf.writeln('  // ===== Legacy spacing scale (current px) =====');
  buf.writeln('  static const double spacing1  = 4.0;');
  buf.writeln('  static const double spacing2  = 8.0;');
  buf.writeln('  static const double spacing3  = 12.0;');
  buf.writeln('  static const double spacing4  = 16.0;');
  buf.writeln('  static const double spacing5  = 20.0;');
  buf.writeln('  static const double spacing6  = 24.0;');
  buf.writeln('  static const double spacing8  = 32.0;');
  buf.writeln('  static const double spacing10 = 40.0;');
  buf.writeln('  static const double spacing12 = 48.0;');
  buf.writeln('  static const double spacing16 = 64.0;');
  buf.writeln();
  buf.writeln('  // ===== Border width (not in tokens.json) =====');
  buf.writeln('  static const double borderWidth1 = 1.0;');
  buf.writeln('  static const double borderWidth2 = 2.0;');
  buf.writeln('  static const double borderWidth4 = 4.0;');
  buf.writeln();

  // ── Typography (flat DTCG tokens) ─────────────────────────────────────────
  if (typography != null) {
    buf.writeln('  // ===== Typography (source of truth) =====');
    final families = typography['font-family'] as Map<String, dynamic>?;
    if (families != null) {
      families.forEach((key, token) {
        final v = (token as Map<String, dynamic>)[r'$value'] as String;
        buf.writeln("  static const String fontFamily${_cap(key)} = '$v';");
      });
    }
    final sizes = typography['font-size'] as Map<String, dynamic>?;
    if (sizes != null) {
      sizes.forEach((key, token) {
        final v = _num(token);
        buf.writeln('  static const double fontSize${_cap(key)} = $v;');
      });
    }
    final weights = typography['font-weight'] as Map<String, dynamic>?;
    if (weights != null) {
      weights.forEach((key, token) {
        final v = int.parse((token as Map<String, dynamic>)[r'$value'].toString());
        final dartName = _cap(key);
        buf.writeln('  static const FontWeight fontWeight$dartName = FontWeight.w$v;');
      });
    }
    final leading = typography['line-height'] as Map<String, dynamic>?;
    if (leading != null) {
      leading.forEach((key, token) {
        final v = _num(token);
        buf.writeln('  static const double lineHeight$key = $v;');
      });
    }
    buf.writeln();
  }

  buf.writeln('}');
  buf.writeln();

  // ── Theme (unchanged) ─────────────────────────────────────────────────────
  buf.writeln('class ILDSTheme {');
  buf.writeln('  static ThemeData data() {');
  buf.writeln('    return ThemeData(');
  buf.writeln('      useMaterial3: true,');
  buf.writeln('      fontFamily: ILDSTokens.fontFamilyPrimary,');
  buf.writeln('      colorScheme: ColorScheme.fromSeed(');
  buf.writeln('        seedColor: ILDSTokens.orange500,');
  buf.writeln('        primary: ILDSTokens.orange500,');
  buf.writeln('        surface: ILDSTokens.white,');
  buf.writeln('      ),');
  buf.writeln('      textTheme: const TextTheme(');
  buf.writeln('        bodyLarge: TextStyle(fontFamily: ILDSTokens.fontFamilyPrimary, fontWeight: ILDSTokens.fontWeightRegular),');
  buf.writeln('        titleLarge: TextStyle(fontFamily: ILDSTokens.fontFamilyPrimary, fontWeight: ILDSTokens.fontWeightBold),');
  buf.writeln('      ),');
  buf.writeln('    );');
  buf.writeln('  }');
  buf.writeln('}');

  File('lib/design_system/ilds_tokens.dart').writeAsStringSync(buf.toString());
  stdout.writeln('Wrote lib/design_system/ilds_tokens.dart');
}

void _aliasGroup(StringBuffer buf, String legacy, String target, List<int> steps) {
  buf.writeln('  // $legacy* -> $target');
  for (final s in steps) {
    buf.writeln('  static const Color $legacy$s = $target$s;');
  }
}

String _camel(String group) {
  final parts = group.trim().split('-');
  return parts.first +
      parts.skip(1).map((p) => p.isEmpty ? '' : p[0].toUpperCase() + p.substring(1)).join();
}

String _stepSuffix(String key) {
  final k = key.trim();
  if (RegExp(r'^\d+$').hasMatch(k)) return k;
  return k
      .split('-')
      .map((p) => p.isEmpty ? '' : p[0].toUpperCase() + p.substring(1))
      .join();
}

String _radiusName(String key) {
  final k = key.trim();
  final cap = k.isEmpty ? k : k[0].toUpperCase() + k.substring(1);
  return 'radius$cap';
}

String _color(String hex) {
  final h = hex.replaceAll('#', '').toUpperCase();
  return 'Color(0xFF$h)';
}

num _num(dynamic token) {
  final v = token is Map ? token[r'$value'] : token;
  return num.parse(v.toString());
}

String _int(num v) => v == v.toInt() ? v.toInt().toString() : v.toString();

String _cap(String key) {
  final k = key.trim();
  if (k.isEmpty) return k;
  if (RegExp(r'^\d+$').hasMatch(k)) return k;
  return k[0].toUpperCase() + k.substring(1);
}
