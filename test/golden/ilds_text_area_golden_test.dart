import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_text_area.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsTextArea goldens', () {
    testWidgets('default-with-counter', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextArea(
          label: 'Notes',
          placeholder: 'Type something...',
          showCharCount: true,
          maxLength: 150,
        ),
        width: 360,
        height: 220,
      ));
      await expectLater(
        find.byType(IldsTextArea),
        matchesGoldenFile('$goldenDir/text_area_default.png'),
      );
    });

    testWidgets('error', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextArea(
          label: 'Notes',
          placeholder: 'Type something...',
          errorText: 'This field is required.',
        ),
        width: 360,
        height: 220,
      ));
      await expectLater(
        find.byType(IldsTextArea),
        matchesGoldenFile('$goldenDir/text_area_error.png'),
      );
    });
  });
}
