import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_text_field.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsTextField goldens', () {
    testWidgets('default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextField(label: 'Label', placeholder: 'Placeholder'),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsTextField),
        matchesGoldenFile('$goldenDir/textfield_default.png'),
      );
    });

    testWidgets('error', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextField(
          label: 'Label',
          placeholder: 'Placeholder',
          errorText: 'Error message',
        ),
        width: 360,
        height: 140,
      ));
      await expectLater(
        find.byType(IldsTextField),
        matchesGoldenFile('$goldenDir/textfield_error.png'),
      );
    });

    testWidgets('success', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextField(
          label: 'Label',
          placeholder: 'Placeholder',
          successText: 'Success message',
        ),
        width: 360,
        height: 140,
      ));
      await expectLater(
        find.byType(IldsTextField),
        matchesGoldenFile('$goldenDir/textfield_success.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextField(
          label: 'Label',
          placeholder: 'Placeholder',
          enabled: false,
        ),
        width: 360,
        height: 120,
      ));
      await expectLater(
        find.byType(IldsTextField),
        matchesGoldenFile('$goldenDir/textfield_disabled.png'),
      );
    });

    testWidgets('otp-x6', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextField(
          label: 'OTP',
          kind: IldsTextFieldKind.otpX6,
        ),
        width: 360,
        height: 100,
      ));
      await expectLater(
        find.byType(IldsTextField),
        matchesGoldenFile('$goldenDir/textfield_otp_x6.png'),
      );
    });
  });
}
