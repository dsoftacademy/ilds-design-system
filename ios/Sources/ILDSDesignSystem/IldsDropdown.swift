import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_dropdown.dart + web Dropdown.tsx.

public enum IldsDropdownSize: Sendable {
    case large, medium
}

public struct IldsDropdownOption: Identifiable, Sendable {
    public let id: String
    public let label: String
    public let value: String
    public let isDisabled: Bool

    public init(label: String, value: String, isDisabled: Bool = false) {
        self.id = value
        self.label = label
        self.value = value
        self.isDisabled = isDisabled
    }
}

public struct IldsDropdown: View {
    private let label: String
    private let placeholder: String
    private let options: [IldsDropdownOption]
    @Binding private var selectedValue: String?
    private let isEnabled: Bool
    private let isLoading: Bool
    private let errorText: String?
    private let helperText: String?
    private let size: IldsDropdownSize

    @State private var isOpen = false

    public init(
        label: String,
        placeholder: String,
        options: [IldsDropdownOption],
        selectedValue: Binding<String?>,
        isEnabled: Bool = true,
        isLoading: Bool = false,
        errorText: String? = nil,
        helperText: String? = nil,
        size: IldsDropdownSize = .large
    ) {
        self.label = label
        self.placeholder = placeholder
        self.options = options
        _selectedValue = selectedValue
        self.isEnabled = isEnabled
        self.isLoading = isLoading
        self.errorText = errorText
        self.helperText = helperText
        self.size = size
    }

    private var selectedOption: IldsDropdownOption? {
        guard let selectedValue else { return nil }
        return options.first { $0.value == selectedValue }
    }

    public var body: some View {
        let hasError = errorText != nil
        let colors = IldsDropdownColors.resolve(
            isOpen: isOpen,
            hasError: hasError,
            isEnabled: isEnabled,
            hasSelection: selectedOption != nil
        )
        let metrics = IldsDropdownMetrics(size: size)
        let bottomText = errorText ?? helperText

        VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
            Text(label)
                .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightMedium))
                .foregroundStyle(ILDSTokens.neutralCoolgray500)

            VStack(spacing: 0) {
                Button {
                    guard isEnabled, !isLoading else { return }
                    isOpen.toggle()
                } label: {
                    HStack {
                        Text(selectedOption?.label ?? placeholder)
                            .font(.system(size: metrics.fontSize, weight: ILDSTokens.fontWeightRegular))
                            .foregroundStyle(colors.text)
                            .lineLimit(1)
                        Spacer()
                        if isLoading {
                            ProgressView()
                                .progressViewStyle(.circular)
                                .tint(ILDSTokens.primaryOrange500)
                                .frame(width: ILDSTokens.sp20, height: ILDSTokens.sp20)
                        } else {
                            Image(systemName: "chevron.down")
                                .font(.system(size: ILDSTokens.sp20))
                                .foregroundStyle(colors.icon)
                                .rotationEffect(.degrees(isOpen ? 180 : 0))
                                .animation(.easeInOut(duration: 0.15), value: isOpen)
                        }
                    }
                    .frame(height: metrics.triggerHeight)
                    .padding(.horizontal, ILDSTokens.sp16)
                    .background(colors.background)
                    .overlay {
                        IldsDropdownTriggerBorder(isOpen: isOpen, color: colors.border, width: colors.borderWidth)
                    }
                }
                .buttonStyle(.plain)
                .disabled(!isEnabled || isLoading)

                if isOpen {
                    IldsDropdownMenu(
                        options: options,
                        selectedValue: selectedValue,
                        onSelect: { value in
                            selectedValue = value
                            isOpen = false
                        }
                    )
                }
            }

            if let bottomText {
                Text(bottomText)
                    .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                    .foregroundStyle(hasError ? ILDSTokens.errorRed600 : ILDSTokens.neutralCoolgray400)
            }
        }
        .accessibilityLabel(label)
        .accessibilityValue(selectedOption?.label ?? placeholder)
    }
}

private struct IldsDropdownTriggerBorder: View {
    let isOpen: Bool
    let color: Color
    let width: CGFloat

    var body: some View {
        if isOpen {
            UnevenRoundedRectangle(
                topLeadingRadius: ILDSTokens.radiusMedium,
                topTrailingRadius: ILDSTokens.radiusMedium
            )
            .strokeBorder(color, lineWidth: width)
        } else {
            RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                .strokeBorder(color, lineWidth: width)
        }
    }
}

private struct IldsDropdownMetrics {
    let triggerHeight: CGFloat
    let fontSize: CGFloat

    init(size: IldsDropdownSize) {
        switch size {
        case .large:
            triggerHeight = ILDSTokens.sp48
            fontSize = ILDSTokens.fontSize14
        case .medium:
            triggerHeight = ILDSTokens.sp40
            fontSize = ILDSTokens.fontSize12
        }
    }
}

private struct IldsDropdownColors {
    let border: Color
    let background: Color
    let text: Color
    let icon: Color
    let borderWidth: CGFloat

    static func resolve(
        isOpen: Bool,
        hasError: Bool,
        isEnabled: Bool,
        hasSelection: Bool
    ) -> IldsDropdownColors {
        if !isEnabled {
            return IldsDropdownColors(
                border: ILDSTokens.neutralCoolgray300,
                background: ILDSTokens.neutralCoolgray100,
                text: ILDSTokens.neutralCoolgray300,
                icon: ILDSTokens.neutralCoolgray300,
                borderWidth: 1
            )
        }
        if hasError {
            return IldsDropdownColors(
                border: ILDSTokens.errorRed600,
                background: ILDSTokens.globalWhite000,
                text: hasSelection ? ILDSTokens.neutralCoolgray900 : ILDSTokens.neutralCoolgray300,
                icon: ILDSTokens.errorRed600,
                borderWidth: isOpen ? 2 : 1
            )
        }
        if isOpen {
            return IldsDropdownColors(
                border: ILDSTokens.primaryOrange500,
                background: ILDSTokens.globalWhite000,
                text: hasSelection ? ILDSTokens.neutralCoolgray900 : ILDSTokens.neutralCoolgray300,
                icon: ILDSTokens.primaryOrange500,
                borderWidth: 2
            )
        }
        return IldsDropdownColors(
            border: ILDSTokens.neutralCoolgray200,
            background: ILDSTokens.globalWhite000,
            text: hasSelection ? ILDSTokens.neutralCoolgray900 : ILDSTokens.neutralCoolgray300,
            icon: ILDSTokens.neutralCoolgray400,
            borderWidth: 1
        )
    }
}
