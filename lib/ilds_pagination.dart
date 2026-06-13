import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsPaginationVariant { compact, extended }

/// Figma set 17724:3361 — mirrors web/Pagination.tsx + native IldsPagination.
class IldsPagination extends StatelessWidget {
  const IldsPagination({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.onPageChanged,
    this.variant = IldsPaginationVariant.extended,
  });

  final int currentPage;
  final int totalPages;
  final ValueChanged<int> onPageChanged;
  final IldsPaginationVariant variant;

  List<int> _visiblePages() {
    if (totalPages <= 7) {
      return List<int>.generate(totalPages, (index) => index + 1);
    }
    final Set<int> pages = <int>{1, totalPages, currentPage};
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);
    return pages.toList()..sort();
  }

  Widget _navLink({required bool previous}) {
    final bool disabled = previous ? currentPage <= 1 : currentPage >= totalPages;
    final Color color = disabled ? ILDSTokens.neutral300 : ILDSTokens.orange500;

    return Semantics(
      button: true,
      enabled: !disabled,
      label: previous ? 'Previous page' : 'Next page',
      child: GestureDetector(
        onTap: disabled
            ? null
            : () => onPageChanged(previous ? currentPage - 1 : currentPage + 1),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing1),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (previous) ...[
                Icon(Icons.chevron_left, size: ILDSTokens.spacing4, color: color),
                const SizedBox(width: ILDSTokens.spacing1),
                Text(
                  'Back',
                  style: TextStyle(
                    fontSize: ILDSTokens.spacing4,
                    fontWeight: ILDSTokens.fontWeightBold,
                    color: color,
                  ),
                ),
              ] else ...[
                Text(
                  'Next',
                  style: TextStyle(
                    fontSize: ILDSTokens.spacing4,
                    fontWeight: ILDSTokens.fontWeightBold,
                    color: color,
                  ),
                ),
                const SizedBox(width: ILDSTokens.spacing1),
                Icon(Icons.chevron_right, size: ILDSTokens.spacing4, color: color),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _pageCell(int page) {
    final bool selected = page == currentPage;
    return Semantics(
      button: true,
      selected: selected,
      label: 'Page $page',
      child: GestureDetector(
        onTap: () => onPageChanged(page),
        child: Container(
          width: ILDSTokens.spacing8,
          height: ILDSTokens.spacing8,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? ILDSTokens.orange50 : Colors.transparent,
            borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusLg),
          ),
          child: Text(
            '$page',
            style: TextStyle(
              fontSize: ILDSTokens.spacing4,
              fontWeight: ILDSTokens.fontWeightBold,
              color: selected ? ILDSTokens.orange600 : ILDSTokens.neutral900,
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (variant == IldsPaginationVariant.compact) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _navLink(previous: true),
          const SizedBox(width: ILDSTokens.spacing2),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: ILDSTokens.spacing1),
            child: Text(
              '$currentPage of $totalPages pages',
              style: const TextStyle(
                fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
                color: ILDSTokens.neutral900,
                fontWeight: ILDSTokens.fontWeightMedium,
              ),
            ),
          ),
          const SizedBox(width: ILDSTokens.spacing2),
          _navLink(previous: false),
        ],
      );
    }

    final List<int> pages = _visiblePages();
    return Wrap(
      spacing: ILDSTokens.spacing1,
      runSpacing: ILDSTokens.spacing1,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        _navLink(previous: true),
        for (int i = 0; i < pages.length; i++) ...[
          if (i > 0 && pages[i] - pages[i - 1] > 1)
            const SizedBox(
              width: ILDSTokens.spacing8,
              height: ILDSTokens.spacing8,
              child: Center(
                child: Text(
                  '…',
                  style: TextStyle(
                    fontSize: ILDSTokens.spacing4,
                    fontWeight: ILDSTokens.fontWeightBold,
                    color: ILDSTokens.neutral900,
                  ),
                ),
              ),
            ),
          _pageCell(pages[i]),
        ],
        _navLink(previous: false),
      ],
    );
  }
}
