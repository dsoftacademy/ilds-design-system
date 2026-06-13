import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_radio.dart + web Radio.tsx. TODO(web/desktop): hover states — mobile-first defer.

public enum IldsRadioSize: Sendable {
    case small, medium, large
}

public struct IldsRadio<Value: Hashable>: View {
    private let value: Value
    @Binding private var selection: Value?
    private let label: String?
    private let size: IldsRadioSize
    private let isDisabled: Bool
    private let hasError: Bool
    private let errorText: String?

    public init(
        value: Value,
        selection: Binding<Value?>,
        label: String? = nil,
        size: IldsRadioSize = .medium,
        isDisabled: Bool = false,
        hasError: Bool = false,
        errorText: String? = nil
    ) {
        self.value = value
        _selection = selection
        self.label = label
        self.size = size
        self.isDisabled = isDisabled
        self.hasError = hasError
        self.errorText = errorText
    }

    private var isSelected: Bool { selection == value }

    public var body: some View {
        VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
            Button {
                guard !isDisabled else { return }
                selection = value
            } label: {
                EmptyView()
            }
            .buttonStyle(IldsRadioButtonStyle(
                isSelected: isSelected,
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
        .accessibilityLabel(label ?? String(describing: value))
        .accessibilityAddTraits(isSelected ? .isSelected : [])
    }
}

public struct IldsRadioOption<Value: Hashable>: Identifiable, Sendable where Value: Sendable {
    public let id: Value
    public let value: Value
    public let label: String
    public let isDisabled: Bool

    public init(value: Value, label: String, isDisabled: Bool = false) {
        self.id = value
        self.value = value
        self.label = label
        self.isDisabled = isDisabled
    }
}

public struct IldsRadioGroup<Value: Hashable>: View where Value: Sendable {
    private let options: [IldsRadioOption<Value>]
    @Binding private var selection: Value?
    private let size: IldsRadioSize
    private let isDisabled: Bool
    private let hasError: Bool
    private let errorText: String?
    private let axis: Axis

    public init(
        options: [IldsRadioOption<Value>],
        selection: Binding<Value?>,
        size: IldsRadioSize = .medium,
        isDisabled: Bool = false,
        hasError: Bool = false,
        errorText: String? = nil,
        axis: Axis = .vertical
    ) {
        self.options = options
        _selection = selection
        self.size = size
        self.isDisabled = isDisabled
        self.hasError = hasError
        self.errorText = errorText
        self.axis = axis
    }

    public var body: some View {
        VStack(alignment: .leading, spacing: ILDSTokens.sp8) {
            Group {
                if axis == .vertical {
                    VStack(alignment: .leading, spacing: ILDSTokens.sp8) {
                        radioItems
                    }
                } else {
                    HStack(spacing: ILDSTokens.sp16) {
                        radioItems
                    }
                }
            }
            if hasError, let errorText {
                Text(errorText)
                    .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                    .foregroundStyle(ILDSTokens.errorRed600)
            }
        }
    }

    @ViewBuilder
    private var radioItems: some View {
        ForEach(options) { option in
            IldsRadio(
                value: option.value,
                selection: $selection,
                label: option.label,
                size: size,
                isDisabled: isDisabled || option.isDisabled,
                hasError: hasError
            )
        }
    }
}

private struct IldsRadioIndicator: View {
    let isSelected: Bool
    let size: IldsRadioSize
    let isDisabled: Bool
    let hasError: Bool
    let isPressed: Bool
    @FocusState private var isFocused: Bool

    var body: some View {
        let metrics = IldsRadioMetrics(size: size)
        let colors = IldsRadioColors.resolve(
            isSelected: isSelected,
            isDisabled: isDisabled,
            hasError: hasError,
            isPressed: isPressed,
            isFocused: isFocused
        )

        ZStack {
            Circle()
                .fill(colors.background)
                .frame(width: metrics.outerSize, height: metrics.outerSize)
                .overlay {
                    Circle()
                        .strokeBorder(colors.border, lineWidth: colors.borderWidth)
                }
            Circle()
                .fill(colors.dot)
                .frame(
                    width: isSelected ? metrics.innerSize : 0,
                    height: isSelected ? metrics.innerSize : 0
                )
                .animation(.easeInOut(duration: 0.15), value: isSelected)
        }
        .focusable(!isDisabled)
        .focused($isFocused)
    }
}

private struct IldsRadioButtonStyle: ButtonStyle {
    let isSelected: Bool
    let label: String?
    let size: IldsRadioSize
    let isDisabled: Bool
    let hasError: Bool

    func makeBody(configuration: Configuration) -> some View {
        HStack(alignment: .top, spacing: ILDSTokens.sp8) {
            IldsRadioIndicator(
                isSelected: isSelected,
                size: size,
                isDisabled: isDisabled,
                hasError: hasError,
                isPressed: configuration.isPressed && !isDisabled
            )
            if let label {
                Text(label)
                    .font(IldsRadioMetrics(size: size).labelFont)
                    .foregroundStyle(isDisabled ? ILDSTokens.neutralCoolgray300 : ILDSTokens.neutralCoolgray900)
            }
        }
    }
}

private struct IldsRadioMetrics {
    let outerSize: CGFloat
    let innerSize: CGFloat
    let labelFont: Font

    init(size: IldsRadioSize) {
        switch size {
        case .small:
            outerSize = ILDSTokens.sp16
            innerSize = ILDSTokens.sp8
            labelFont = .system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular)
        case .medium:
            outerSize = ILDSTokens.sp20
            innerSize = 10
            labelFont = .system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular)
        case .large:
            outerSize = ILDSTokens.sp24
            innerSize = ILDSTokens.sp12
            labelFont = .system(size: ILDSTokens.fontSize16, weight: ILDSTokens.fontWeightRegular)
        }
    }
}

private struct IldsRadioColors {
    let background: Color
    let border: Color
    let dot: Color
    let borderWidth: CGFloat

    static func resolve(
        isSelected: Bool,
        isDisabled: Bool,
        hasError: Bool,
        isPressed: Bool,
        isFocused: Bool
    ) -> IldsRadioColors {
        let border: Color
        if isDisabled {
            border = isSelected ? ILDSTokens.neutralCoolgray300 : ILDSTokens.neutralCoolgray200
        } else if hasError {
            border = ILDSTokens.errorRed600
        } else if isPressed {
            border = ILDSTokens.primaryOrange700
        } else if isSelected || isFocused {
            border = ILDSTokens.primaryOrange500
        } else {
            border = ILDSTokens.neutralCoolgray300
        }

        let background: Color
        if isDisabled {
            background = ILDSTokens.neutralCoolgray50
        } else if hasError {
            background = ILDSTokens.errorRed50
        } else if isPressed {
            background = ILDSTokens.primaryOrange100
        } else if isSelected {
            background = ILDSTokens.globalWhite000
        } else {
            background = ILDSTokens.globalWhite000
        }

        let dot: Color
        if isDisabled {
            dot = ILDSTokens.neutralCoolgray300
        } else if hasError {
            dot = ILDSTokens.errorRed600
        } else if isPressed {
            dot = ILDSTokens.primaryOrange700
        } else {
            dot = ILDSTokens.primaryOrange500
        }

        let borderWidth: CGFloat = isSelected || isPressed || isFocused || hasError ? 2 : 1
        return IldsRadioColors(background: background, border: border, dot: dot, borderWidth: borderWidth)
    }
}
