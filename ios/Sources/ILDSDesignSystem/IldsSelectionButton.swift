import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_selection_button.dart + web SelectionButton.tsx. TODO(web/desktop): hover states — mobile-first defer.

public enum IldsSelectionButtonSize: Sendable {
    case small, medium, large
}

public enum IldsSelectionButtonVariant: Sendable {
    case labelOnly, labelWithSuffix, iconOnly
}

public struct IldsSelectionButton: View {
    private let label: String
    private let isSelected: Bool
    private let action: () -> Void
    private let suffixIcon: AnyView?
    private let variant: IldsSelectionButtonVariant
    private let size: IldsSelectionButtonSize
    private let isDisabled: Bool

    public init(
        _ label: String,
        isSelected: Bool,
        action: @escaping () -> Void,
        suffixIcon: (any View)? = nil,
        variant: IldsSelectionButtonVariant = .labelOnly,
        size: IldsSelectionButtonSize = .medium,
        isDisabled: Bool = false
    ) {
        self.label = label
        self.isSelected = isSelected
        self.action = action
        self.suffixIcon = suffixIcon.map { AnyView($0) }
        self.variant = variant
        self.size = size
        self.isDisabled = isDisabled
    }

    public var body: some View {
        Button(action: action) {
            IldsSelectionButtonLabel(
                label: label,
                isSelected: isSelected,
                suffixIcon: suffixIcon,
                variant: variant,
                size: size,
                isDisabled: isDisabled,
                isPressed: false,
                isFocused: false
            )
        }
        .buttonStyle(IldsSelectionButtonStyle(
            label: label,
            isSelected: isSelected,
            suffixIcon: suffixIcon,
            variant: variant,
            size: size,
            isDisabled: isDisabled
        ))
        .disabled(isDisabled)
        .accessibilityLabel(label)
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

private struct IldsSelectionButtonLabel: View {
    let label: String
    let isSelected: Bool
    let suffixIcon: AnyView?
    let variant: IldsSelectionButtonVariant
    let size: IldsSelectionButtonSize
    let isDisabled: Bool
    let isPressed: Bool
    let isFocused: Bool

    var body: some View {
        let metrics = IldsSelectionButtonMetrics(size: size)
        let colors = IldsSelectionButtonColors.resolve(
            isSelected: isSelected,
            isDisabled: isDisabled,
            isPressed: isPressed,
            isFocused: isFocused
        )
        let iconOnly = variant == .iconOnly

        HStack(spacing: ILDSTokens.sp4) {
            if !iconOnly {
                Text(label)
                    .font(metrics.font)
                    .foregroundStyle(colors.text)
            }
            if variant == .labelWithSuffix, let suffixIcon {
                suffixIcon
                    .foregroundStyle(colors.text)
                    .frame(width: metrics.iconSize, height: metrics.iconSize)
            }
            if iconOnly {
                Group {
                    if let suffixIcon {
                        suffixIcon
                    } else {
                        Image(systemName: "checkmark")
                    }
                }
                .foregroundStyle(colors.text)
                .frame(width: metrics.iconSize, height: metrics.iconSize)
            }
        }
        .frame(height: metrics.height)
        .padding(.horizontal, metrics.horizontalPadding)
        .background(colors.background)
        .overlay {
            RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                .strokeBorder(colors.border, lineWidth: colors.borderWidth)
        }
        .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))
    }
}

private struct IldsSelectionButtonStyle: ButtonStyle {
    let label: String
    let isSelected: Bool
    let suffixIcon: AnyView?
    let variant: IldsSelectionButtonVariant
    let size: IldsSelectionButtonSize
    let isDisabled: Bool

    func makeBody(configuration: Configuration) -> some View {
        IldsSelectionButtonLabel(
            label: label,
            isSelected: isSelected,
            suffixIcon: suffixIcon,
            variant: variant,
            size: size,
            isDisabled: isDisabled,
            isPressed: configuration.isPressed && !isDisabled,
            isFocused: false
        )
    }
}

private struct IldsSelectionButtonMetrics {
    let height: CGFloat
    let horizontalPadding: CGFloat
    let font: Font
    let iconSize: CGFloat

    init(size: IldsSelectionButtonSize) {
        switch size {
        case .small:
            height = ILDSTokens.sp32
            horizontalPadding = ILDSTokens.sp8
            font = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize12
        case .medium:
            height = ILDSTokens.sp40
            horizontalPadding = ILDSTokens.sp12
            font = .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize14
        case .large:
            height = ILDSTokens.sp48
            horizontalPadding = ILDSTokens.sp16
            font = .system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize16
        }
    }
}

private struct IldsSelectionButtonColors {
    let background: Color
    let text: Color
    let border: Color
    let borderWidth: CGFloat

    static func resolve(
        isSelected: Bool,
        isDisabled: Bool,
        isPressed: Bool,
        isFocused: Bool
    ) -> IldsSelectionButtonColors {
        let background: Color
        if isDisabled {
            background = ILDSTokens.neutralCoolgray50
        } else if isSelected {
            background = ILDSTokens.primaryOrange50
        } else if isPressed {
            background = ILDSTokens.neutralCoolgray100
        } else {
            background = ILDSTokens.globalWhite000
        }

        let text: Color
        if isDisabled {
            text = ILDSTokens.neutralCoolgray300
        } else if isSelected || isFocused {
            text = ILDSTokens.primaryOrange500
        } else if isPressed {
            text = ILDSTokens.neutralCoolgray900
        } else {
            text = ILDSTokens.neutralCoolgray600
        }

        let border: Color
        if isDisabled {
            border = ILDSTokens.neutralCoolgray100
        } else if isSelected || isFocused {
            border = ILDSTokens.primaryOrange500
        } else if isPressed {
            border = ILDSTokens.neutralCoolgray300
        } else {
            border = ILDSTokens.neutralCoolgray200
        }

        let borderWidth: CGFloat = isSelected || isFocused ? 2 : 1
        return IldsSelectionButtonColors(background: background, text: text, border: border, borderWidth: borderWidth)
    }
}
