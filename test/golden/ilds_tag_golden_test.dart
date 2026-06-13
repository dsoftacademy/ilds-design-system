import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_tag.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsTag goldens', () {
    testWidgets('default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTag(label: 'Label'),
        width: 160,
        height: 60,
      ));
      await expectLater(
        find.byType(IldsTag),
        matchesGoldenFile('$goldenDir/tag_default.png'),
      );
    });

    testWidgets('active', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTag(label: 'Label', isActive: true),
        width: 160,
        height: 60,
      ));
      await expectLater(
        find.byType(IldsTag),
        matchesGoldenFile('$goldenDir/tag_active.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTag(label: 'Label', isDisabled: true),
        width: 160,
        height: 60,
      ));
      await expectLater(
        find.byType(IldsTag),
        matchesGoldenFile('$goldenDir/tag_disabled.png'),
      );
    });
  });
}
