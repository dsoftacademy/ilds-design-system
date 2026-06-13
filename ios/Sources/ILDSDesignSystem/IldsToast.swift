import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_toast.dart + web Toast.tsx.

public enum IldsToastVariant: Sendable {
    case info, success, warning, error
}

public struct IldsToast: View {
    private let message: String
    private let title: String?
    private let variant: IldsToastVariant
    private let showIcon: Bool
    private let actionLabel: String?
    private let onAction: (() -> Void)?
    private let showClose: Bool
    private let onClose: (() -> Void)?
    private let showAccentBar: Bool

    public init(
        message: String,
        title: String? = nil,
        variant: IldsToastVariant = .info,
        showIcon: Bool = true,
        actionLabel: String? = nil,
        onAction: (() -> Void)? = nil,
        showClose: Bool = false,
        onClose: (() -> Void)? = nil,
        showAccentBar: Bool = true
    ) {
        self.message = message
        self.title = title
        self.variant = variant
        self.showIcon = showIcon
        self.actionLabel = actionLabel
        self.onAction = onAction
        self.showClose = showClose
        self.onClose = onClose
        self.showAccentBar = showAccentBar
    }

    public var body: some View {
        let colors = IldsToastColors.resolve(variant)
        let hasTitle = title.map { !$0.isEmpty } ?? false

        HStack(spacing: 0) {
            if showAccentBar {
                RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge)
                    .fill(colors.accent)
                    .frame(width: 4)
                    .clipShape(
                        UnevenRoundedRectangle(
                            topLeadingRadius: ILDSTokens.radiusLarge,
                            bottomLeadingRadius: ILDSTokens.radiusLarge
                        )
                    )
            }
            HStack(alignment: .top, spacing: ILDSTokens.sp12) {
                if showIcon {
                    Image(systemName: colors.iconName)
                        .font(.system(size: 22))
                        .foregroundStyle(colors.accent)
                }
                VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
                    if hasTitle, let title {
                        Text(title)
                            .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold))
                            .foregroundStyle(ILDSTokens.neutralCoolgray900)
                    }
                    Text(message)
                        .font(.system(
                            size: ILDSTokens.fontSize14,
                            weight: hasTitle ? ILDSTokens.fontWeightRegular : ILDSTokens.fontWeightMedium
                        ))
                        .foregroundStyle(ILDSTokens.neutralCoolgray500)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                if let actionLabel, onAction != nil {
                    Button(actionLabel, action: { onAction?() })
                        .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold))
                        .foregroundStyle(colors.accent)
                        .buttonStyle(.plain)
                }
                if showClose {
                    Button(action: { onClose?() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: ILDSTokens.sp20))
                            .foregroundStyle(ILDSTokens.neutralCoolgray400)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Close notification")
                }
            }
            .padding(.horizontal, ILDSTokens.sp16)
            .padding(.vertical, ILDSTokens.sp12)
        }
        .background(ILDSTokens.globalWhite000)
        .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusLarge))
        .shadow(color: .black.opacity(0.15), radius: 4, x: 0, y: 2)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(hasTitle ? "\(title ?? ""). \(message)" : message)
    }
}

private struct IldsToastColors {
    let accent: Color
    let iconName: String

    static func resolve(_ variant: IldsToastVariant) -> IldsToastColors {
        switch variant {
        case .info:
            return IldsToastColors(accent: ILDSTokens.primaryOrange500, iconName: "info.circle")
        case .success:
            return IldsToastColors(accent: ILDSTokens.successGreen600, iconName: "checkmark.circle")
        case .warning:
            return IldsToastColors(accent: ILDSTokens.warningAmber500, iconName: "exclamationmark.triangle")
        case .error:
            return IldsToastColors(accent: ILDSTokens.errorRed600, iconName: "exclamationmark.circle")
        }
    }
}
