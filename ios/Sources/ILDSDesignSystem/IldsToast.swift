import ILDSTokens
import SwiftUI

// Figma set 17708:3491 — mirrors web/Toast.tsx + android/IldsToast.kt.

public enum IldsToastVariant: Sendable {
    case info, success, warning, error
}

public struct IldsToastAction {
    public let label: String
    public let action: () -> Void

    public init(label: String, action: @escaping () -> Void) {
        self.label = label
        self.action = action
    }
}

public struct IldsToastActions {
    public let primary: IldsToastAction?
    public let secondary: IldsToastAction?

    public init(primary: IldsToastAction? = nil, secondary: IldsToastAction? = nil) {
        self.primary = primary
        self.secondary = secondary
    }
}

public struct IldsToast: View {
    private let message: String
    private let heading: String?
    private let variant: IldsToastVariant
    private let showClose: Bool
    private let actions: IldsToastActions?
    private let onClose: (() -> Void)?

    public init(
        variant: IldsToastVariant,
        message: String,
        heading: String? = nil,
        showClose: Bool = false,
        actions: IldsToastActions? = nil,
        onClose: (() -> Void)? = nil
    ) {
        self.variant = variant
        self.message = message
        self.heading = heading
        self.showClose = showClose
        self.actions = actions
        self.onClose = onClose
    }

    public var body: some View {
        let style = IldsToastStyle.resolve(variant)
        let hasHeading = heading.map { !$0.isEmpty } ?? false

        VStack(alignment: .leading, spacing: ILDSTokens.sp12) {
            HStack(alignment: .top, spacing: ILDSTokens.sp8) {
                Image(systemName: style.iconName)
                    .font(.system(size: 24))
                    .foregroundStyle(style.iconColor)
                    .frame(width: 24, height: 24)

                VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
                    if hasHeading, let heading {
                        Text(heading)
                            .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold))
                            .foregroundStyle(ILDSTokens.neutralCoolgray900)
                    }
                    Text(message)
                        .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular))
                        .foregroundStyle(ILDSTokens.neutralCoolgray800)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                if showClose, onClose != nil {
                    Button(action: { onClose?() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: ILDSTokens.sp20))
                            .foregroundStyle(ILDSTokens.neutralCoolgray500)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Close notification")
                }
            }

            if actions?.secondary != nil || actions?.primary != nil {
                HStack(spacing: ILDSTokens.sp8) {
                    if let secondary = actions?.secondary {
                        IldsButton(
                            secondary.label,
                            action: secondary.action,
                            type: .secondary,
                            size: .medium
                        )
                    }
                    if let primary = actions?.primary {
                        IldsButton(
                            primary.label,
                            action: primary.action,
                            type: .primary,
                            size: .medium
                        )
                    }
                }
            }
        }
        .padding(ILDSTokens.sp12)
        .frame(maxWidth: 320)
        .background(ILDSTokens.globalWhite000)
        .overlay {
            RoundedRectangle(cornerRadius: ILDSTokens.radiusXlarge)
                .strokeBorder(style.border, lineWidth: 1)
        }
        .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusXlarge))
        .shadow(color: ILDSTokens.neutralCoolgray300.opacity(0.5), radius: 6, x: 0, y: 4)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(hasHeading ? "\(heading ?? ""). \(message)" : message)
    }
}

private struct IldsToastStyle {
    let border: Color
    let iconColor: Color
    let iconName: String

    static func resolve(_ variant: IldsToastVariant) -> IldsToastStyle {
        switch variant {
        case .success:
            return IldsToastStyle(
                border: ILDSTokens.successGreen50,
                iconColor: ILDSTokens.successGreen500,
                iconName: "checkmark.circle"
            )
        case .info:
            return IldsToastStyle(
                border: ILDSTokens.secondaryBlue50,
                iconColor: ILDSTokens.informativeBlue500,
                iconName: "info.circle"
            )
        case .warning:
            return IldsToastStyle(
                border: ILDSTokens.warningAmber50,
                iconColor: ILDSTokens.warningAmber500,
                iconName: "exclamationmark.triangle"
            )
        case .error:
            return IldsToastStyle(
                border: ILDSTokens.errorRed50,
                iconColor: ILDSTokens.errorRed600,
                iconName: "exclamationmark.circle"
            )
        }
    }
}
