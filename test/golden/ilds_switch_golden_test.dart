import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_switch.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsSwitch goldens', () {
    testWidgets('off', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsSwitch(label: 'Label', value: false, onChanged: (_) {}),
      ));
      await expectLater(
        find.byType(IldsSwitch),
        matchesGoldenFile('$goldenDir/switch_off.png'),
      );
    });

    testWidgets('on', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsSwitch(label: 'Label', value: true, onChanged: (_) {}),
      ));
      await expectLater(
        find.byType(IldsSwitch),
        matchesGoldenFile('$goldenDir/switch_on.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsSwitch(label: 'Label', value: false, isDisabled: true, onChanged: (_) {}),
      ));
      await expectLater(
        find.byType(IldsSwitch),
        matchesGoldenFile('$goldenDir/switch_disabled.png'),
      );
    });
  });
}
