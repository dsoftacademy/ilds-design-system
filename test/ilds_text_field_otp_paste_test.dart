import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_text_field.dart';

void main() {
  testWidgets('OTP paste fills all digit cells', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: IldsTextField(
            label: 'OTP',
            kind: IldsTextFieldKind.otpX6,
          ),
        ),
      ),
    );

    final Finder firstField = find.byType(TextField).first;
    await tester.tap(firstField);
    await tester.pump();

    await tester.enterText(firstField, '123456');
    await tester.pump();

    final Iterable<TextField> fields = tester.widgetList(find.byType(TextField));
    final String combined = fields.map((f) => f.controller?.text ?? '').join();
    expect(combined, '123456');
  });

  testWidgets('OTP paste strips non-digits and fills from first cell', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: IldsTextField(
            label: 'OTP',
            kind: IldsTextFieldKind.otpX6,
          ),
        ),
      ),
    );

    final Finder thirdField = find.byType(TextField).at(2);
    await tester.tap(thirdField);
    await tester.pump();

    await tester.enterText(thirdField, '12-34-56');
    await tester.pump();

    final Iterable<TextField> fields = tester.widgetList(find.byType(TextField));
    final String combined = fields.map((f) => f.controller?.text ?? '').join();
    expect(combined, '123456');
  });
}
