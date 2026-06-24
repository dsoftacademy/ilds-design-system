import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_selection_button.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsSelectionButton goldens', () {
    testWidgets('unselected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsSelectionButton(
          label: 'Unselected',
          isSelected: false,
          onTap: () {},
        ),
        width: 200,
        height: 56,
      ));
      await expectLater(
        find.byType(IldsSelectionButton),
        matchesGoldenFile('$goldenDir/selection_button_unselected.png'),
      );
    });

    testWidgets('selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsSelectionButton(
          label: 'Selected',
          isSelected: true,
          onTap: () {},
        ),
        width: 200,
        height: 56,
      ));
      await expectLater(
        find.byType(IldsSelectionButton),
        matchesGoldenFile('$goldenDir/selection_button_selected.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsSelectionButton(
          label: 'Disabled',
          isSelected: false,
          isDisabled: true,
          onTap: null,
        ),
        width: 200,
        height: 56,
      ));
      await expectLater(
        find.byType(IldsSelectionButton),
        matchesGoldenFile('$goldenDir/selection_button_disabled.png'),
      );
    });
  });
}
