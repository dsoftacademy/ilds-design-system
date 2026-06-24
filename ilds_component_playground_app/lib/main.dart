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
  bool chipDisabledSelected = true;
  bool searchLoading = false;
  String? dropdownValue;
  String? dropdownFilledValue = '1';
  final TextEditingController searchController = TextEditingController();
  final TextEditingController searchFilledController = TextEditingController(text: 'Policy search');
  final TextEditingController textAreaController = TextEditingController();
  final TextEditingController textFieldController = TextEditingController(text: 'Filled value');
  final ScrollController scrollbarDemoController = ScrollController();

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
    searchFilledController.dispose();
    textAreaController.dispose();
    textFieldController.dispose();
    scrollbarDemoController.dispose();
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
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: selectedNav == 16
                  ? Align(
                      alignment: Alignment.topLeft,
                      child: _buildSelectedPanel(selectedNav),
                    )
                  : SingleChildScrollView(
                      child: _buildSelectedPanel(selectedNav),
                    ),
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
        return _radioPanel();
      case 2:
        return _checkboxPanel();
      case 3:
        return _switchPanel();
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
        return _paginationPanel();
      case 9:
        return _selectionButtonPanel();
      case 10:
        return _badgePanel();
      case 11:
        return _chipPanel();
      case 12:
        return _tagPanel();
      case 13:
        return _accordionPanel();
      case 14:
        return _textLinkPanel();
      case 15:
        return _searchPanel();
      case 16:
        return _scrollbarPanel();
      case 17:
        return _toastPanel();
      default:
        return const SizedBox.shrink();
    }
  }

  Widget _radioPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Radio — interactive group'),
        IldsRadioGroup(
          options: const [
            IldsRadioOption(value: 'A', label: 'Option A'),
            IldsRadioOption(value: 'B', label: 'Option B'),
          ],
          groupValue: radioValue,
          onChanged: (v) => setState(() => radioValue = v),
        ),
        const SizedBox(height: 16),
        _sectionTitle('Radio — size matrix'),
        Wrap(
          spacing: 24,
          runSpacing: 12,
          children: [
            for (final size in IldsRadioSize.values)
              IldsRadio(
                value: size.name,
                groupValue: 'medium',
                size: size,
                label: size.name,
                onChanged: (_) {},
              ),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Radio — disabled & error'),
        Wrap(
          spacing: 24,
          runSpacing: 12,
          children: const [
            IldsRadio(
              value: 'x',
              groupValue: 'y',
              label: 'Disabled',
              isDisabled: true,
              onChanged: null,
            ),
            IldsRadio(
              value: 'err',
              groupValue: 'err',
              label: 'Error',
              hasError: true,
              errorText: 'Selection required',
              onChanged: null,
            ),
          ],
        ),
      ],
    );
  }

  Widget _switchPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Switch — interactive'),
        IldsSwitch(
          value: switchValue,
          label: 'Enable notifications',
          onChanged: (value) => setState(() => switchValue = value),
        ),
        const SizedBox(height: 16),
        _sectionTitle('Switch — sizes'),
        Wrap(
          spacing: 24,
          runSpacing: 12,
          children: IldsSwitchSize.values
              .map(
                (size) => IldsSwitch(
                  value: true,
                  size: size,
                  label: size.name,
                  onChanged: (_) {},
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 16),
        _sectionTitle('Switch — disabled & icon variants'),
        Wrap(
          spacing: 24,
          runSpacing: 12,
          children: [
            const IldsSwitch(
              value: false,
              label: 'Disabled off',
              isDisabled: true,
              onChanged: null,
            ),
            IldsSwitch(
              value: true,
              label: 'With icon',
              showIcon: true,
              leadingIcon: Icons.notifications_outlined,
              onChanged: (_) {},
            ),
            IldsSwitch(
              value: true,
              showLabel: false,
              showIcon: true,
              leadingIcon: Icons.dark_mode_outlined,
              onChanged: (_) {},
            ),
          ],
        ),
      ],
    );
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
        _sectionTitle('Button — icon-only L / M / S (Figma 13472:2810 L, medium icon-only, 13472:3718 S)'),
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
              size: IldsButtonSize.medium,
              icon: const Icon(Icons.favorite_border),
              semanticLabel: 'Favorite medium',
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
        _sectionTitle('Selection Button — selected / unselected'),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            IldsSelectionButton(
              label: 'Unselected',
              isSelected: false,
              onTap: () => setState(() => selectionOn = false),
            ),
            IldsSelectionButton(
              label: 'Selected',
              isSelected: true,
              onTap: () => setState(() => selectionOn = true),
            ),
          ],
        ),
        const SizedBox(height: 12),
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
        const SizedBox(height: 16),
        _sectionTitle('Accordion — prefix icon & number'),
        const IldsAccordion(
          title: 'With prefix icon',
          prefix: Icons.help_outline,
          content: Text('Prefix icon variant.'),
        ),
        const SizedBox(height: 8),
        const IldsAccordion(
          title: 'With prefix number',
          prefixNumber: 2,
          content: Text('Numbered accordion item.'),
        ),
        const SizedBox(height: 8),
        const IldsAccordion(
          title: 'Disabled accordion',
          isDisabled: true,
          content: Text('Cannot expand.'),
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Dropdown — default'),
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
        const SizedBox(height: 16),
        _sectionTitle('Dropdown — filled / error / disabled / loading'),
        Wrap(
          spacing: 16,
          runSpacing: 16,
          children: [
            SizedBox(
              width: 280,
              child: IldsDropdown(
                label: 'Filled',
                placeholder: 'Select',
                options: options,
                selectedValue: dropdownFilledValue,
                onChanged: (v) => setState(() => dropdownFilledValue = v),
              ),
            ),
            const SizedBox(
              width: 280,
              child: IldsDropdown(
                label: 'Error',
                placeholder: 'Select',
                options: options,
                errorText: 'Please select a value',
              ),
            ),
            const SizedBox(
              width: 280,
              child: IldsDropdown(
                label: 'Disabled',
                placeholder: 'Select',
                options: options,
                enabled: false,
              ),
            ),
            SizedBox(
              width: 280,
              child: IldsDropdown(
                label: 'Loading',
                placeholder: 'Select',
                options: options,
                isLoading: true,
              ),
            ),
          ],
        ),
      ],
    );
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
        _sectionTitle('Chip — filter sizes L / M'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final size in IldsChipSize.values) ...[
              IldsChip(
                label: '${size.name} default',
                size: size,
                isSelected: chipSelected,
                showPrefixIcon: true,
                prefixIcon: Icons.tune,
                onPressed: () => setState(() => chipSelected = !chipSelected),
              ),
              IldsChip(
                label: '${size.name} selected',
                size: size,
                isSelected: true,
                showPrefixIcon: true,
                prefixIcon: Icons.tune,
                onPressed: () {},
              ),
            ],
            IldsChip(
              label: 'Disabled selected',
              isSelected: chipDisabledSelected,
              enabled: false,
              showPrefixIcon: true,
              prefixIcon: Icons.tune,
              onPressed: () {},
            ),
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

  Widget _tagPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Tag — active (interactive)'),
        IldsTag(
          label: 'Active tag',
          isActive: tagActive,
          prefixIcon: Icons.label_outline,
          onTap: () => setState(() => tagActive = !tagActive),
          onRemove: () => setState(() => tagActive = false),
        ),
        const SizedBox(height: 16),
        _sectionTitle('Tag — default / inactive / disabled'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: const [
            IldsTag(label: 'Default'),
            IldsTag(label: 'Inactive', isActive: false, prefixIcon: Icons.label_outline),
            IldsTag(label: 'Disabled', isDisabled: true, prefixIcon: Icons.label_outline),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Tag — sizes'),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: IldsTagSize.values
              .map((size) => IldsTag(label: size.name, size: size, prefixIcon: Icons.sell_outlined))
              .toList(),
        ),
      ],
    );
  }

  Widget _paginationPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Pagination — extended'),
        IldsPagination(
          currentPage: currentPage,
          totalPages: 20,
          onPageChanged: (page) => setState(() => currentPage = page),
          variant: IldsPaginationVariant.extended,
        ),
        const SizedBox(height: 16),
        _sectionTitle('Pagination — compact'),
        IldsPagination(
          currentPage: currentPage,
          totalPages: 20,
          onPageChanged: (page) => setState(() => currentPage = page),
          variant: IldsPaginationVariant.compact,
        ),
      ],
    );
  }

  Widget _textLinkPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Text Link — sizes S / M / L'),
        Wrap(
          spacing: 16,
          runSpacing: 8,
          children: IldsTextLinkSize.values
              .map(
                (size) => IldsTextLink(
                  label: 'Link ${size.name}',
                  size: size,
                  onTap: () {},
                ),
              )
              .toList(),
        ),
        const SizedBox(height: 16),
        _sectionTitle('Text Link — defaultBlue states'),
        Wrap(
          spacing: 16,
          runSpacing: 8,
          children: [
            IldsTextLink(label: 'Default', onTap: () {}),
            IldsTextLink(label: 'Visited', isVisited: true, onTap: () {}),
            const IldsTextLink(label: 'Disabled', isDisabled: true, onTap: null),
            IldsTextLink(
              label: 'With prefix',
              prefixIcon: Icons.link,
              onTap: () {},
            ),
          ],
        ),
        const SizedBox(height: 16),
        _sectionTitle('Text Link — white on dark'),
        Container(
          width: double.infinity,
          color: ILDSTokens.neutralCoolgray800,
          padding: const EdgeInsets.all(ILDSTokens.spacing3),
          child: Wrap(
            spacing: 16,
            runSpacing: 8,
            children: [
              IldsTextLink(
                label: 'White default',
                colour: IldsTextLinkColour.white,
                onTap: () {},
              ),
              IldsTextLink(
                label: 'White visited',
                colour: IldsTextLinkColour.white,
                isVisited: true,
                onTap: () {},
              ),
              const IldsTextLink(
                label: 'White disabled',
                colour: IldsTextLinkColour.white,
                isDisabled: true,
                onTap: null,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _searchPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('Search — empty with clear'),
        IldsSearch(
          controller: searchController,
          onChanged: (_) => setState(() {}),
          onClear: () {
            searchController.clear();
            setState(() {});
          },
        ),
        const SizedBox(height: 16),
        _sectionTitle('Search — filled'),
        IldsSearch(
          controller: searchFilledController,
          onChanged: (_) => setState(() {}),
          onClear: () {
            searchFilledController.clear();
            setState(() {});
          },
        ),
        const SizedBox(height: 16),
        _sectionTitle('Search — loading'),
        IldsSearch(
          controller: searchController,
          isLoading: searchLoading,
          onChanged: (_) => setState(() {}),
          onClear: () {
            searchController.clear();
            setState(() {});
          },
        ),
        const SizedBox(height: 8),
        IldsButton(
          label: searchLoading ? 'Stop loading' : 'Show loading',
          type: IldsButtonType.secondary,
          size: IldsButtonSize.small,
          onPressed: () => setState(() => searchLoading = !searchLoading),
        ),
      ],
    );
  }

  Widget _scrollbarPanel() {
    return _panel('Scrollbar', [
      ClipRRect(
        borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
        child: SizedBox(
          height: 160,
          width: 400,
          child: PrimaryScrollController.none(
            child: IldsScrollbar(
              controller: scrollbarDemoController,
              child: ListView.builder(
                controller: scrollbarDemoController,
                physics: const ClampingScrollPhysics(),
                primary: false,
                itemCount: 24,
                itemBuilder: (_, i) => ListTile(dense: true, title: Text('Row ${i + 1}')),
              ),
            ),
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
