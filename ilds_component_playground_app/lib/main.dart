import 'package:flutter/material.dart';
import 'package:ilds_design_system/ilds_accordion.dart';
import 'package:ilds_design_system/ilds_badge.dart';
import 'package:ilds_design_system/ilds_button.dart';
import 'package:ilds_design_system/ilds_checkbox.dart';
import 'package:ilds_design_system/ilds_chip.dart';
import 'package:ilds_design_system/ilds_dropdown.dart';
import 'package:ilds_design_system/ilds_pagination.dart';
import 'package:ilds_design_system/ilds_radio.dart';
import 'package:ilds_design_system/ilds_scrollbar.dart';
import 'package:ilds_design_system/ilds_search.dart';
import 'package:ilds_design_system/ilds_selection_button.dart';
import 'package:ilds_design_system/ilds_switch.dart';
import 'package:ilds_design_system/ilds_tab.dart';
import 'package:ilds_design_system/ilds_tag.dart';
import 'package:ilds_design_system/ilds_text_area.dart';
import 'package:ilds_design_system/ilds_text_field.dart';
import 'package:ilds_design_system/ilds_text_link.dart';
import 'package:ilds_design_system/ilds_toast.dart';

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
  int selectedTabHigh = 0;
  int selectedTabMedium = 1;
  int currentPage = 3;
  bool selectionOn = false;
  bool tagActive = false;
  bool chipSelected = false;
  String? dropdownValue;
  final TextEditingController searchController = TextEditingController();
  final TextEditingController textAreaController = TextEditingController();
  final TextEditingController textFieldController = TextEditingController(text: 'Filled value');

  static const List<String> _sections = [
    'Button',
    'Radio',
    'Checkbox',
    'Switch',
    'TextField',
    'Text Area',
    'Dropdown',
    'Tab',
    'Pagination',
    'Selection Button',
    'Badge',
    'Chip',
    'Tag',
    'Accordion',
    'Text Link',
    'Search',
    'Scrollbar',
    'Toast',
  ];

  @override
  void dispose() {
    searchController.dispose();
    textAreaController.dispose();
    textFieldController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
                Expanded(
                  child: Text(
                    'All 18 Flutter components — hot reload reflects lib/ updates.',
                    style: TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: Row(
        children: [
          SizedBox(
            width: 132,
            child: NavigationRail(
              selectedIndex: selectedNav,
              onDestinationSelected: (index) => setState(() => selectedNav = index),
              labelType: NavigationRailLabelType.all,
              destinations: _sections
                  .map(
                    (label) => NavigationRailDestination(
                      icon: const Icon(Icons.circle_outlined, size: 16),
                      selectedIcon: const Icon(Icons.check_circle_outline, size: 16),
                      label: Text(label, style: const TextStyle(fontSize: 11)),
                    ),
                  )
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
        return _buttonPanel();
      case 1:
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
      case 2:
        return _panel('Checkbox', [
          IldsCheckbox(
            label: 'Accept terms',
            state: checkboxState,
            onChanged: (value) => setState(() => checkboxState = value),
          ),
        ]);
      case 3:
        return _panel('Switch', [
          IldsSwitch(
            value: switchValue,
            label: 'Enable notifications',
            onChanged: (value) => setState(() => switchValue = value),
          ),
        ]);
      case 4:
        return _textFieldPanel();
      case 5:
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
      case 6:
        return _dropdownPanel();
      case 7:
        return _tabsPanel();
      case 8:
        return _panel('Pagination', [
          IldsPagination(
            currentPage: currentPage,
            totalPages: 20,
            onPageChanged: (page) => setState(() => currentPage = page),
            variant: IldsPaginationVariant.extended,
          ),
        ]);
      case 9:
        return _panel('Selection Button', [
          IldsSelectionButton(
            label: 'Filter',
            isSelected: selectionOn,
            variant: IldsSelectionButtonVariant.labelWithSuffix,
            suffixIcon: Icons.keyboard_arrow_down,
            onTap: () => setState(() => selectionOn = !selectionOn),
          ),
        ]);
      case 10:
        return _panel('Badge', const [
          IldsBadge(
            label: 'Success',
            variant: IldsBadgeVariant.success,
            prefixIcon: Icons.check_circle_outline,
          ),
        ]);
      case 11:
        return _chipPanel();
      case 12:
        return _panel('Tag', [
          IldsTag(
            label: 'Active tag',
            isActive: tagActive,
            prefixIcon: Icons.label_outline,
            onTap: () => setState(() => tagActive = !tagActive),
            onRemove: () => setState(() => tagActive = false),
          ),
        ]);
      case 13:
        return _panel('Accordion', const [
          IldsAccordion(
            title: 'What is ILDS?',
            initiallyOpen: true,
            content: Text('Open/close interactions for accordion parity.'),
          ),
        ]);
      case 14:
        return _panel('Text Link', [
          IldsTextLink(
            label: 'Open docs',
            onTap: () {},
            suffixIcon: Icons.open_in_new,
          ),
        ]);
      case 15:
        return _panel('Search', [
          IldsSearch(
            controller: searchController,
            onChanged: (_) => setState(() {}),
            onClear: () => setState(() {}),
          ),
        ]);
      case 16:
        return _scrollbarPanel();
      case 17:
        return _toastPanel();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _buttonPanel() {
    final types = IldsButtonType.values;
    final sizes = IldsButtonSize.values;
    final appearances = IldsButtonAppearance.values;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Button — primary / secondary / tertiary × L/M/S × normal / destructive'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final type in types)
              for (final size in sizes)
                for (final appearance in appearances)
                  IldsButton(
                    label: '${type.name} ${size.name}',
                    type: type,
                    size: size,
                    appearance: appearance,
                    onPressed: () {},
                  ),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Button — disabled + loading'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            IldsButton(label: 'Disabled primary', isDisabled: true, onPressed: () {}),
            IldsButton(
              label: 'Loading',
              isLoading: true,
              leading: const Icon(Icons.add),
              trailing: const Icon(Icons.arrow_forward),
              onPressed: () {},
            ),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Button — icon-only L / S'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            IldsButton(
              iconOnly: true,
              icon: const Icon(Icons.favorite_border),
              semanticLabel: 'Favorite large',
              onPressed: () {},
            ),
            IldsButton(
              iconOnly: true,
              size: IldsButtonSize.small,
              icon: const Icon(Icons.favorite_border),
              semanticLabel: 'Favorite small',
              onPressed: () {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _textFieldPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('TextField — standard'),
        IldsTextField(
          label: 'Email',
          placeholder: 'you@example.com',
          controller: textFieldController,
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 16),
        _sectionTitle('TextField — password + disabled'),
        const IldsTextField(
          label: 'Password',
          placeholder: '••••••••',
          kind: IldsTextFieldKind.password,
        ),
        const SizedBox(height: 12),
        const IldsTextField(
          label: 'Disabled',
          placeholder: 'Cannot edit',
          enabled: false,
        ),
        const SizedBox(height: 16),
        _sectionTitle('TextField — OTP x6'),
        const IldsTextField(
          label: 'OTP',
          kind: IldsTextFieldKind.otpX6,
        ),
      ],
    );
  }

  Widget _dropdownPanel() {
    const options = [
      IldsDropdownOption(label: 'Option one', value: '1'),
      IldsDropdownOption(label: 'Option two', value: '2'),
      IldsDropdownOption(label: 'Option three', value: '3'),
      IldsDropdownOption(label: 'Disabled option', value: '4', disabled: true),
    ];

    return _panel('Dropdown', [
      SizedBox(
        width: 360,
        child: IldsDropdown(
          label: 'Category',
          placeholder: 'Select category',
          options: options,
          selectedValue: dropdownValue,
          onChanged: (v) => setState(() => dropdownValue = v),
        ),
      ),
    ]);
  }

  Widget _tabsPanel() {
    const tabs = [
      IldsTabItem(label: 'Overview'),
      IldsTabItem(label: 'Details'),
      IldsTabItem(label: 'Settings'),
      IldsTabItem(label: 'Billing'),
      IldsTabItem(label: 'Support'),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Tabs — high emphasis / fixed / left'),
        IldsTabBar(
          tabs: tabs,
          selectedIndex: selectedTabHigh,
          emphasis: IldsTabEmphasis.high,
          type: IldsTabType.fixed,
          alignment: IldsTabAlignment.left,
          onTabChanged: (i) => setState(() => selectedTabHigh = i),
        ),
        const SizedBox(height: 24),
        _sectionTitle('Tabs — medium emphasis / scrollable / center'),
        IldsTabBar(
          tabs: tabs,
          selectedIndex: selectedTabMedium,
          emphasis: IldsTabEmphasis.medium,
          type: IldsTabType.scrollable,
          alignment: IldsTabAlignment.center,
          onTabChanged: (i) => setState(() => selectedTabMedium = i),
        ),
      ],
    );
  }

  Widget _chipPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Chip — filter'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            IldsChip(
              label: 'Default',
              isSelected: chipSelected,
              showPrefixIcon: true,
              prefixIcon: Icons.tune,
              onPressed: () => setState(() => chipSelected = !chipSelected),
            ),
            const IldsChip(label: 'Disabled', enabled: false),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Chip — tag variants'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: IldsChipTagVariant.values
              .map(
                (v) => IldsChip(
                  label: v.name,
                  kind: IldsChipKind.tag,
                  tagVariant: v,
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _scrollbarPanel() {
    return _panel('Scrollbar', [
      SizedBox(
        height: 160,
        child: IldsScrollbar(
          child: ListView.builder(
            itemCount: 24,
            itemBuilder: (_, i) => ListTile(dense: true, title: Text('Row ${i + 1}')),
          ),
        ),
      ),
    ]);
  }

  Widget _toastPanel() {
    return _panel('Toast variants', [
      Wrap(
        spacing: 8,
        runSpacing: 8,
        children: [
          for (final variant in IldsToastVariant.values)
            IldsButton(
              label: 'Show ${variant.name}',
              type: IldsButtonType.secondary,
              size: IldsButtonSize.small,
              onPressed: () {
                IldsToast.show(
                  context,
                  title: '${variant.name[0].toUpperCase()}${variant.name.substring(1)}',
                  message: 'ILDS toast ${variant.name} variant preview.',
                  variant: variant,
                  showClose: true,
                );
              },
            ),
        ],
      ),
    ]);
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
