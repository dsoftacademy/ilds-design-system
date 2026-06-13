import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_badge.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsBadge goldens', () {
    for (final variant in IldsBadgeVariant.values) {
      if (variant == IldsBadgeVariant.skeleton) continue;
      testWidgets(variant.name, (tester) async {
        await tester.pumpWidget(goldenWrap(
          IldsBadge(label: 'Label', variant: variant),
          width: 160,
          height: 60,
        ));
        await expectLater(
          find.byType(IldsBadge),
          matchesGoldenFile('$goldenDir/badge_${variant.name}.png'),
        );
      });
    }
  });
}
