import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_radio.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsRadio goldens', () {
    testWidgets('unselected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsRadio(
          label: 'Label',
          value: 'a',
          groupValue: 'b',
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsRadio),
        matchesGoldenFile('$goldenDir/radio_unselected.png'),
      );
    });

    testWidgets('selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsRadio(
          label: 'Label',
          value: 'a',
          groupValue: 'a',
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsRadio),
        matchesGoldenFile('$goldenDir/radio_selected.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsRadio(
          label: 'Label',
          value: 'a',
          groupValue: 'b',
          isDisabled: true,
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsRadio),
        matchesGoldenFile('$goldenDir/radio_disabled.png'),
      );
    });
  });
}
