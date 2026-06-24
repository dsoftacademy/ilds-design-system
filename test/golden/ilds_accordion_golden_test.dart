import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_accordion.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsAccordion goldens', () {
    testWidgets('closed', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsAccordion(
          title: 'Accordion title',
          content: Text('Accordion body content.'),
        ),
        width: 360,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsAccordion),
        matchesGoldenFile('$goldenDir/accordion_closed.png'),
      );
    });

    testWidgets('open', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsAccordion(
          title: 'Accordion title',
          initiallyOpen: true,
          content: Text('Accordion body content.'),
        ),
        width: 360,
        height: 140,
      ));
      await expectLater(
        find.byType(IldsAccordion),
        matchesGoldenFile('$goldenDir/accordion_open.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsAccordion(
          title: 'Disabled accordion',
          isDisabled: true,
          content: Text('Cannot expand.'),
        ),
        width: 360,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsAccordion),
        matchesGoldenFile('$goldenDir/accordion_disabled.png'),
      );
    });
  });
}
