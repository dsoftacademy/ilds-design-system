import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsTabEmphasis { high, medium }
enum IldsTabType { fixed, scrollable }
enum IldsTabAlignment { center, left }

class IldsTabItem {
  const IldsTabItem({
    required this.label,
    this.icon,
    this.isDisabled = false,
  });

  final String label;
  final IconData? icon;
  final bool isDisabled;
}

class IldsTabBar extends StatefulWidget {
  const IldsTabBar({
    super.key,
    required this.tabs,
    required this.onTabChanged,
    this.selectedIndex = 0,
    this.emphasis = IldsTabEmphasis.high,
    this.type = IldsTabType.scrollable,
    this.alignment = IldsTabAlignment.left,
  });

  final List<IldsTabItem> tabs;
  final ValueChanged<int> onTabChanged;
  final int selectedIndex;
  final IldsTabEmphasis emphasis;
  final IldsTabType type;
  final IldsTabAlignment alignment;

  @override
  State<IldsTabBar> createState() => _IldsTabBarState();
}

class _IldsTabBarState extends State<IldsTabBar> {
  late int _selectedIndex;
  int? _hoveredIndex;
  int? _pressedIndex;
  int? _focusedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.selectedIndex;
  }

  @override
  void didUpdateWidget(covariant IldsTabBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedIndex != widget.selectedIndex) {
      _selectedIndex = widget.selectedIndex;
    }
  }

  double _labelSize() => ILDSTokens.spacing3 + ILDSTokens.borderWidth2;
  double _tabHeight() => ILDSTokens.spacing12;

  Color _textColor(int index) {
    final IldsTabItem tab = widget.tabs[index];
    if (tab.isDisabled) return ILDSTokens.neutral200;
    if (_selectedIndex == index) {
      return widget.emphasis == IldsTabEmphasis.high ? ILDSTokens.orange500 : ILDSTokens.neutral900;
    }
    if (_focusedIndex == index) return ILDSTokens.orange500;
    if (_pressedIndex == index) return ILDSTokens.neutral900;
    if (_hoveredIndex == index) return ILDSTokens.neutral600;
    return ILDSTokens.neutral400;
  }

  Color _backgroundColor(int index) {
    if (_focusedIndex == index) return ILDSTokens.orange50;
    if (_pressedIndex == index) return ILDSTokens.neutral100;
    if (_hoveredIndex == index) return ILDSTokens.neutral50;
    return Colors.transparent;
  }

  Color _indicatorColor() {
    return widget.emphasis == IldsTabEmphasis.high ? ILDSTokens.orange500 : ILDSTokens.neutral900;
  }

  void _select(int index) {
    if (widget.tabs[index].isDisabled) return;
    setState(() => _selectedIndex = index);
    widget.onTabChanged(index);
  }

  Widget _buildTab(int index) {
    final IldsTabItem tab = widget.tabs[index];
    return Focus(
      onFocusChange: (value) => setState(() => _focusedIndex = value ? index : null),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hoveredIndex = index),
        onExit: (_) => setState(() {
          if (_hoveredIndex == index) _hoveredIndex = null;
          if (_pressedIndex == index) _pressedIndex = null;
        }),
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTapDown: tab.isDisabled ? null : (_) => setState(() => _pressedIndex = index),
          onTapUp: tab.isDisabled ? null : (_) => setState(() => _pressedIndex = null),
          onTapCancel: tab.isDisabled ? null : () => setState(() => _pressedIndex = null),
          onTap: tab.isDisabled ? null : () => _select(index),
          child: Semantics(
            button: true,
            selected: _selectedIndex == index,
            enabled: !tab.isDisabled,
            label: tab.label,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              height: _tabHeight(),
              padding: const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing3),
              color: _backgroundColor(index),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (tab.icon != null) ...[
                    Icon(tab.icon, size: _labelSize(), color: _textColor(index)),
                    const SizedBox(width: ILDSTokens.spacing1),
                  ],
                  Text(
                    tab.label,
                    style: TextStyle(
                      fontSize: _labelSize(),
                      fontWeight: _selectedIndex == index
                          ? ILDSTokens.fontWeightBold
                          : ILDSTokens.fontWeightMedium,
                      color: _textColor(index),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final Widget tabsRow = widget.type == IldsTabType.fixed
        ? Row(
            mainAxisAlignment: widget.alignment == IldsTabAlignment.center
                ? MainAxisAlignment.center
                : MainAxisAlignment.start,
            children: List.generate(
              widget.tabs.length,
              (index) => Expanded(child: _buildTab(index)),
            ),
          )
        : SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              mainAxisAlignment: widget.alignment == IldsTabAlignment.center
                  ? MainAxisAlignment.center
                  : MainAxisAlignment.start,
              children: List.generate(widget.tabs.length, _buildTab),
            ),
          );

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Stack(
          children: [
            tabsRow,
            Positioned(
              bottom: 0,
              left: widget.type == IldsTabType.fixed
                  ? (MediaQuery.of(context).size.width / widget.tabs.length) * _selectedIndex
                  : null,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                height: ILDSTokens.borderWidth2 + ILDSTokens.borderWidth1,
                width: widget.type == IldsTabType.fixed
                    ? MediaQuery.of(context).size.width / widget.tabs.length
                    : ILDSTokens.spacing12 + ILDSTokens.spacing4,
                color: _indicatorColor(),
              ),
            ),
          ],
        ),
        const Divider(
          height: ILDSTokens.borderWidth1,
          thickness: ILDSTokens.borderWidth1,
          color: ILDSTokens.neutral200,
        ),
      ],
    );
  }
}
