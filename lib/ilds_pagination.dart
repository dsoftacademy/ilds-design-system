import 'package:flutter/material.dart';
import 'design_system/ilds_tokens.dart';

enum IldsPaginationType { nonSelection, selection }
enum IldsPaginationVariant { compact, extended }

class IldsPagination extends StatelessWidget {
  const IldsPagination({
    super.key,
    required this.currentPage,
    required this.totalPages,
    required this.onPageChanged,
    this.type = IldsPaginationType.selection,
    this.variant = IldsPaginationVariant.extended,
    this.pageSize,
    this.onPageSizeChanged,
    this.pageSizeOptions = const [10, 20, 50],
  });

  final int currentPage;
  final int totalPages;
  final ValueChanged<int> onPageChanged;
  final IldsPaginationType type;
  final IldsPaginationVariant variant;
  final int? pageSize;
  final ValueChanged<int>? onPageSizeChanged;
  final List<int> pageSizeOptions;

  List<int> _visiblePages() {
    if (totalPages <= ILDSTokens.spacing2) {
      return List<int>.generate(totalPages, (index) => index + 1);
    }
    final Set<int> pages = <int>{1, totalPages, currentPage};
    if (currentPage > 1) pages.add(currentPage - 1);
    if (currentPage < totalPages) pages.add(currentPage + 1);
    final List<int> sorted = pages.toList()..sort();
    return sorted;
  }

  Widget _pageButton(BuildContext context, int page, {bool disabled = false}) {
    final bool selected = page == currentPage;
    final Color bg = selected ? ILDSTokens.orange500 : Colors.transparent;
    final Color textColor = disabled
        ? ILDSTokens.neutral200
        : (selected ? ILDSTokens.white : ILDSTokens.neutral600);
    final Color border = disabled
        ? ILDSTokens.neutral100
        : (selected ? ILDSTokens.orange500 : ILDSTokens.neutral200);

    return Semantics(
      button: true,
      selected: selected,
      enabled: !disabled,
      label: 'Page $page',
      child: GestureDetector(
        onTap: disabled ? null : () => onPageChanged(page),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: ILDSTokens.spacing8 + ILDSTokens.spacing1,
          height: ILDSTokens.spacing8 + ILDSTokens.spacing1,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
            border: Border.all(
              color: selected ? ILDSTokens.orange500 : border,
              width: ILDSTokens.borderWidth1,
            ),
          ),
          child: Text(
            '$page',
            style: TextStyle(
              fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
              color: textColor,
              fontWeight: selected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightMedium,
            ),
          ),
        ),
      ),
    );
  }

  Widget _arrowButton({required bool previous}) {
    final bool disabled = previous ? currentPage <= 1 : currentPage >= totalPages;
    return Semantics(
      button: true,
      enabled: !disabled,
      label: previous ? 'Previous page' : 'Next page',
      child: GestureDetector(
        onTap: disabled
            ? null
            : () => onPageChanged(previous ? currentPage - 1 : currentPage + 1),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          width: ILDSTokens.spacing8 + ILDSTokens.spacing1,
          height: ILDSTokens.spacing8 + ILDSTokens.spacing1,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(ILDSTokens.borderRadiusMd),
            border: Border.all(
              color: disabled ? ILDSTokens.neutral100 : ILDSTokens.neutral200,
              width: ILDSTokens.borderWidth1,
            ),
            color: Colors.transparent,
          ),
          child: Icon(
            previous ? Icons.chevron_left : Icons.chevron_right,
            color: disabled ? ILDSTokens.neutral200 : ILDSTokens.neutral600,
            size: ILDSTokens.spacing5,
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
          _arrowButton(previous: true),
          const SizedBox(width: ILDSTokens.spacing1),
          Text(
            'Page $currentPage of $totalPages',
            style: const TextStyle(
              fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
              color: ILDSTokens.neutral600,
              fontWeight: ILDSTokens.fontWeightMedium,
            ),
          ),
          const SizedBox(width: ILDSTokens.spacing1),
          _arrowButton(previous: false),
        ],
      );
    }

    final List<int> pages = _visiblePages();
    return Wrap(
      spacing: ILDSTokens.spacing1,
      runSpacing: ILDSTokens.spacing1,
      children: [
        _arrowButton(previous: true),
        for (int i = 0; i < pages.length; i++) ...[
          if (i > 0 && pages[i] - pages[i - 1] > 1)
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: ILDSTokens.spacing1),
              child: Center(
                child: Text(
                  '...',
                  style: TextStyle(
                    fontSize: ILDSTokens.spacing3 + ILDSTokens.borderWidth2,
                    color: ILDSTokens.neutral500,
                  ),
                ),
              ),
            ),
          _pageButton(context, pages[i]),
        ],
        _arrowButton(previous: false),
      ],
    );
  }
}
