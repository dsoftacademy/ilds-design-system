import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_tag.dart + web Tag.tsx (filter tag). TODO(web/desktop): hover states — mobile-first defer.

public enum IldsTagSize: Sendable {
    case medium, large
}

public struct IldsTag: View {
    private let label: String
    private let isActive: Bool
    private let onTap: (() -> Void)?
    private let onRemove: (() -> Void)?
    private let prefixIcon: AnyView?
    private let size: IldsTagSize
    private let isDisabled: Bool

    public init(
        _ label: String,
        isActive: Bool = false,
        onTap: (() -> Void)? = nil,
        onRemove: (() -> Void)? = nil,
        prefixIcon: (any View)? = nil,
        size: IldsTagSize = .medium,
        isDisabled: Bool = false
    ) {
        self.label = label
        self.isActive = isActive
        self.onTap = onTap
        self.onRemove = onRemove
        self.prefixIcon = prefixIcon.map { AnyView($0) }
        self.size = size
        self.isDisabled = isDisabled
    }

    public var body: some View {
        Button {
            guard !isDisabled else { return }
            onTap?()
        } label: {
            IldsTagLabel(
                label: label,
                isActive: isActive,
                onRemove: onRemove,
                prefixIcon: prefixIcon,
                size: size,
                isDisabled: isDisabled,
                isPressed: false,
                isFocused: false
            )
        }
        .buttonStyle(IldsTagButtonStyle(
            label: label,
            isActive: isActive,
            onRemove: onRemove,
            prefixIcon: prefixIcon,
            size: size,
            isDisabled: isDisabled
        ))
        .disabled(isDisabled && onTap == nil)
        .accessibilityLabel(label)
        .accessibilityAddTraits(isActive ? .isSelected : [])
    }
}

private struct IldsTagLabel: View {
    let label: String
    let isActive: Bool
    let onRemove: (() -> Void)?
    let prefixIcon: AnyView?
    let size: IldsTagSize
    let isDisabled: Bool
    let isPressed: Bool
    let isFocused: Bool

    var body: some View {
        let metrics = IldsTagMetrics(size: size)
        let colors = IldsTagColors.resolve(
            isActive: isActive,
            isDisabled: isDisabled,
            isPressed: isPressed,
            isFocused: isFocused
        )

        HStack(spacing: ILDSTokens.sp4) {
            if let prefixIcon {
                prefixIcon
                    .foregroundStyle(colors.text)
                    .frame(width: metrics.iconSize, height: metrics.iconSize)
            }
            Text(label)
                .font(metrics.font)
                .foregroundStyle(colors.text)
            if let onRemove {
                Button(action: { onRemove() }) {
                    Image(systemName: "xmark")
                        .font(.system(size: metrics.iconSize))
                        .foregroundStyle(colors.text)
                }
                .buttonStyle(.plain)
                .disabled(isDisabled)
            }
        }
        .frame(height: metrics.height)
        .padding(.horizontal, metrics.horizontalPadding)
        .background(colors.background)
        .overlay {
            Capsule()
                .strokeBorder(colors.border, lineWidth: colors.borderWidth)
        }
        .clipShape(Capsule())
    }
}

private struct IldsTagButtonStyle: ButtonStyle {
    let label: String
    let isActive: Bool
    let onRemove: (() -> Void)?
    let prefixIcon: AnyView?
    let size: IldsTagSize
    let isDisabled: Bool

    func makeBody(configuration: Configuration) -> some View {
        IldsTagLabel(
            label: label,
            isActive: isActive,
            onRemove: onRemove,
            prefixIcon: prefixIcon,
            size: size,
            isDisabled: isDisabled,
            isPressed: configuration.isPressed && !isDisabled,
            isFocused: false
        )
    }
}

private struct IldsTagMetrics {
    let height: CGFloat
    let horizontalPadding: CGFloat
    let font: Font
    let iconSize: CGFloat

    init(size: IldsTagSize) {
        switch size {
        case .medium:
            height = ILDSTokens.sp32
            horizontalPadding = ILDSTokens.sp8
            font = .system(size: 13, weight: ILDSTokens.fontWeightMedium)
            iconSize = 13
        case .large:
            height = ILDSTokens.sp40
            horizontalPadding = ILDSTokens.sp12
            font = .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize14
        }
    }
}

private struct IldsTagColors {
    let background: Color
    let border: Color
    let text: Color
    let borderWidth: CGFloat

    static func resolve(
        isActive: Bool,
        isDisabled: Bool,
        isPressed: Bool,
        isFocused: Bool
    ) -> IldsTagColors {
        let background: Color
        if isDisabled {
            background = ILDSTokens.neutralCoolgray50
        } else if isActive {
            background = ILDSTokens.primaryOrange50
        } else if isPressed {
            background = ILDSTokens.neutralCoolgray100
        } else {
            background = ILDSTokens.globalWhite000
        }

        let border: Color
        if isDisabled {
            border = ILDSTokens.neutralCoolgray100
        } else if isActive || isFocused {
            border = ILDSTokens.primaryOrange500
        } else if isPressed {
            border = ILDSTokens.neutralCoolgray300
        } else {
            border = ILDSTokens.neutralCoolgray200
        }

        let text: Color
        if isDisabled {
            text = ILDSTokens.neutralCoolgray300
        } else if isActive || isFocused {
            text = ILDSTokens.primaryOrange600
        } else if isPressed {
            text = ILDSTokens.neutralCoolgray900
        } else {
            text = ILDSTokens.neutralCoolgray600
        }

        let borderWidth: CGFloat = isActive || isFocused ? 2 : 1
        return IldsTagColors(background: background, border: border, text: text, borderWidth: borderWidth)
    }
}
