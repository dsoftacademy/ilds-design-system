import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_switch.dart + web Switch.tsx. TODO(web/desktop): hover states — mobile-first defer.

public enum IldsSwitchSize: Sendable {
    case small, medium, large
}

public struct IldsSwitch: View {
    @Binding private var isOn: Bool
    private let label: String?
    private let size: IldsSwitchSize
    private let isDisabled: Bool
    private let leadingIcon: AnyView?

    public init(
        isOn: Binding<Bool>,
        label: String? = nil,
        size: IldsSwitchSize = .medium,
        isDisabled: Bool = false,
        leadingIcon: (any View)? = nil
    ) {
        _isOn = isOn
        self.label = label
        self.size = size
        self.isDisabled = isDisabled
        self.leadingIcon = leadingIcon.map { AnyView($0) }
    }

    public var body: some View {
        let metrics = IldsSwitchMetrics(size: size)
        let colors = IldsSwitchColors.resolve(isOn: isOn, isDisabled: isDisabled, isPressed: false)

        Button {
            guard !isDisabled else { return }
            isOn.toggle()
        } label: {
            HStack(spacing: ILDSTokens.sp8) {
                if let leadingIcon {
                    leadingIcon
                        .foregroundStyle(colors.label)
                        .frame(width: metrics.labelIconSize, height: metrics.labelIconSize)
                }
                IldsSwitchTrack(isOn: isOn, size: size, isDisabled: isDisabled, isPressed: false)
                if let label {
                    Text(label)
                        .font(metrics.labelFont)
                        .foregroundStyle(colors.label)
                }
            }
        }
        .buttonStyle(IldsSwitchButtonStyle(isDisabled: isDisabled))
        .disabled(isDisabled)
        .accessibilityLabel(label ?? "Switch")
        .accessibilityAddTraits(isOn ? .isSelected : [])
    }
}

// MARK: - Track

private struct IldsSwitchTrack: View {
    let isOn: Bool
    let size: IldsSwitchSize
    let isDisabled: Bool
    let isPressed: Bool

    init(isOn: Bool, size: IldsSwitchSize, isDisabled: Bool, isPressed: Bool = false) {
        self.isOn = isOn
        self.size = size
        self.isDisabled = isDisabled
        self.isPressed = isPressed
    }

    var body: some View {
        let metrics = IldsSwitchMetrics(size: size)
        let colors = IldsSwitchColors.resolve(isOn: isOn, isDisabled: isDisabled, isPressed: isPressed)
        let thumbOffset = isOn
            ? metrics.trackWidth - metrics.thumbSize - metrics.padding
            : metrics.padding

        ZStack(alignment: .leading) {
            Capsule()
                .fill(colors.track)
                .frame(width: metrics.trackWidth, height: metrics.trackHeight)
            Circle()
                .fill(colors.thumb)
                .frame(width: metrics.thumbSize, height: metrics.thumbSize)
                .offset(x: thumbOffset)
                .animation(.easeInOut(duration: 0.2), value: isOn)
        }
    }
}

private struct IldsSwitchButtonStyle: ButtonStyle {
    let isDisabled: Bool

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(isDisabled ? 0.6 : 1)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Metrics

private struct IldsSwitchMetrics {
    let trackWidth: CGFloat
    let trackHeight: CGFloat
    let thumbSize: CGFloat
    let padding: CGFloat
    let labelFont: Font
    let labelIconSize: CGFloat

    init(size: IldsSwitchSize) {
        padding = ILDSTokens.sp4
        switch size {
        case .small:
            trackWidth = ILDSTokens.sp32 + ILDSTokens.sp4
            trackHeight = ILDSTokens.sp20
            thumbSize = ILDSTokens.sp16
            labelFont = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular)
            labelIconSize = ILDSTokens.sp12
        case .medium:
            trackWidth = ILDSTokens.sp40 + ILDSTokens.sp4
            trackHeight = ILDSTokens.sp24
            thumbSize = ILDSTokens.sp20
            labelFont = .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular)
            labelIconSize = ILDSTokens.fontSize14
        case .large:
            trackWidth = ILDSTokens.sp48 + ILDSTokens.sp4
            trackHeight = ILDSTokens.sp24 + ILDSTokens.sp4
            thumbSize = ILDSTokens.sp24
            labelFont = .system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightRegular)
            labelIconSize = ILDSTokens.sp16
        }
    }
}

// MARK: - Colors

private struct IldsSwitchColors {
    let track: Color
    let thumb: Color
    let label: Color

    static func resolve(isOn: Bool, isDisabled: Bool, isPressed: Bool) -> IldsSwitchColors {
        let track: Color
        if isDisabled {
            track = isOn ? ILDSTokens.primaryOrange200 : ILDSTokens.neutralCoolgray100
        } else if isPressed {
            track = isOn ? ILDSTokens.primaryOrange700 : ILDSTokens.neutralCoolgray400
        } else {
            track = isOn ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray100
        }
        let thumb: Color = isDisabled && !isOn ? ILDSTokens.neutralCoolgray200 : ILDSTokens.globalWhite000
        let label = isDisabled ? ILDSTokens.neutralCoolgray300 : ILDSTokens.neutralCoolgray900
        return IldsSwitchColors(track: track, thumb: thumb, label: label)
    }
}
