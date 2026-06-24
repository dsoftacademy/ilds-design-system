import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_scrollbar.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsScrollbar goldens', () {
    testWidgets('list-with-thumb', (tester) async {
      final controller = ScrollController();

      await tester.pumpWidget(goldenWrap(
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: SizedBox(
            height: 160,
            width: 320,
            child: PrimaryScrollController.none(
              child: IldsScrollbar(
                controller: controller,
                child: ListView.builder(
                  controller: controller,
                  physics: const ClampingScrollPhysics(),
                  primary: false,
                  itemCount: 24,
                  itemBuilder: (_, index) => ListTile(
                    dense: true,
                    title: Text('Row ${index + 1}'),
                  ),
                ),
              ),
            ),
          ),
        ),
        width: 360,
        height: 200,
      ));
      await tester.pumpAndSettle();
      controller.jumpTo(48);
      await tester.pumpAndSettle();

      await expectLater(
        find.byType(IldsScrollbar),
        matchesGoldenFile('$goldenDir/scrollbar_list_thumb.png'),
      );

      controller.dispose();
    });
  });
}
