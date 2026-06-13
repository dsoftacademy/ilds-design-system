import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_tab.dart + web Tabs.tsx. TODO(web/desktop): hover states — mobile-first defer.

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
        VStack(spacing: 0) {
            ScrollView(.horizontal, showsIndicators: false) {
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
                .overlay(alignment: .bottomLeading) {
                    IldsTabIndicator(
                        tabs: tabs,
                        selectedIndex: selectedIndex,
                        emphasis: emphasis
                    )
                }
            }
            Divider()
                .background(ILDSTokens.neutralCoolgray200)
        }
    }
}

private struct IldsTabCell: View {
    let tab: IldsTabItem
    let isSelected: Bool
    let emphasis: IldsTabEmphasis
    let action: () -> Void

    var body: some View {
        let colors = IldsTabColors.resolve(isSelected: isSelected, isDisabled: tab.isDisabled, emphasis: emphasis)

        Button(action: action) {
            HStack(spacing: ILDSTokens.sp4) {
                if let icon = tab.icon {
                    icon
                        .foregroundStyle(colors.text)
                        .frame(width: ILDSTokens.fontSize14, height: ILDSTokens.fontSize14)
                }
                Text(tab.label)
                    .font(.system(
                        size: ILDSTokens.fontSize14,
                        weight: isSelected ? ILDSTokens.fontWeightBold : ILDSTokens.fontWeightMedium
                    ))
                    .foregroundStyle(colors.text)
            }
            .frame(height: ILDSTokens.sp48)
            .padding(.horizontal, ILDSTokens.sp12)
        }
        .buttonStyle(.plain)
        .disabled(tab.isDisabled)
        .accessibilityLabel(tab.label)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

private struct IldsTabIndicator: View {
    let tabs: [IldsTabItem]
    let selectedIndex: Int
    let emphasis: IldsTabEmphasis

    var body: some View {
        GeometryReader { geo in
            let tabWidth = tabs.isEmpty ? 0 : geo.size.width / CGFloat(tabs.count)
            let color = emphasis == .high ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray900
            Rectangle()
                .fill(color)
                .frame(width: tabWidth, height: 3)
                .offset(x: tabWidth * CGFloat(selectedIndex))
                .animation(.easeOut(duration: 0.15), value: selectedIndex)
        }
        .frame(height: 3)
    }
}

private struct IldsTabColors {
    let text: Color

    static func resolve(isSelected: Bool, isDisabled: Bool, emphasis: IldsTabEmphasis) -> IldsTabColors {
        if isDisabled {
            return IldsTabColors(text: ILDSTokens.neutralCoolgray300)
        }
        if isSelected {
            let color = emphasis == .high ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray900
            return IldsTabColors(text: color)
        }
        return IldsTabColors(text: ILDSTokens.neutralCoolgray400)
    }
}
