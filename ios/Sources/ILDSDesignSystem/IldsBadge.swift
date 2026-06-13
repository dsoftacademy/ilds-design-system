import ILDSTokens
import SwiftUI

public enum IldsBadgeVariant: Sendable {
    case subtle, intense, success, error, warning, info, skeleton
}

public enum IldsBadgeSize: Sendable { case small, medium, large }

public struct IldsBadge: View {
    private let label: String
    private let variant: IldsBadgeVariant
    private let size: IldsBadgeSize

    public init(_ label: String, variant: IldsBadgeVariant = .subtle, size: IldsBadgeSize = .medium) {
        self.label = label
        self.variant = variant
        self.size = size
    }

    public var body: some View {
        let colors = IldsBadgeColors.resolve(variant)
        Text(variant == .skeleton ? "   " : label)
            .font(metrics.font)
            .foregroundStyle(colors.foreground)
            .padding(.horizontal, metrics.hPad)
            .padding(.vertical, metrics.vPad)
            .background(colors.background)
            .clipShape(Capsule())
    }

    private var metrics: (font: Font, hPad: CGFloat, vPad: CGFloat) {
        switch size {
        case .small: return (.system(size: 11, weight: .medium), ILDSTokens.sp8, 2)
        case .medium: return (.system(size: ILDSTokens.fontSize12, weight: .medium), ILDSTokens.sp8, ILDSTokens.sp4)
        case .large: return (.system(size: 13, weight: .medium), ILDSTokens.sp12, ILDSTokens.sp4)
        }
    }
}

private struct IldsBadgeColors {
    let background: Color
    let foreground: Color
    static func resolve(_ v: IldsBadgeVariant) -> IldsBadgeColors {
        switch v {
        case .subtle: return .init(background: ILDSTokens.secondaryBlue50, foreground: ILDSTokens.secondaryBlue500)
        case .intense: return .init(background: ILDSTokens.secondaryBlue500, foreground: ILDSTokens.globalWhite000)
        case .success: return .init(background: ILDSTokens.successGreen500, foreground: ILDSTokens.globalWhite000)
        case .error: return .init(background: ILDSTokens.errorRed600, foreground: ILDSTokens.globalWhite000)
        case .warning: return .init(background: ILDSTokens.warningAmber500, foreground: ILDSTokens.globalWhite000)
        case .info: return .init(background: ILDSTokens.informativeBlue500, foreground: ILDSTokens.globalWhite000)
        case .skeleton: return .init(background: ILDSTokens.neutralCoolgray100, foreground: .clear)
        }
    }
}
