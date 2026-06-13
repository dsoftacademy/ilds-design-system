import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_chip.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsChip goldens', () {
    testWidgets('large-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.large),
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('$goldenDir/chip_large_default.png'),
      );
    });

    testWidgets('large-selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.large, isSelected: true),
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('$goldenDir/chip_large_selected.png'),
      );
    });

    testWidgets('large-disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.large, enabled: false),
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('$goldenDir/chip_large_disabled.png'),
      );
    });

    testWidgets('medium-default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsChip(label: 'Label', size: IldsChipSize.medium),
        width: 200,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsChip),
        matchesGoldenFile('$goldenDir/chip_medium_default.png'),
      );
    });
  });
}
