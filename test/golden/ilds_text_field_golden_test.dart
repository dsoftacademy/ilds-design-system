import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_text_field.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsTextField OTP goldens', () {
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
