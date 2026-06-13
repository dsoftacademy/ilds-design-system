import ILDSTokens
import SwiftUI

// Mirrors web/Tabs.tsx (Figma 17667:2334) + lib/ilds_tab.dart.
// High = filled segmented pills; Medium = underline tab bar.

public enum IldsTabEmphasis: Sendable {
    case high, medium
}

public enum IldsTabAlignment: Sendable {
    case left, center
}

public struct IldsTabItem: Identifiable {
    public let id: String
    public let label: String
    public let icon: AnyView?
    public let isDisabled: Bool

    public init(
        id: String = UUID().uuidString,
        label: String,
        icon: (any View)? = nil,
        isDisabled: Bool = false
    ) {
        self.id = id
        self.label = label
        self.icon = icon.map { AnyView($0) }
        self.isDisabled = isDisabled
    }
}

public struct IldsTabs: View {
    private let tabs: [IldsTabItem]
    @Binding private var selectedIndex: Int
    private let emphasis: IldsTabEmphasis
    private let alignment: IldsTabAlignment

    public init(
        tabs: [IldsTabItem],
        selectedIndex: Binding<Int>,
        emphasis: IldsTabEmphasis = .high,
        alignment: IldsTabAlignment = .left
    ) {
        self.tabs = tabs
        _selectedIndex = selectedIndex
        self.emphasis = emphasis
        self.alignment = alignment
    }

    public var body: some View {
        let isHigh = emphasis == .high

        Group {
            if isHigh {
                HStack(spacing: ILDSTokens.sp8) {
                    if alignment == .center { Spacer(minLength: 0) }
                    ForEach(Array(tabs.enumerated()), id: \.element.id) { index, tab in
                        IldsTabCell(
                            tab: tab,
                            isSelected: selectedIndex == index,
                            emphasis: emphasis,
                            action: {
                                guard !tab.isDisabled else { return }
                                selectedIndex = index
                            }
                        )
                    }
                    if alignment == .center { Spacer(minLength: 0) }
                }
            } else {
                VStack(spacing: 0) {
                    HStack(spacing: 0) {
                        if alignment == .center { Spacer(minLength: 0) }
                        ForEach(Array(tabs.enumerated()), id: \.element.id) { index, tab in
                            IldsTabCell(
                                tab: tab,
                                isSelected: selectedIndex == index,
                                emphasis: emphasis,
                                action: {
                                    guard !tab.isDisabled else { return }
                                    selectedIndex = index
                                }
                            )
                        }
                        if alignment == .center { Spacer(minLength: 0) }
                    }
                    Divider()
                        .background(ILDSTokens.neutralCoolgray200)
                }
            }
        }
        .accessibilityElement(children: .contain)
    }
}

private struct IldsTabCell: View {
    let tab: IldsTabItem
    let isSelected: Bool
    let emphasis: IldsTabEmphasis
    let action: () -> Void

    var body: some View {
        let colors = IldsTabColors.resolve(isSelected: isSelected, isDisabled: tab.isDisabled, emphasis: emphasis)
        let isHigh = emphasis == .high

        Button(action: action) {
            HStack(spacing: ILDSTokens.sp8) {
                if let icon = tab.icon {
                    icon
                        .foregroundStyle(colors.text)
                        .frame(width: ILDSTokens.fontSize14, height: ILDSTokens.fontSize14)
                }
                Text(tab.label)
                    .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold))
                    .foregroundStyle(colors.text)
            }
            .frame(height: 36)
            .padding(.horizontal, isHigh ? ILDSTokens.sp32 : ILDSTokens.sp12)
            .background(isHigh ? colors.background : Color.clear)
            .overlay(alignment: .bottom) {
                if !isHigh && isSelected {
                    Rectangle()
                        .fill(ILDSTokens.primaryOrange500)
                        .frame(height: 3)
                }
            }
            .overlay {
                if isHigh {
                    RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge)
                        .strokeBorder(colors.border, lineWidth: 1)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: isHigh ? ILDSTokens.radiusLarge : 0))
        }
        .buttonStyle(.plain)
        .disabled(tab.isDisabled)
        .accessibilityLabel(tab.label)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

private struct IldsTabColors {
    let background: Color
    let border: Color
    let text: Color

    static func resolve(isSelected: Bool, isDisabled: Bool, emphasis: IldsTabEmphasis) -> IldsTabColors {
        if isDisabled {
            return IldsTabColors(
                background: ILDSTokens.globalWhite000,
                border: ILDSTokens.neutralCoolgray200,
                text: ILDSTokens.neutralCoolgray300
            )
        }
        if emphasis == .high {
            if isSelected {
                return IldsTabColors(
                    background: ILDSTokens.primaryOrange500,
                    border: ILDSTokens.primaryOrange500,
                    text: ILDSTokens.globalWhite000
                )
            }
            return IldsTabColors(
                background: ILDSTokens.globalWhite000,
                border: ILDSTokens.neutralCoolgray200,
                text: ILDSTokens.neutralCoolgray800
            )
        }
        if isSelected {
            return IldsTabColors(
                background: Color.clear,
                border: ILDSTokens.primaryOrange500,
                text: ILDSTokens.primaryOrange500
            )
        }
        return IldsTabColors(
            background: Color.clear,
            border: Color.clear,
            text: ILDSTokens.neutralCoolgray800
        )
    }
}
