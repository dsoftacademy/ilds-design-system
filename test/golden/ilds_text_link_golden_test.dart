import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/design_system/ilds_tokens.dart';
import 'package:ilds_design_system/ilds_text_link.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsTextLink goldens', () {
    testWidgets('default', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsTextLink(label: 'Learn more', onTap: () {}),
        width: 200,
        height: 48,
      ));
      await expectLater(
        find.byType(IldsTextLink),
        matchesGoldenFile('$goldenDir/text_link_default.png'),
      );
    });

    testWidgets('disabled', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsTextLink(label: 'Disabled link', isDisabled: true, onTap: null),
        width: 200,
        height: 48,
      ));
      await expectLater(
        find.byType(IldsTextLink),
        matchesGoldenFile('$goldenDir/text_link_disabled.png'),
      );
    });

    testWidgets('white-on-dark', (tester) async {
      await tester.pumpWidget(goldenWrap(
        Container(
          color: ILDSTokens.neutralCoolgray800,
          padding: const EdgeInsets.all(ILDSTokens.spacing3),
          child: IldsTextLink(
            label: 'White link',
            colour: IldsTextLinkColour.white,
            onTap: () {},
          ),
        ),
        width: 240,
        height: 64,
      ));
      await expectLater(
        find.byType(IldsTextLink),
        matchesGoldenFile('$goldenDir/text_link_white.png'),
      );
    });
  });
}
