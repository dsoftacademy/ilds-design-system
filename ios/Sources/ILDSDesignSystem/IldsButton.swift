import ILDSTokens
import SwiftUI

// Figma component set 13472:2804 — mirrors lib/ilds_button.dart + web Button.tsx.
// TODO(web/desktop): hover states — mobile-first defer (matches Flutter).

public enum IldsButtonType: Sendable {
    case primary, secondary, tertiary
}

public enum IldsButtonSize: Sendable {
    case large, medium, small
}

public enum IldsButtonAppearance: Sendable {
    case normal, destructive
}

public struct IldsButton: View {
    private let label: String?
    private let action: () -> Void
    private let type: IldsButtonType
    private let size: IldsButtonSize
    private let appearance: IldsButtonAppearance
    private let isDisabled: Bool
    private let isLoading: Bool
    private let iconOnly: Bool
    private let semanticLabel: String?
    private let leading: AnyView?
    private let trailing: AnyView?
    private let icon: AnyView?

    /// Labeled button with optional leading/trailing icon slots.
    public init(
        _ label: String,
        action: @escaping () -> Void,
        type: IldsButtonType = .primary,
        size: IldsButtonSize = .large,
        appearance: IldsButtonAppearance = .normal,
        isDisabled: Bool = false,
        isLoading: Bool = false,
        leading: (any View)? = nil,
        trailing: (any View)? = nil
    ) {
        self.label = label
        self.action = action
        self.type = type
        self.size = size
        self.appearance = appearance
        self.isDisabled = isDisabled
        self.isLoading = isLoading
        self.iconOnly = false
        self.semanticLabel = nil
        self.leading = leading.map { AnyView($0) }
        self.trailing = trailing.map { AnyView($0) }
        self.icon = nil
    }

    /// Icon-only button (Figma 13472:2810 L, 13472:3718 S). Requires semanticLabel.
    public init(
        icon: some View,
        semanticLabel: String,
        action: @escaping () -> Void,
        type: IldsButtonType = .primary,
        size: IldsButtonSize = .large,
        appearance: IldsButtonAppearance = .normal,
        isDisabled: Bool = false,
        isLoading: Bool = false
    ) {
        self.label = nil
        self.action = action
        self.type = type
        self.size = size
        self.appearance = appearance
        self.isDisabled = isDisabled
        self.isLoading = isLoading
        self.iconOnly = true
        self.semanticLabel = semanticLabel
        self.leading = nil
        self.trailing = nil
        self.icon = AnyView(icon)
    }

    public var body: some View {
        Button(action: action) {
            IldsButtonLabel(
                label: label,
                type: type,
                size: size,
                appearance: appearance,
                isDisabled: isDisabled,
                isLoading: isLoading,
                iconOnly: iconOnly,
                leading: leading,
                trailing: trailing,
                icon: icon
            )
        }
        .buttonStyle(
            IldsButtonStyle(
                type: type,
                size: size,
                appearance: appearance,
                isDisabled: isDisabled,
                isLoading: isLoading,
                iconOnly: iconOnly
            )
        )
        .disabled(isDisabled || isLoading)
        .accessibilityLabel(iconOnly ? (semanticLabel ?? "") : (label ?? ""))
    }
}

// MARK: - Label row

private struct IldsButtonLabel: View {
    let label: String?
    let type: IldsButtonType
    let size: IldsButtonSize
    let appearance: IldsButtonAppearance
    let isDisabled: Bool
    let isLoading: Bool
    let iconOnly: Bool
    let leading: AnyView?
    let trailing: AnyView?
    let icon: AnyView?

    var body: some View {
        let colors = IldsButtonColors.resolve(
            type: type,
            appearance: appearance,
            isPressed: false,
            isDisabled: isDisabled,
            isLoading: isLoading
        )
        let metrics = IldsButtonMetrics(type: type, size: size, iconOnly: iconOnly)
        let leadingContent = iconOnly ? icon : leading

        HStack(spacing: metrics.gap) {
            if let leadingContent {
                iconSlot(leadingContent, color: colors.foreground, size: metrics.iconSlot)
                if !iconOnly, label != nil {
                    Spacer().frame(width: 0)
                }
            }
            if !iconOnly, let label {
                Text(label)
                    .font(metrics.font)
                    .foregroundStyle(colors.foreground)
                    .lineLimit(1)
            }
            if isLoading {
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(colors.foreground)
                    .frame(width: metrics.iconSlot, height: metrics.iconSlot)
            } else if !iconOnly, let trailing {
                iconSlot(trailing, color: colors.foreground, size: metrics.iconSlot)
            }
        }
        .frame(minHeight: metrics.minHeight)
        .padding(metrics.padding)
    }

    private func iconSlot(_ content: AnyView, color: Color, size: CGFloat) -> some View {
        content
            .foregroundStyle(color)
            .frame(width: size, height: size)
    }
}

// MARK: - Button style (pressed / overlay)

private struct IldsButtonStyle: ButtonStyle {
    let type: IldsButtonType
    let size: IldsButtonSize
    let appearance: IldsButtonAppearance
    let isDisabled: Bool
    let isLoading: Bool
    let iconOnly: Bool

    func makeBody(configuration: Configuration) -> some View {
        let pressed = configuration.isPressed && !isDisabled && !isLoading
        let colors = IldsButtonColors.resolve(
            type: type,
            appearance: appearance,
            isPressed: pressed,
            isDisabled: isDisabled,
            isLoading: isLoading
        )
        let primaryOverlay = IldsButtonColors.primaryPressedOverlay(
            type: type,
            appearance: appearance,
            isPressed: pressed,
            isDisabled: isDisabled,
            isLoading: isLoading
        )

        configuration.label
            .foregroundStyle(colors.foreground)
            .background(colors.background)
            .overlay {
                if let primaryOverlay {
                    RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge)
                        .fill(primaryOverlay)
                }
            }
            .overlay {
                if colors.borderWidth > 0, let border = colors.borderColor {
                    RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge)
                        .strokeBorder(border, lineWidth: colors.borderWidth)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge))
            .animation(.easeInOut(duration: 0.15), value: pressed)
    }
}

// MARK: - Metrics

private struct IldsButtonMetrics {
    let padding: EdgeInsets
    let gap: CGFloat
    let minHeight: CGFloat
    let iconSlot: CGFloat
    let font: Font

    init(type: IldsButtonType, size: IldsButtonSize, iconOnly: Bool) {
        if iconOnly && size == .small {
            padding = EdgeInsets(top: ILDSTokens.sp6, leading: ILDSTokens.sp8, bottom: ILDSTokens.sp6, trailing: ILDSTokens.sp8)
        } else if type == .tertiary {
            switch size {
            case .large:
                padding = EdgeInsets(top: ILDSTokens.sp12, leading: 0, bottom: ILDSTokens.sp12, trailing: 0)
            case .medium:
                padding = EdgeInsets(top: ILDSTokens.sp8, leading: 0, bottom: ILDSTokens.sp8, trailing: 0)
            case .small:
                padding = EdgeInsets(top: ILDSTokens.sp6, leading: 0, bottom: ILDSTokens.sp6, trailing: 0)
            }
        } else {
            switch size {
            case .large:
                padding = EdgeInsets(top: ILDSTokens.sp12, leading: ILDSTokens.sp16, bottom: ILDSTokens.sp12, trailing: ILDSTokens.sp16)
            case .medium:
                padding = EdgeInsets(top: ILDSTokens.sp8, leading: ILDSTokens.sp12, bottom: ILDSTokens.sp8, trailing: ILDSTokens.sp12)
            case .small:
                padding = EdgeInsets(top: ILDSTokens.sp6, leading: ILDSTokens.sp12, bottom: ILDSTokens.sp6, trailing: ILDSTokens.sp12)
            }
        }
        switch size {
        case .large, .medium:
            gap = ILDSTokens.sp8
            iconSlot = size == .large ? 24 : 20
            minHeight = size == .large ? 48 : 36
            font = size == .large
                ? .system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightBold)
                : .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold)
        case .small:
            gap = ILDSTokens.sp6
            iconSlot = 12
            minHeight = 28
            font = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightBold)
        }
    }
}

// MARK: - Color resolution (mirrors Flutter _resolveColors)

private struct IldsButtonColors {
    let background: Color
    let foreground: Color
    let borderColor: Color?
    let borderWidth: CGFloat

    static func accent(for appearance: IldsButtonAppearance) -> Color {
        appearance == .normal ? ILDSTokens.primaryOrange500 : ILDSTokens.errorRed600
    }

    static func primaryPressedOverlay(
        type: IldsButtonType,
        appearance: IldsButtonAppearance,
        isPressed: Bool,
        isDisabled: Bool,
        isLoading: Bool
    ) -> Color? {
        guard type == .primary, isPressed, !isDisabled, !isLoading else { return nil }
        return appearance == .normal ? ILDSTokens.primaryOrange600 : ILDSTokens.errorRed700
    }

    static func resolve(
        type: IldsButtonType,
        appearance: IldsButtonAppearance,
        isPressed: Bool,
        isDisabled: Bool,
        isLoading: Bool
    ) -> IldsButtonColors {
        let accent = accent(for: appearance)

        if isDisabled {
            switch type {
            case .primary:
                return IldsButtonColors(
                    background: ILDSTokens.neutralCoolgray400,
                    foreground: ILDSTokens.globalWhite000,
                    borderColor: nil,
                    borderWidth: 0
                )
            case .secondary:
                return IldsButtonColors(
                    background: ILDSTokens.neutralCoolgray50,
                    foreground: ILDSTokens.neutralCoolgray400,
                    borderColor: ILDSTokens.neutralCoolgray400,
                    borderWidth: 1
                )
            case .tertiary:
                return IldsButtonColors(
                    background: .clear,
                    foreground: ILDSTokens.neutralCoolgray400,
                    borderColor: nil,
                    borderWidth: 0
                )
            }
        }

        if isLoading {
            switch type {
            case .primary:
                return IldsButtonColors(background: accent, foreground: ILDSTokens.globalWhite000, borderColor: nil, borderWidth: 0)
            case .secondary:
                return IldsButtonColors(background: ILDSTokens.globalWhite000, foreground: accent, borderColor: accent, borderWidth: 1)
            case .tertiary:
                return IldsButtonColors(background: .clear, foreground: accent, borderColor: nil, borderWidth: 0)
            }
        }

        if isPressed {
            switch type {
            case .primary:
                break // overlay handles primary pressed
            case .secondary:
                if appearance == .normal {
                    return IldsButtonColors(
                        background: ILDSTokens.primaryOrange100,
                        foreground: ILDSTokens.primaryOrange600,
                        borderColor: ILDSTokens.primaryOrange600,
                        borderWidth: 1
                    )
                }
                return IldsButtonColors(
                    background: ILDSTokens.errorRed100,
                    foreground: ILDSTokens.errorRed700,
                    borderColor: ILDSTokens.errorRed600,
                    borderWidth: 1
                )
            case .tertiary:
                if appearance == .normal {
                    return IldsButtonColors(background: .clear, foreground: ILDSTokens.primaryOrange600, borderColor: nil, borderWidth: 0)
                }
                return IldsButtonColors(background: .clear, foreground: ILDSTokens.errorRed700, borderColor: nil, borderWidth: 0)
            }
        }

        switch type {
        case .primary:
            return IldsButtonColors(background: accent, foreground: ILDSTokens.globalWhite000, borderColor: nil, borderWidth: 0)
        case .secondary:
            return IldsButtonColors(background: ILDSTokens.globalWhite000, foreground: accent, borderColor: accent, borderWidth: 1)
        case .tertiary:
            return IldsButtonColors(background: .clear, foreground: accent, borderColor: nil, borderWidth: 0)
        }
    }
}
