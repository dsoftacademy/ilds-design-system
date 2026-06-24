import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_search.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsSearch goldens', () {
    testWidgets('empty', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsSearch(placeholder: 'Search'),
        width: 360,
        height: 72,
      ));
      await expectLater(
        find.byType(IldsSearch),
        matchesGoldenFile('$goldenDir/search_empty.png'),
      );
    });

    testWidgets('filled', (tester) async {
      final controller = TextEditingController(text: 'Policy number');
      addTearDown(controller.dispose);

      await tester.pumpWidget(goldenWrap(
        IldsSearch(
          placeholder: 'Search',
          controller: controller,
          onClear: () {},
        ),
        width: 360,
        height: 72,
      ));
      await tester.pumpAndSettle();

      await expectLater(
        find.byType(IldsSearch),
        matchesGoldenFile('$goldenDir/search_filled.png'),
      );
    });

    testWidgets('loading', (tester) async {
      await tester.pumpWidget(goldenWrap(
        const IldsSearch(
          placeholder: 'Search',
          isLoading: true,
        ),
        width: 360,
        height: 72,
      ));
      await expectLater(
        find.byType(IldsSearch),
        matchesGoldenFile('$goldenDir/search_loading.png'),
      );
    });
  });
}
