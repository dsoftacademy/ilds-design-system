import ILDSTokens
import SwiftUI

// Figma node 16055:6152 — mirrors web/DropdownMenu.tsx + android/IldsDropdownMenu.kt.

public struct IldsDropdownMenu: View {
    private let options: [IldsDropdownOption]
    private let sectionLabel: String?
    private let selectedValue: String?
    private let showFooter: Bool
    private let secondaryLabel: String
    private let primaryLabel: String
    private let onSelect: (String) -> Void
    private let onSecondary: (() -> Void)?
    private let onPrimary: (() -> Void)?

    public init(
        options: [IldsDropdownOption],
        sectionLabel: String? = "Section Label",
        selectedValue: String? = nil,
        showFooter: Bool = true,
        secondaryLabel: String = "Secondary button",
        primaryLabel: String = "Primary button",
        onSelect: @escaping (String) -> Void,
        onSecondary: (() -> Void)? = nil,
        onPrimary: (() -> Void)? = nil
    ) {
        self.options = options
        self.sectionLabel = sectionLabel
        self.selectedValue = selectedValue
        self.showFooter = showFooter
        self.secondaryLabel = secondaryLabel
        self.primaryLabel = primaryLabel
        self.onSelect = onSelect
        self.onSecondary = onSecondary
        self.onPrimary = onPrimary
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let sectionLabel, !sectionLabel.isEmpty {
                Text(sectionLabel)
                    .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold))
                    .foregroundStyle(ILDSTokens.neutralCoolgray800)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, ILDSTokens.sp8)
                    .padding(.vertical, ILDSTokens.sp12)
                    .background(ILDSTokens.neutralCoolgray100)
                    .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))
            }

            ForEach(Array(options.enumerated()), id: \.element.id) { index, option in
                IldsDropdownMenuRow(
                    option: option,
                    isSelected: option.value == selectedValue,
                    onSelect: onSelect
                )
                if index < options.count - 1 {
                    Divider()
                        .background(ILDSTokens.neutralCoolgray200)
                }
            }

            if showFooter {
                HStack(spacing: ILDSTokens.sp12) {
                    IldsButton(
                        secondaryLabel,
                        action: { onSecondary?() },
                        type: .secondary,
                        size: .medium
                    )
                    .frame(maxWidth: .infinity)
                    IldsButton(
                        primaryLabel,
                        action: { onPrimary?() },
                        type: .primary,
                        size: .medium
                    )
                    .frame(maxWidth: .infinity)
                }
                .padding(.horizontal, ILDSTokens.sp8)
                .padding(.vertical, ILDSTokens.sp12)
            }
        }
        .padding(ILDSTokens.sp8)
        .frame(width: 320)
        .background(ILDSTokens.globalWhite000)
        .overlay {
            RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                .strokeBorder(ILDSTokens.neutralCoolgray200, lineWidth: 1)
        }
        .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

private struct IldsDropdownMenuRow: View {
    let option: IldsDropdownOption
    let isSelected: Bool
    let onSelect: (String) -> Void

    var body: some View {
        Button {
            guard !option.isDisabled else { return }
            onSelect(option.value)
        } label: {
            HStack(alignment: .top, spacing: ILDSTokens.sp8) {
                ZStack {
                    Circle()
                        .strokeBorder(
                            isSelected ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray500,
                            lineWidth: 1.5
                        )
                        .frame(width: 20, height: 20)
                    if isSelected {
                        Circle()
                            .fill(ILDSTokens.primaryOrange500)
                            .frame(width: 10, height: 10)
                    }
                }
                Text(option.label)
                    .font(.system(
                        size: ILDSTokens.fontSize14,
                        weight: isSelected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightRegular
                    ))
                    .foregroundStyle(option.isDisabled
                        ? ILDSTokens.neutralCoolgray300
                        : (isSelected ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray800))
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, ILDSTokens.sp8)
            .padding(.vertical, ILDSTokens.sp12)
            .background(isSelected ? ILDSTokens.primaryOrange50 : Color.clear)
        }
        .buttonStyle(.plain)
        .disabled(option.isDisabled)
        .accessibilityLabel(option.label)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}
