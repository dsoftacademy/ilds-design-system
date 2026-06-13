import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_pagination.dart + web Pagination.tsx (Figma 17724:3366 borderless cells).
// TODO(web/desktop): hover states — mobile-first defer.

public enum IldsPaginationVariant: Sendable {
    case extended, compact
}

public struct IldsPagination: View {
    private let currentPage: Int
    private let totalPages: Int
    private let variant: IldsPaginationVariant
    private let onPageChanged: (Int) -> Void

    public init(
        currentPage: Int,
        totalPages: Int,
        variant: IldsPaginationVariant = .extended,
        onPageChanged: @escaping (Int) -> Void
    ) {
        self.currentPage = currentPage
        self.totalPages = totalPages
        self.variant = variant
        self.onPageChanged = onPageChanged
    }

    public var body: some View {
        Group {
            if variant == .compact {
                compactView
            } else {
                extendedView
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Pagination")
    }

    private var compactView: some View {
        HStack(spacing: ILDSTokens.sp8) {
            navLink(direction: .previous)
            Text("\(currentPage) of \(totalPages) pages")
                .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightMedium))
                .foregroundStyle(ILDSTokens.neutralCoolgray900)
                .padding(.horizontal, ILDSTokens.sp4)
            navLink(direction: .next)
        }
    }

    private var extendedView: some View {
        HStack(spacing: ILDSTokens.sp4) {
            navLink(direction: .previous)
            ForEach(Array(visiblePages().enumerated()), id: \.offset) { index, page in
                if index > 0, page - visiblePages()[index - 1] > 1 {
                    Text("…")
                        .font(.system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightBold))
                        .foregroundStyle(ILDSTokens.neutralCoolgray900)
                        .frame(width: ILDSTokens.sp32, height: ILDSTokens.sp32)
                }
                pageCell(page)
            }
            navLink(direction: .next)
        }
    }

    private enum NavDirection { case previous, next }

    private func navLink(direction: NavDirection) -> some View {
        let disabled = direction == .previous ? currentPage <= 1 : currentPage >= totalPages
        let label = direction == .previous ? "Back" : "Next"

        return Button {
            guard !disabled else { return }
            onPageChanged(direction == .previous ? currentPage - 1 : currentPage + 1)
        } label: {
            HStack(spacing: ILDSTokens.sp4) {
                if direction == .previous {
                    Image(systemName: "chevron.left")
                        .font(.system(size: ILDSTokens.sp16, weight: ILDSTokens.fontWeightBold))
                }
                Text(label)
                    .font(.system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightBold))
                if direction == .next {
                    Image(systemName: "chevron.right")
                        .font(.system(size: ILDSTokens.sp16, weight: ILDSTokens.fontWeightBold))
                }
            }
            .foregroundStyle(disabled ? ILDSTokens.neutralCoolgray300 : ILDSTokens.primaryOrange500)
            .padding(.horizontal, ILDSTokens.sp4)
        }
        .buttonStyle(.plain)
        .disabled(disabled)
        .accessibilityLabel(direction == .previous ? "Previous page" : "Next page")
    }

    private func pageCell(_ page: Int) -> some View {
        let selected = page == currentPage
        return Button {
            onPageChanged(page)
        } label: {
            Text("\(page)")
                .font(.system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightBold))
                .foregroundStyle(selected ? ILDSTokens.primaryOrange600 : ILDSTokens.neutralCoolgray900)
                .frame(width: ILDSTokens.sp32, height: ILDSTokens.sp32)
                .background(selected ? ILDSTokens.primaryOrange50 : Color.clear)
                .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge))
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Page \(page)")
        .accessibilityAddTraits(selected ? .isSelected : [])
    }

    private func visiblePages() -> [Int] {
        if totalPages <= 7 {
            return Array(1...totalPages)
        }
        var pages = Set([1, totalPages, currentPage])
        if currentPage > 1 { pages.insert(currentPage - 1) }
        if currentPage < totalPages { pages.insert(currentPage + 1) }
        return pages.sorted()
    }
}
