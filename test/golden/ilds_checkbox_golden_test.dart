import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_checkbox.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsCheckbox goldens', () {
    testWidgets('unchecked', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsCheckbox(
          label: 'Label',
          state: IldsCheckboxState.unchecked,
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsCheckbox),
        matchesGoldenFile('$goldenDir/checkbox_unchecked.png'),
      );
    });

    testWidgets('checked', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsCheckbox(
          label: 'Label',
          state: IldsCheckboxState.checked,
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsCheckbox),
        matchesGoldenFile('$goldenDir/checkbox_checked.png'),
      );
    });

    testWidgets('indeterminate', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsCheckbox(
          label: 'Label',
          state: IldsCheckboxState.indeterminate,
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsCheckbox),
        matchesGoldenFile('$goldenDir/checkbox_indeterminate.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsCheckbox(
          label: 'Label',
          state: IldsCheckboxState.unchecked,
          isDisabled: true,
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsCheckbox),
        matchesGoldenFile('$goldenDir/checkbox_disabled.png'),
      );
    });

    testWidgets('error', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsCheckbox(
          label: 'Label',
          state: IldsCheckboxState.unchecked,
          hasError: true,
          onChanged: (_) {},
        ),
      ));
      await expectLater(
        find.byType(IldsCheckbox),
        matchesGoldenFile('$goldenDir/checkbox_error.png'),
      );
    });
  });
}
