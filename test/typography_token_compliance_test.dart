import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Documented off-scale typography allowed until a future token pass.
/// Key: lib path. Value: substrings that must appear together in the same
/// TextStyle block (plus an OUTLIER comment) to permit raw numbers.
const Map<String, List<String>> _typographyOutliers = {
  'lib/ilds_badge.dart': ['fontSize: 10', 'height: 1.2', 'OUTLIER'],
};

/// Components that still derive `_fontSize()` from spacing/border tokens.
/// Tracked for a future typography pass — new components must not use this pattern.
const Set<String> _legacySpacingDerivedFontSize = {
  'lib/ilds_checkbox.dart',
  'lib/ilds_radio.dart',
  'lib/ilds_selection_button.dart',
  'lib/ilds_tag.dart',
  'lib/ilds_text_link.dart',
};

void main() {
  test('ilds_*.dart TextStyles use typography tokens', () {
    final libDir = Directory('lib');
    final files = libDir
        .listSync()
        .whereType<File>()
        .where((file) {
          final name = file.uri.pathSegments.last;
          return name.startsWith('ilds_') && name.endsWith('.dart');
        })
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));

    expect(files, isNotEmpty, reason: 'Expected lib/ilds_*.dart component files');

    final violations = <String>[];

    for (final file in files) {
      final content = file.readAsStringSync();
      final location = file.path;

      if (_derivesFontSizeFromNonTypography(content)) {
        if (_legacySpacingDerivedFontSize.contains(location)) {
          continue;
        }
        violations.add(
          '$location: font size derived from spacing/borderWidth tokens — use typography tokens',
        );
      }

      final blocks = _extractTextStyleBlocks(content);

      for (final block in blocks) {
        if (!block.contains('fontFamily: ILDSTokens.fontFamilyPrimary')) {
          violations.add('$location: missing fontFamily: ILDSTokens.fontFamilyPrimary\n$block');
        }

        if (_hasRawNumericFontSize(block) && !_isWhitelistedOutlier(location, block, 'fontSize')) {
          violations.add('$location: raw numeric fontSize\n$block');
        }

        if (_hasRawNumericHeight(block) && !_isWhitelistedOutlier(location, block, 'height')) {
          violations.add('$location: raw numeric height\n$block');
        }
      }
    }

    expect(violations, isEmpty, reason: violations.join('\n\n'));
  });
}

bool _derivesFontSizeFromNonTypography(String source) {
  final fontSizeMethod = RegExp(
    r'double\s+_fontSize\s*\([^)]*\)\s*(?:\{[^}]*\}|=>[^;]+;)',
    dotAll: true,
  );
  for (final match in fontSizeMethod.allMatches(source)) {
    final body = match.group(0)!;
    if (body.contains('spacing') || body.contains('borderWidth')) {
      return true;
    }
  }

  return false;
}

bool _isWhitelistedOutlier(String location, String block, String property) {
  final rules = _typographyOutliers[location];
  if (rules == null) return false;
  if (!rules.every(block.contains)) return false;
  return block.contains('$property:');
}

List<String> _extractTextStyleBlocks(String source) {
  final blocks = <String>[];
  final pattern = RegExp(r'TextStyle\s*\(');
  final matches = pattern.allMatches(source);

  for (final match in matches) {
    final start = match.end - 1;
    var depth = 0;
    var index = start;

    while (index < source.length) {
      final char = source[index];
      if (char == '(') {
        depth++;
      } else if (char == ')') {
        depth--;
        if (depth == 0) {
          blocks.add(source.substring(match.start, index + 1));
          break;
        }
      }
      index++;
    }
  }

  return blocks;
}

bool _hasRawNumericFontSize(String block) {
  return RegExp(r'fontSize:\s*\d').hasMatch(block);
}

bool _hasRawNumericHeight(String block) {
  return RegExp(r'height:\s*\d').hasMatch(block);
}
