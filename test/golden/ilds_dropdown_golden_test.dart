import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_dropdown.dart';
import 'helpers/golden_test_helpers.dart';

const _options = [
  IldsDropdownOption(label: 'Option 1', value: '1'),
  IldsDropdownOption(label: 'Option 2', value: '2'),
  IldsDropdownOption(label: 'Option 3', value: '3'),
];

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsDropdown goldens', () {
    testWidgets('default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsDropdown(
          label: 'Label',
          placeholder: 'Select an option',
          options: _options,
        ),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsDropdown),
        matchesGoldenFile('$goldenDir/dropdown_default.png'),
      );
    });

    testWidgets('filled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsDropdown(
          label: 'Label',
          placeholder: 'Select an option',
          options: _options,
          selectedValue: '2',
        ),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsDropdown),
        matchesGoldenFile('$goldenDir/dropdown_filled.png'),
      );
    });

    testWidgets('error', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsDropdown(
          label: 'Label',
          placeholder: 'Select an option',
          options: _options,
          errorText: 'Error message',
        ),
        width: 360,
        height: 140,
      ));
      await expectLater(
        find.byType(IldsDropdown),
        matchesGoldenFile('$goldenDir/dropdown_error.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsDropdown(
          label: 'Label',
          placeholder: 'Select an option',
          options: _options,
          enabled: false,
        ),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsDropdown),
        matchesGoldenFile('$goldenDir/dropdown_disabled.png'),
      );
    });

    testWidgets('menu-open', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsDropdown(
          label: 'Label',
          placeholder: 'Select an option',
          options: _options,
          selectedValue: '2',
        ),
        width: 360,
        height: 420,
      ));
      await tester.tap(find.byType(IldsDropdown));
      await tester.pumpAndSettle();
      await expectLater(
        find.byType(MaterialApp),
        matchesGoldenFile('$goldenDir/dropdown_menu_open.png'),
      );
    });
  });
}
