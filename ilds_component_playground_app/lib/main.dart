import 'package:flutter/material.dart';
import 'package:ilds_design_system/ilds_accordion.dart';
import 'package:ilds_design_system/ilds_badge.dart';
import 'package:ilds_design_system/ilds_checkbox.dart';
import 'package:ilds_design_system/ilds_pagination.dart';
import 'package:ilds_design_system/ilds_radio.dart';
import 'package:ilds_design_system/ilds_search.dart';
import 'package:ilds_design_system/ilds_selection_button.dart';
import 'package:ilds_design_system/ilds_switch.dart';
import 'package:ilds_design_system/ilds_tab.dart';
import 'package:ilds_design_system/ilds_tag.dart';
import 'package:ilds_design_system/ilds_text_area.dart';
import 'package:ilds_design_system/ilds_text_link.dart';

void main() {
  runApp(const IldsStandalonePlaygroundApp());
}

class IldsStandalonePlaygroundApp extends StatelessWidget {
  const IldsStandalonePlaygroundApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'ILDS Standalone Playground',
      theme: ThemeData(useMaterial3: true),
      home: const IldsStandalonePlaygroundPage(),
    );
  }
}

class IldsStandalonePlaygroundPage extends StatefulWidget {
  const IldsStandalonePlaygroundPage({super.key});

  @override
  State<IldsStandalonePlaygroundPage> createState() => _IldsStandalonePlaygroundPageState();
}

class _IldsStandalonePlaygroundPageState extends State<IldsStandalonePlaygroundPage> {
  int selectedNav = 0;
  dynamic radioValue = 'A';
  IldsCheckboxState checkboxState = IldsCheckboxState.unchecked;
  bool switchValue = false;
  int selectedTab = 0;
  int currentPage = 3;
  bool selectionOn = false;
  bool tagActive = false;
  final TextEditingController searchController = TextEditingController();
  final TextEditingController textAreaController = TextEditingController();

  @override
  void dispose() {
    searchController.dispose();
    textAreaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final List<String> sections = <String>[
      'Radio',
      'Checkbox',
      'Switch',
      'Text Area',
      'Tab',
      'Pagination',
      'Selection Button',
      'Badge',
      'Tag',
      'Accordion',
      'Text Link',
      'Search',
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('ILDS Standalone Component Playground'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(36),
          child: Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 8),
            child: Row(
              children: const [
                Icon(Icons.sync, size: 14),
                SizedBox(width: 8),
                Text(
                  'Repo-linked live preview (hot reload reflects component updates).',
                  style: TextStyle(fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Row(
        children: [
          SizedBox(
            width: 128,
            child: NavigationRail(
              selectedIndex: selectedNav,
              onDestinationSelected: (index) => setState(() => selectedNav = index),
              labelType: NavigationRailLabelType.all,
              destinations: sections
                  .map((label) => NavigationRailDestination(
                        icon: const Icon(Icons.circle_outlined, size: 16),
                        selectedIcon: const Icon(Icons.check_circle_outline, size: 16),
                        label: Text(label),
                      ))
                  .toList(),
            ),
          ),
          const VerticalDivider(width: 1),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: _buildSelectedPanel(selectedNav),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedPanel(int index) {
    switch (index) {
      case 0:
        return _panel('Radio', [
          IldsRadioGroup(
            options: const [
              IldsRadioOption(value: 'A', label: 'Option A'),
              IldsRadioOption(value: 'B', label: 'Option B'),
            ],
            groupValue: radioValue,
            onChanged: (v) => setState(() => radioValue = v),
          ),
        ]);
      case 1:
        return _panel('Checkbox', [
          IldsCheckbox(
            label: 'Accept terms',
            state: checkboxState,
            onChanged: (value) => setState(() => checkboxState = value),
          ),
        ]);
      case 2:
        return _panel('Switch', [
          IldsSwitch(
            value: switchValue,
            label: 'Enable notifications',
            onChanged: (value) => setState(() => switchValue = value),
          ),
        ]);
      case 3:
        return _panel('Text Area', [
          IldsTextArea(
            label: 'Notes',
            placeholder: 'Type something...',
            controller: textAreaController,
            showCharCount: true,
            maxLength: 150,
            onChanged: (_) => setState(() {}),
          ),
        ]);
      case 4:
        return _panel('Tab', [
          IldsTabBar(
            tabs: const [
              IldsTabItem(label: 'Overview'),
              IldsTabItem(label: 'Details'),
              IldsTabItem(label: 'Settings'),
            ],
            selectedIndex: selectedTab,
            onTabChanged: (index) => setState(() => selectedTab = index),
          ),
        ]);
      case 5:
        return _panel('Pagination', [
          IldsPagination(
            currentPage: currentPage,
            totalPages: 20,
            onPageChanged: (page) => setState(() => currentPage = page),
            variant: IldsPaginationVariant.extended,
          ),
        ]);
      case 6:
        return _panel('Selection Button', [
          IldsSelectionButton(
            label: 'Filter',
            isSelected: selectionOn,
            variant: IldsSelectionButtonVariant.labelWithSuffix,
            suffixIcon: Icons.keyboard_arrow_down,
            onTap: () => setState(() => selectionOn = !selectionOn),
          ),
        ]);
      case 7:
        return _panel('Badge', const [
          IldsBadge(
            label: 'Success',
            variant: IldsBadgeVariant.success,
            prefixIcon: Icons.check_circle_outline,
          ),
        ]);
      case 8:
        return _panel('Tag', [
          IldsTag(
            label: 'Active tag',
            isActive: tagActive,
            prefixIcon: Icons.label_outline,
            onTap: () => setState(() => tagActive = !tagActive),
            onRemove: () => setState(() => tagActive = false),
          ),
        ]);
      case 9:
        return _panel('Accordion', const [
          IldsAccordion(
            title: 'What is ILDS?',
            initiallyOpen: true,
            content: Text('This area helps validate open/close interactions in real time.'),
          ),
        ]);
      case 10:
        return _panel('Text Link', [
          IldsTextLink(
            label: 'Open docs',
            onTap: () {},
            suffixIcon: Icons.open_in_new,
          ),
        ]);
      case 11:
        return _panel('Search', [
          IldsSearch(
            controller: searchController,
            onChanged: (_) => setState(() {}),
            onClear: () => setState(() {}),
          ),
        ]);
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _panel(String title, List<Widget> children) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(title),
        ...children,
      ],
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
    );
  }
}
