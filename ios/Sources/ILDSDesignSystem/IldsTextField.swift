import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_text_field.dart + web TextField.tsx.

public enum IldsTextFieldKind: Sendable {
    case standard, password, otp6, otp4
}

public struct IldsTextField: View {
    @Binding private var text: String
    private let label: String
    private let placeholder: String?
    private let helperText: String?
    private let errorText: String?
    private let successText: String?
    private let kind: IldsTextFieldKind
    private let isEnabled: Bool
    private let isReadOnly: Bool
    private let isLoading: Bool
    private let maxLength: Int?
    private let leadingIcon: AnyView?
    private let trailingIcon: AnyView?
    private let onChange: ((String) -> Void)?

    @FocusState private var isFocused: Bool
    @State private var isPasswordVisible = false
    @State private var otpDigits: [String]

    public init(
        text: Binding<String>,
        label: String,
        placeholder: String? = nil,
        helperText: String? = nil,
        errorText: String? = nil,
        successText: String? = nil,
        kind: IldsTextFieldKind = .standard,
        isEnabled: Bool = true,
        isReadOnly: Bool = false,
        isLoading: Bool = false,
        maxLength: Int? = nil,
        leadingIcon: (any View)? = nil,
        trailingIcon: (any View)? = nil,
        onChange: ((String) -> Void)? = nil
    ) {
        _text = text
        self.label = label
        self.placeholder = placeholder
        self.helperText = helperText
        self.errorText = errorText
        self.successText = successText
        self.kind = kind
        self.isEnabled = isEnabled
        self.isReadOnly = isReadOnly
        self.isLoading = isLoading
        self.maxLength = maxLength
        self.leadingIcon = leadingIcon.map { AnyView($0) }
        self.trailingIcon = trailingIcon.map { AnyView($0) }
        self.onChange = onChange
        let count = kind == .otp6 ? 6 : (kind == .otp4 ? 4 : 0)
        _otpDigits = State(initialValue: Array(repeating: "", count: count))
    }

    public var body: some View {
        Group {
            switch kind {
            case .otp6, .otp4:
                otpField
            default:
                standardField
            }
        }
    }

    // MARK: - Standard / Password

    private var standardField: some View {
        let hasError = errorText != nil
        let hasSuccess = successText != nil
        let colors = IldsTextFieldColors.resolve(
            hasError: hasError,
            hasSuccess: hasSuccess,
            isFocused: isFocused,
            isEnabled: isEnabled,
            isReadOnly: isReadOnly
        )
        let bottomText = errorText ?? successText ?? helperText

        return VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
            Text(label)
                .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightMedium))
                .foregroundStyle(ILDSTokens.neutralCoolgray500)

            HStack(spacing: ILDSTokens.sp8) {
                if let leadingIcon {
                    leadingIcon
                        .foregroundStyle(colors.leadingIcon)
                        .frame(width: ILDSTokens.sp20, height: ILDSTokens.sp20)
                }
                Group {
                    if kind == .password && !isPasswordVisible {
                        SecureField(placeholder ?? "", text: $text)
                    } else {
                        TextField(placeholder ?? "", text: $text)
                    }
                }
                .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular))
                .foregroundStyle(colors.text)
                .focused($isFocused)
                .disabled(!isEnabled || isLoading)
                .onChange(of: text) { newValue in
                    if let maxLength, newValue.count > maxLength {
                        text = String(newValue.prefix(maxLength))
                    }
                    onChange?(text)
                }

                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(ILDSTokens.primaryOrange500)
                        .frame(width: ILDSTokens.sp20, height: ILDSTokens.sp20)
                } else if kind == .password {
                    Button(action: { isPasswordVisible.toggle() }) {
                        Image(systemName: isPasswordVisible ? "eye.slash" : "eye")
                            .foregroundStyle(ILDSTokens.neutralCoolgray400)
                    }
                    .buttonStyle(.plain)
                } else if let trailingIcon {
                    trailingIcon
                        .foregroundStyle(ILDSTokens.neutralCoolgray400)
                }
            }
            .padding(.horizontal, ILDSTokens.sp16)
            .padding(.vertical, ILDSTokens.sp12)
            .background(colors.background)
            .overlay {
                RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                    .strokeBorder(colors.border, lineWidth: colors.borderWidth)
            }
            .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))

            if bottomText != nil || maxLength != nil {
                HStack {
                    if let bottomText {
                        Text(bottomText)
                            .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                            .foregroundStyle(colors.bottomText)
                    }
                    Spacer()
                    if let maxLength {
                        Text("\(text.count)/\(maxLength)")
                            .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                            .foregroundStyle(ILDSTokens.neutralCoolgray400)
                    }
                }
            }
        }
        .accessibilityLabel(label)
    }

    // MARK: - OTP

    private var otpField: some View {
        let count = kind == .otp6 ? 6 : 4
        return HStack(spacing: ILDSTokens.sp8) {
            ForEach(0..<count, id: \.self) { index in
                IldsOTPCell(
                    text: Binding(
                        get: { index < otpDigits.count ? otpDigits[index] : "" },
                        set: { newValue in
                            guard index < otpDigits.count else { return }
                            otpDigits[index] = String(newValue.prefix(1))
                            text = otpDigits.joined()
                            onChange?(text)
                        }
                    ),
                    isFocused: isFocused
                )
            }
        }
        .focused($isFocused)
        .accessibilityLabel("One-time password")
    }
}

private struct IldsOTPCell: View {
    @Binding var text: String
    let isFocused: Bool
    @FocusState private var cellFocused: Bool

    var body: some View {
        TextField("", text: $text)
            .font(.system(size: ILDSTokens.fontSize20, weight: ILDSTokens.fontWeightBold))
            .foregroundStyle(ILDSTokens.neutralCoolgray900)
            .multilineTextAlignment(.center)
            #if os(iOS)
            .keyboardType(.numberPad)
            #endif
            .frame(width: 48, height: 56)
            .focused($cellFocused)
            .overlay {
                RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                    .strokeBorder(
                        cellFocused ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray200,
                        lineWidth: cellFocused ? 2 : 1
                    )
            }
            .accessibilityLabel("OTP digit")
    }
}

private struct IldsTextFieldColors {
    let border: Color
    let background: Color
    let text: Color
    let bottomText: Color
    let leadingIcon: Color
    let borderWidth: CGFloat

    static func resolve(
        hasError: Bool,
        hasSuccess: Bool,
        isFocused: Bool,
        isEnabled: Bool,
        isReadOnly: Bool
    ) -> IldsTextFieldColors {
        let border: Color
        if !isEnabled {
            border = ILDSTokens.neutralCoolgray300
        } else if hasError {
            border = ILDSTokens.errorRed600
        } else if isFocused {
            border = ILDSTokens.primaryOrange500
        } else if hasSuccess {
            border = ILDSTokens.successGreen600
        } else {
            border = ILDSTokens.neutralCoolgray200
        }

        let background: Color
        if !isEnabled {
            background = ILDSTokens.neutralCoolgray100
        } else if isReadOnly {
            background = ILDSTokens.neutralCoolgray50
        } else {
            background = ILDSTokens.globalWhite000
        }

        let text = isReadOnly ? ILDSTokens.neutralCoolgray500 : ILDSTokens.neutralCoolgray900

        let bottomText: Color
        if hasError {
            bottomText = ILDSTokens.errorRed600
        } else if hasSuccess {
            bottomText = ILDSTokens.successGreen600
        } else {
            bottomText = ILDSTokens.neutralCoolgray400
        }

        let leadingIcon: Color
        if isReadOnly {
            leadingIcon = ILDSTokens.neutralCoolgray400
        } else if hasError {
            leadingIcon = ILDSTokens.errorRed600
        } else if hasSuccess {
            leadingIcon = ILDSTokens.successGreen600
        } else if isFocused {
            leadingIcon = ILDSTokens.primaryOrange500
        } else {
            leadingIcon = ILDSTokens.neutralCoolgray400
        }

        let borderWidth: CGFloat = (hasError || isFocused) ? 2 : 1
        return IldsTextFieldColors(
            border: border,
            background: background,
            text: text,
            bottomText: bottomText,
            leadingIcon: leadingIcon,
            borderWidth: borderWidth
        )
    }
}
