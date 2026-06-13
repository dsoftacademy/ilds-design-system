import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_text_link.dart + web TextLink.tsx. TODO(web/desktop): hover states — mobile-first defer.

public enum IldsTextLinkSize: Sendable {
    case small, medium, large
}

public enum IldsTextLinkColour: Sendable {
    case defaultBlue, white
}

public struct IldsTextLink: View {
    private let label: String
    private let action: () -> Void
    private let size: IldsTextLinkSize
    private let colour: IldsTextLinkColour
    private let isVisited: Bool
    private let isDisabled: Bool
    private let prefixIcon: AnyView?
    private let suffixIcon: AnyView?

    public init(
        _ label: String,
        action: @escaping () -> Void,
        size: IldsTextLinkSize = .medium,
        colour: IldsTextLinkColour = .defaultBlue,
        isVisited: Bool = false,
        isDisabled: Bool = false,
        prefixIcon: (any View)? = nil,
        suffixIcon: (any View)? = nil
    ) {
        self.label = label
        self.action = action
        self.size = size
        self.colour = colour
        self.isVisited = isVisited
        self.isDisabled = isDisabled
        self.prefixIcon = prefixIcon.map { AnyView($0) }
        self.suffixIcon = suffixIcon.map { AnyView($0) }
    }

    public var body: some View {
        Button(action: action) {
            IldsTextLinkLabel(
                label: label,
                size: size,
                colour: colour,
                isVisited: isVisited,
                isDisabled: isDisabled,
                isPressed: false,
                prefixIcon: prefixIcon,
                suffixIcon: suffixIcon
            )
        }
        .buttonStyle(IldsTextLinkButtonStyle(
            label: label,
            size: size,
            colour: colour,
            isVisited: isVisited,
            isDisabled: isDisabled,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon
        ))
        .disabled(isDisabled)
        .accessibilityLabel(label)
        .accessibilityAddTraits(.isLink)
    }
}

private struct IldsTextLinkLabel: View {
    let label: String
    let size: IldsTextLinkSize
    let colour: IldsTextLinkColour
    let isVisited: Bool
    let isDisabled: Bool
    let isPressed: Bool
    let prefixIcon: AnyView?
    let suffixIcon: AnyView?

    var body: some View {
        let metrics = IldsTextLinkMetrics(size: size)
        let color = IldsTextLinkColors.resolve(
            colour: colour,
            isVisited: isVisited,
            isDisabled: isDisabled,
            isPressed: isPressed
        )

        HStack(spacing: ILDSTokens.sp4) {
            if let prefixIcon {
                prefixIcon
                    .foregroundStyle(color)
                    .frame(width: metrics.iconSize, height: metrics.iconSize)
            }
            Text(label)
                .font(metrics.font)
                .foregroundStyle(color)
                .underline(!isDisabled)
            if let suffixIcon {
                suffixIcon
                    .foregroundStyle(color)
                    .frame(width: metrics.iconSize, height: metrics.iconSize)
            }
        }
    }
}

private struct IldsTextLinkButtonStyle: ButtonStyle {
    let label: String
    let size: IldsTextLinkSize
    let colour: IldsTextLinkColour
    let isVisited: Bool
    let isDisabled: Bool
    let prefixIcon: AnyView?
    let suffixIcon: AnyView?

    func makeBody(configuration: Configuration) -> some View {
        IldsTextLinkLabel(
            label: label,
            size: size,
            colour: colour,
            isVisited: isVisited,
            isDisabled: isDisabled,
            isPressed: configuration.isPressed && !isDisabled,
            prefixIcon: prefixIcon,
            suffixIcon: suffixIcon
        )
    }
}

private struct IldsTextLinkMetrics {
    let font: Font
    let iconSize: CGFloat

    init(size: IldsTextLinkSize) {
        switch size {
        case .small:
            font = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize12
        case .medium:
            font = .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize14
        case .large:
            font = .system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightMedium)
            iconSize = ILDSTokens.fontSize16
        }
    }
}

private struct IldsTextLinkColors {
    static func resolve(
        colour: IldsTextLinkColour,
        isVisited: Bool,
        isDisabled: Bool,
        isPressed: Bool
    ) -> Color {
        if colour == .defaultBlue {
            if isDisabled { return ILDSTokens.neutralCoolgray300 }
            if isVisited { return ILDSTokens.neutralCoolgray500 }
            if isPressed { return ILDSTokens.informativeBlue700 }
            return ILDSTokens.informativeBlue500
        }
        if isDisabled { return ILDSTokens.neutralCoolgray400 }
        if isVisited { return ILDSTokens.neutralCoolgray300 }
        if isPressed { return ILDSTokens.neutralCoolgray300 }
        return ILDSTokens.globalWhite000
    }
}
