import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

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
      final blocks = _extractTextStyleBlocks(content);

      for (final block in blocks) {
        final location = file.path;

        if (!block.contains('fontFamily: ILDSTokens.fontFamilyPrimary')) {
          violations.add('$location: missing fontFamily: ILDSTokens.fontFamilyPrimary\n$block');
        }

        if (_hasRawNumericFontSize(block)) {
          violations.add('$location: raw numeric fontSize\n$block');
        }

        if (_hasRawNumericHeight(block)) {
          violations.add('$location: raw numeric height\n$block');
        }
      }
    }

    expect(violations, isEmpty, reason: violations.join('\n\n'));
  });
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
