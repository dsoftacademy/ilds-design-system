import ILDSTokens
import SwiftUI

// Figma "Tag" filter chip — component set 14018:6786; mirrors lib/ilds_chip.dart + web Chip.tsx.

public enum IldsChipSize: Sendable {
    case large, medium
}

public struct IldsChip: View {
    private let label: String
    private let size: IldsChipSize
    private let isSelected: Bool
    private let isDisabled: Bool
    private let hasPrefixIcon: Bool
    private let prefixIcon: AnyView?
    private let hasSuffixButton: Bool
    private let onPress: (() -> Void)?
    private let onRemove: (() -> Void)?

    public init(
        _ label: String,
        size: IldsChipSize = .large,
        isSelected: Bool = false,
        isDisabled: Bool = false,
        hasPrefixIcon: Bool = false,
        prefixIcon: (any View)? = nil,
        hasSuffixButton: Bool = false,
        onPress: (() -> Void)? = nil,
        onRemove: (() -> Void)? = nil
    ) {
        self.label = label
        self.size = size
        self.isSelected = isSelected
        self.isDisabled = isDisabled
        self.hasPrefixIcon = hasPrefixIcon
        self.prefixIcon = prefixIcon.map { AnyView($0) }
        self.hasSuffixButton = hasSuffixButton
        self.onPress = onPress
        self.onRemove = onRemove
    }

    public var body: some View {
        let colors = IldsChipColors.resolve(isSelected: isSelected, isDisabled: isDisabled)
        let metrics = IldsChipMetrics(size: size)

        HStack(spacing: metrics.gap) {
            if hasPrefixIcon, let prefixIcon {
                prefixIcon
                    .foregroundStyle(ILDSTokens.primaryOrange500)
                    .frame(width: metrics.iconSlot, height: metrics.iconSlot)
                    .padding(.top, 2)
            }
            Text(label)
                .font(metrics.font)
                .foregroundStyle(colors.label)
                .lineLimit(1)
            if hasSuffixButton {
                Button(action: { onRemove?() }) {
                    Image(systemName: "xmark.circle")
                        .font(.system(size: metrics.iconSlot))
                        .foregroundStyle(colors.label)
                }
                .buttonStyle(.plain)
                .disabled(isDisabled)
                .padding(.top, 2)
            }
        }
        .frame(height: metrics.height)
        .padding(.horizontal, metrics.horizontalPadding)
        .padding(.vertical, metrics.verticalPadding)
        .background(colors.background)
        .overlay {
            RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                .strokeBorder(colors.border, lineWidth: 0.5)
        }
        .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))
        .contentShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))
        .onTapGesture {
            guard !isDisabled, !hasSuffixButton else { return }
            onPress?()
        }
        .accessibilityAddTraits(isSelected ? .isSelected : [])
        .accessibilityLabel("\(label) chip")
        .allowsHitTesting(!isDisabled)
    }
}

private struct IldsChipColors {
    let background: Color
    let border: Color
    let label: Color

    static func resolve(isSelected: Bool, isDisabled: Bool) -> IldsChipColors {
        if isDisabled {
            return IldsChipColors(
                background: ILDSTokens.neutralCoolgray200,
                border: ILDSTokens.neutralCoolgray300,
                label: ILDSTokens.neutralCoolgray500
            )
        }
        if isSelected {
            return IldsChipColors(
                background: ILDSTokens.primaryOrange50,
                border: ILDSTokens.primaryOrange500,
                label: ILDSTokens.neutralCoolgray900
            )
        }
        return IldsChipColors(
            background: ILDSTokens.globalWhite000,
            border: ILDSTokens.neutralCoolgray500,
            label: ILDSTokens.neutralCoolgray900
        )
    }
}

private struct IldsChipMetrics {
    let height: CGFloat
    let horizontalPadding: CGFloat
    let verticalPadding: CGFloat
    let gap: CGFloat
    let iconSlot: CGFloat
    let font: Font

    init(size: IldsChipSize) {
        switch size {
        case .large:
            height = 24
            horizontalPadding = ILDSTokens.sp8
            verticalPadding = ILDSTokens.sp4
            gap = ILDSTokens.sp4
            iconSlot = 12
        case .medium:
            height = 20
            horizontalPadding = ILDSTokens.sp4
            verticalPadding = ILDSTokens.sp2
            gap = ILDSTokens.sp2
            iconSlot = 12
        }
        font = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular)
    }
}
