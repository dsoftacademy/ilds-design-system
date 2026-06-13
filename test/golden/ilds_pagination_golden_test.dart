import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_pagination.dart';
import 'helpers/golden_test_helpers.dart';

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsPagination goldens', () {
    testWidgets('page-1-selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsPagination(currentPage: 1, totalPages: 10, onPageChanged: (_) {}),
        width: 500,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsPagination),
        matchesGoldenFile('$goldenDir/pagination_page1_selected.png'),
      );
    });

    testWidgets('page-3-selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsPagination(currentPage: 3, totalPages: 10, onPageChanged: (_) {}),
        width: 500,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsPagination),
        matchesGoldenFile('$goldenDir/pagination_page3_selected.png'),
      );
    });

    testWidgets('last-page-selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsPagination(currentPage: 10, totalPages: 10, onPageChanged: (_) {}),
        width: 500,
        height: 80,
      ));
      await expectLater(
        find.byType(IldsPagination),
        matchesGoldenFile('$goldenDir/pagination_last_page.png'),
      );
    });
  });
}
