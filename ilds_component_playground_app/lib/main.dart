import 'package:flutter/material.dart';
import 'package:ilds_design_system/design_system/ilds_tokens.dart';
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

ThemeData _playgroundTheme() {
  return ThemeData(
    useMaterial3: true,
    fontFamily: ILDSTokens.fontFamilyPrimary,
    colorScheme: ColorScheme.fromSeed(
      seedColor: ILDSTokens.orange500,
      primary: ILDSTokens.orange500,
      surface: ILDSTokens.white,
    ),
    textSelectionTheme: TextSelectionThemeData(
      cursorColor: ILDSTokens.orange500,
      selectionColor: ILDSTokens.orange500.withValues(alpha: 0.2),
      selectionHandleColor: ILDSTokens.orange500,
    ),
    navigationRailTheme: NavigationRailThemeData(
      selectedIconTheme: const IconThemeData(color: ILDSTokens.orange500),
      selectedLabelTextStyle: const TextStyle(color: ILDSTokens.orange500),
      indicatorColor: ILDSTokens.orange50,
    ),
    inputDecorationTheme: const InputDecorationTheme(
      focusColor: ILDSTokens.orange500,
      hoverColor: ILDSTokens.neutralCoolgray50,
    ),
  );
}

class IldsStandalonePlaygroundApp extends StatelessWidget {
  const IldsStandalonePlaygroundApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'ILDS Standalone Playground',
      theme: _playgroundTheme(),
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
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 8),
              itemCount: _sections.length,
              itemBuilder: (context, index) {
                final bool selected = index == selectedNav;
                return Semantics(
                  button: true,
                  selected: selected,
                  label: _sections[index],
                  child: InkWell(
                    onTap: () => setState(() => selectedNav = index),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                      decoration: BoxDecoration(
                        color: selected ? ILDSTokens.orange50 : Colors.transparent,
                        borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusLg),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            selected ? Icons.check_circle_outline : Icons.circle_outlined,
                            size: 16,
                            color: selected ? ILDSTokens.orange500 : ILDSTokens.neutralCoolgray500,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _sections[index],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                              color: selected ? ILDSTokens.orange500 : ILDSTokens.neutralCoolgray800,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
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
        return _checkboxPanel();
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
        return _selectionButtonPanel();
      case 10:
        return _badgePanel();
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
        return _accordionPanel();
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
        _sectionTitle('Button — disabled (all types)'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final type in types)
              IldsButton(
                label: 'Disabled ${type.name}',
                type: type,
                isDisabled: true,
                onPressed: () {},
              ),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Button — loading (all types)'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final type in types)
              IldsButton(
                label: 'Loading ${type.name}',
                type: type,
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

  Widget _checkboxPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Checkbox — interactive'),
        IldsCheckbox(
          label: 'Accept terms',
          state: checkboxState,
          onChanged: (value) => setState(() => checkboxState = value),
        ),
        const SizedBox(height: 16),
        _sectionTitle('Checkbox — sizes × states'),
        Wrap(
          spacing: 24,
          runSpacing: 16,
          children: [
            for (final size in IldsCheckboxSize.values) ...[
              IldsCheckbox(
                label: '${size.name} checked',
                size: size,
                state: IldsCheckboxState.checked,
                onChanged: (_) {},
              ),
              IldsCheckbox(
                label: '${size.name} unchecked',
                size: size,
                state: IldsCheckboxState.unchecked,
                onChanged: (_) {},
              ),
            ],
            const IldsCheckbox(
              label: 'Disabled',
              state: IldsCheckboxState.unchecked,
              isDisabled: true,
              onChanged: null,
            ),
            IldsCheckbox(
              label: 'Error',
              state: IldsCheckboxState.unchecked,
              hasError: true,
              errorText: 'Required field',
              onChanged: (_) {},
            ),
          ],
        ),
      ],
    );
  }

  Widget _badgePanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (final variant in IldsBadgeVariant.values) ...[
          _sectionTitle('Badge — ${variant.name}'),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              for (final size in IldsBadgeSize.values)
                IldsBadge(
                  label: variant == IldsBadgeVariant.skeleton ? 'Skeleton' : variant.name,
                  variant: variant,
                  size: size,
                  prefixIcon: variant == IldsBadgeVariant.skeleton
                      ? null
                      : Icons.circle_outlined,
                ),
            ],
          ),
          const SizedBox(height: 12),
        ],
      ],
    );
  }

  Widget _selectionButtonPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Selection Button — variants'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            IldsSelectionButton(
              label: 'Label only',
              isSelected: selectionOn,
              onTap: () => setState(() => selectionOn = !selectionOn),
            ),
            IldsSelectionButton(
              label: 'With suffix',
              isSelected: selectionOn,
              variant: IldsSelectionButtonVariant.labelWithSuffix,
              suffixIcon: Icons.keyboard_arrow_down,
              onTap: () => setState(() => selectionOn = !selectionOn),
            ),
            IldsSelectionButton(
              label: 'Icon only',
              isSelected: selectionOn,
              variant: IldsSelectionButtonVariant.iconOnly,
              suffixIcon: Icons.tune,
              onTap: () => setState(() => selectionOn = !selectionOn),
            ),
            const IldsSelectionButton(
              label: 'Disabled',
              isSelected: false,
              isDisabled: true,
              onTap: null,
            ),
          ],
        ),
        const SizedBox(height: 12),
        _sectionTitle('Selection Button — sizes'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: IldsSelectionButtonSize.values
              .map(
                (size) => IldsSelectionButton(
                  label: size.name,
                  size: size,
                  isSelected: size == IldsSelectionButtonSize.medium,
                  onTap: () {},
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  Widget _accordionPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Accordion — multiple items'),
        const IldsAccordion(
          title: 'What is ILDS?',
          initiallyOpen: true,
          content: Text('ILDS is the ICICI Lombard design system for cross-platform UI.'),
        ),
        const SizedBox(height: 8),
        const IldsAccordion(
          title: 'How do tokens propagate?',
          content: Text('Figma plugin → tokens.json → Style Dictionary → platform outputs.'),
        ),
        const SizedBox(height: 8),
        const IldsAccordion(
          title: 'Where is the playground?',
          content: Text('ilds_component_playground_app — hot reload against lib/.'),
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
