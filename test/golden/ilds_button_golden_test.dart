import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_button.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsButton goldens', () {
    testWidgets('primary-large-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsButton(label: 'Label', onPressed: () {}),
      ));
      await expectLater(
        find.byType(IldsButton),
        matchesGoldenFile('$goldenDir/button_primary_large_default.png'),
      );
    });

    testWidgets('secondary-large-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsButton(
          label: 'Label',
          type: IldsButtonType.secondary,
          onPressed: () {},
        ),
      ));
      await expectLater(
        find.byType(IldsButton),
        matchesGoldenFile('$goldenDir/button_secondary_large_default.png'),
      );
    });

    testWidgets('tertiary-large-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsButton(
          label: 'Label',
          type: IldsButtonType.tertiary,
          onPressed: () {},
        ),
      ));
      await expectLater(
        find.byType(IldsButton),
        matchesGoldenFile('$goldenDir/button_tertiary_large_default.png'),
      );
    });

    testWidgets('primary-large-disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsButton(label: 'Label', isDisabled: true, onPressed: () {}),
      ));
      await expectLater(
        find.byType(IldsButton),
        matchesGoldenFile('$goldenDir/button_primary_large_disabled.png'),
      );
    });

    testWidgets('primary-large-loading', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsButton(label: 'Label', isLoading: true, onPressed: () {}),
      ));
      await expectLater(
        find.byType(IldsButton),
        matchesGoldenFile('$goldenDir/button_primary_large_loading.png'),
      );
    });
  });
}
