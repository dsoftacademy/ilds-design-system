import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_toast.dart';

void main() {
  testWidgets('IldsToast.show renders in overlay without layout exception', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Builder(
          builder: (context) => Scaffold(
            body: ElevatedButton(
              onPressed: () => IldsToast.show(
                context,
                title: 'Info',
                message: 'Toast preview message.',
                variant: IldsToastVariant.info,
                showClose: true,
              ),
              child: const Text('Show toast'),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Show toast'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    expect(find.byType(IldsToast), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.pump(const Duration(seconds: 5));
  });
}
