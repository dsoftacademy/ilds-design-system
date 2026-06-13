import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ilds_design_system/ilds_tab.dart';
import 'helpers/golden_test_helpers.dart';

const _tabs = [
  IldsTabItem(label: 'Tab 1'),
  IldsTabItem(label: 'Tab 2'),
  IldsTabItem(label: 'Tab 3', isDisabled: true),
];

void main() {
  setUpAll(loadIldsTestFonts);

  group('IldsTabBar goldens', () {
    testWidgets('high-selected', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsTabBar(
          tabs: _tabs,
          selectedIndex: 0,
          emphasis: IldsTabEmphasis.high,
          onTabChanged: (_) {},
        ),
        width: 400,
        height: 80,
      ));
      await tester.pumpAndSettle();
      await expectLater(
        find.byType(IldsTabBar),
        matchesGoldenFile('$goldenDir/tabs_high_selected.png'),
      );
    });

    testWidgets('medium-selected-underline', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsTabBar(
          tabs: _tabs,
          selectedIndex: 1,
          emphasis: IldsTabEmphasis.medium,
          onTabChanged: (_) {},
        ),
        width: 400,
        height: 80,
      ));
      await tester.pumpAndSettle();
      await expectLater(
        find.byType(IldsTabBar),
        matchesGoldenFile('$goldenDir/tabs_medium_selected_underline.png'),
      );
    });

    testWidgets('disabled-tab', (tester) async {
      await tester.pumpWidget(goldenWrap(
        IldsTabBar(
          tabs: _tabs,
          selectedIndex: 2,
          emphasis: IldsTabEmphasis.high,
          onTabChanged: (_) {},
        ),
        width: 400,
        height: 80,
      ));
      await tester.pumpAndSettle();
      await expectLater(
        find.byType(IldsTabBar),
        matchesGoldenFile('$goldenDir/tabs_disabled.png'),
      );
    });
  });
}
