import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_toast.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsToast goldens', () {
    testWidgets('info', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsToast(message: 'Toast message', variant: IldsToastVariant.info),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsToast),
        matchesGoldenFile('$goldenDir/toast_info.png'),
      );
    });

    testWidgets('success', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsToast(message: 'Toast message', variant: IldsToastVariant.success),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsToast),
        matchesGoldenFile('$goldenDir/toast_success.png'),
      );
    });

    testWidgets('warning', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsToast(message: 'Toast message', variant: IldsToastVariant.warning),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsToast),
        matchesGoldenFile('$goldenDir/toast_warning.png'),
      );
    });

    testWidgets('error', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsToast(message: 'Toast message', variant: IldsToastVariant.error),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsToast),
        matchesGoldenFile('$goldenDir/toast_error.png'),
      );
    });
  });
}
