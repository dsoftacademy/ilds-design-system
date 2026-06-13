import ILDSTokens
import SwiftUI

// Option list panel for IldsDropdown — mirrors lib/ilds_dropdown.dart menu panel + web DropdownMenu.tsx.

public struct IldsDropdownMenu: View {
    private let options: [IldsDropdownOption]
    private let selectedValue: String?
    private let size: IldsDropdownSize
    private let onSelect: (String) -> Void
    private let maxVisibleRows: Int

    public init(
        options: [IldsDropdownOption],
        selectedValue: String?,
        size: IldsDropdownSize = .large,
        maxVisibleRows: Int = 5,
        onSelect: @escaping (String) -> Void
    ) {
        self.options = options
        self.selectedValue = selectedValue
        self.size = size
        self.maxVisibleRows = maxVisibleRows
        self.onSelect = onSelect
    }

    public var body: some View {
        let rowHeight = size == .large ? ILDSTokens.sp48 : ILDSTokens.sp40
        let fontSize = size == .large ? ILDSTokens.fontSize14 : ILDSTokens.fontSize12
        let maxHeight = rowHeight * CGFloat(min(options.count, maxVisibleRows))

        ScrollView {
            VStack(spacing: 0) {
                ForEach(options) { option in
                    IldsDropdownMenuRow(
                        option: option,
                        isSelected: option.value == selectedValue,
                        fontSize: fontSize,
                        rowHeight: rowHeight,
                        onSelect: onSelect
                    )
                }
            }
        }
        .frame(maxHeight: maxHeight)
        .background(ILDSTokens.globalWhite000)
        .overlay {
            UnevenRoundedRectangle(
                bottomLeadingRadius: ILDSTokens.radiusMedium,
                bottomTrailingRadius: ILDSTokens.radiusMedium
            )
            .strokeBorder(ILDSTokens.primaryOrange500, lineWidth: 2)
        }
        .clipShape(
            UnevenRoundedRectangle(
                bottomLeadingRadius: ILDSTokens.radiusMedium,
                bottomTrailingRadius: ILDSTokens.radiusMedium
            )
        )
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

private struct IldsDropdownMenuRow: View {
    let option: IldsDropdownOption
    let isSelected: Bool
    let fontSize: CGFloat
    let rowHeight: CGFloat
    let onSelect: (String) -> Void

    var body: some View {
        Button {
            guard !option.isDisabled else { return }
            onSelect(option.value)
        } label: {
            HStack {
                Text(option.label)
                    .font(.system(
                        size: fontSize,
                        weight: isSelected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightRegular
                    ))
                    .foregroundStyle(option.isDisabled
                        ? ILDSTokens.neutralCoolgray300
                        : (isSelected ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray900))
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: ILDSTokens.sp20))
                        .foregroundStyle(ILDSTokens.primaryOrange500)
                }
            }
            .frame(height: rowHeight)
            .padding(.horizontal, ILDSTokens.sp16)
            .background(isSelected ? ILDSTokens.primaryOrange50 : Color.clear)
        }
        .buttonStyle(.plain)
        .disabled(option.isDisabled)
        .accessibilityLabel(option.label)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}
