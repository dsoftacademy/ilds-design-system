import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_checkbox.dart + web Checkbox.tsx. TODO(web/desktop): hover states — mobile-first defer.

public enum IldsCheckboxSize: Sendable {
    case small, medium, large
}

public enum IldsCheckboxState: Sendable {
    case unchecked, checked, indeterminate
}

public struct IldsCheckbox: View {
    private let state: IldsCheckboxState
    private let onChanged: ((IldsCheckboxState) -> Void)?
    private let label: String?
    private let size: IldsCheckboxSize
    private let isDisabled: Bool
    private let hasError: Bool
    private let errorText: String?

    public init(
        state: IldsCheckboxState,
        onChanged: ((IldsCheckboxState) -> Void)? = nil,
        label: String? = nil,
        size: IldsCheckboxSize = .medium,
        isDisabled: Bool = false,
        hasError: Bool = false,
        errorText: String? = nil
    ) {
        self.state = state
        self.onChanged = onChanged
        self.label = label
        self.size = size
        self.isDisabled = isDisabled
        self.hasError = hasError
        self.errorText = errorText
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
            Button {
                guard !isDisabled else { return }
                onChanged?(nextState(from: state))
            } label: {
                EmptyView()
            }
            .buttonStyle(IldsCheckboxButtonStyle(
                state: state,
                label: label,
                size: size,
                isDisabled: isDisabled,
                hasError: hasError
            ))
            .disabled(isDisabled)

            if hasError, let errorText {
                Text(errorText)
                    .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                    .foregroundStyle(ILDSTokens.errorRed600)
            }
        }
        .accessibilityLabel(label ?? "Checkbox")
        .accessibilityAddTraits(state == .checked ? .isSelected : [])
    }

    private func nextState(from current: IldsCheckboxState) -> IldsCheckboxState {
        switch current {
        case .unchecked: return .checked
        case .checked: return .indeterminate
        case .indeterminate: return .unchecked
        }
    }
}

private struct IldsCheckboxIndicator: View {
    let state: IldsCheckboxState
    let size: IldsCheckboxSize
    let isDisabled: Bool
    let hasError: Bool
    let isPressed: Bool
    @FocusState private var isFocused: Bool

    private var isActive: Bool { state == .checked || state == .indeterminate }

    var body: some View {
        let metrics = IldsCheckboxMetrics(size: size)
        let colors = IldsCheckboxColors.resolve(
            state: state,
            isDisabled: isDisabled,
            hasError: hasError,
            isPressed: isPressed,
            isFocused: isFocused
        )

        ZStack {
            RoundedRectangle(cornerRadius: metrics.cornerRadius)
                .fill(colors.fill)
                .frame(width: metrics.boxSize, height: metrics.boxSize)
                .overlay {
                    RoundedRectangle(cornerRadius: metrics.cornerRadius)
                        .strokeBorder(colors.border, lineWidth: colors.borderWidth)
                }
            if state == .checked {
                Image(systemName: "checkmark")
                    .font(.system(size: metrics.iconSize, weight: .bold))
                    .foregroundStyle(colors.icon)
            } else if state == .indeterminate {
                RoundedRectangle(cornerRadius: 1)
                    .fill(colors.icon)
                    .frame(width: metrics.iconSize, height: 2)
            }
        }
        .focusable(!isDisabled)
        .focused($isFocused)
    }
}

private struct IldsCheckboxButtonStyle: ButtonStyle {
    let state: IldsCheckboxState
    let label: String?
    let size: IldsCheckboxSize
    let isDisabled: Bool
    let hasError: Bool

    func makeBody(configuration: Configuration) -> some View {
        HStack(alignment: .top, spacing: ILDSTokens.sp8) {
            IldsCheckboxIndicator(
                state: state,
                size: size,
                isDisabled: isDisabled,
                hasError: hasError,
                isPressed: configuration.isPressed && !isDisabled
            )
            if let label {
                Text(label)
                    .font(IldsCheckboxMetrics(size: size).labelFont)
                    .foregroundStyle(isDisabled ? ILDSTokens.neutralCoolgray300 : ILDSTokens.neutralCoolgray900)
                    .multilineTextAlignment(.leading)
            }
        }
    }
}

private struct IldsCheckboxMetrics {
    let boxSize: CGFloat
    let iconSize: CGFloat
    let cornerRadius: CGFloat
    let labelFont: Font

    init(size: IldsCheckboxSize) {
        switch size {
        case .small:
            boxSize = ILDSTokens.sp16
            iconSize = 10
            cornerRadius = ILDSTokens.radiusXsmall
            labelFont = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular)
        case .medium:
            boxSize = ILDSTokens.sp20
            iconSize = ILDSTokens.sp12
            cornerRadius = ILDSTokens.radiusSmall
            labelFont = .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular)
        case .large:
            boxSize = ILDSTokens.sp24
            iconSize = ILDSTokens.sp16
            cornerRadius = ILDSTokens.radiusSmall
            labelFont = .system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightRegular)
        }
    }
}

private struct IldsCheckboxColors {
    let fill: Color
    let border: Color
    let icon: Color
    let borderWidth: CGFloat

    static func resolve(
        state: IldsCheckboxState,
        isDisabled: Bool,
        hasError: Bool,
        isPressed: Bool,
        isFocused: Bool
    ) -> IldsCheckboxColors {
        let active = state == .checked || state == .indeterminate

        let border: Color
        if isDisabled {
            border = active ? ILDSTokens.neutralCoolgray300 : ILDSTokens.neutralCoolgray200
        } else if hasError {
            border = ILDSTokens.errorRed600
        } else if isPressed {
            border = ILDSTokens.primaryOrange700
        } else if active || isFocused {
            border = ILDSTokens.primaryOrange500
        } else {
            border = ILDSTokens.neutralCoolgray600
        }

        let fill: Color
        if isDisabled {
            fill = active ? ILDSTokens.neutralCoolgray200 : ILDSTokens.neutralCoolgray50
        } else if hasError {
            fill = active ? ILDSTokens.errorRed600 : ILDSTokens.errorRed50
        } else if isPressed {
            fill = ILDSTokens.primaryOrange700
        } else if active {
            fill = ILDSTokens.primaryOrange500
        } else {
            fill = ILDSTokens.globalWhite000
        }

        let icon: Color = isDisabled && active ? ILDSTokens.neutralCoolgray400 : ILDSTokens.globalWhite000
        let borderWidth: CGFloat = active || isPressed || isFocused || hasError ? 2 : 1

        return IldsCheckboxColors(fill: fill, border: border, icon: icon, borderWidth: borderWidth)
    }
}
