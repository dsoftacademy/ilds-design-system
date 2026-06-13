import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_text_area.dart + web TextArea.tsx. TODO(web/desktop): hover states — mobile-first defer.

public struct IldsTextArea: View {
    @Binding private var text: String
    private let label: String?
    private let placeholder: String?
    private let helperText: String?
    private let errorText: String?
    private let successText: String?
    private let minRows: Int
    private let maxLength: Int?
    private let showCharCount: Bool
    private let isDisabled: Bool
    private let isReadOnly: Bool
    private let isLoading: Bool
    private let onChange: ((String) -> Void)?

    @FocusState private var isFocused: Bool

    public init(
        text: Binding<String>,
        label: String? = nil,
        placeholder: String? = nil,
        helperText: String? = nil,
        errorText: String? = nil,
        successText: String? = nil,
        minRows: Int = 3,
        maxLength: Int? = nil,
        showCharCount: Bool = false,
        isDisabled: Bool = false,
        isReadOnly: Bool = false,
        isLoading: Bool = false,
        onChange: ((String) -> Void)? = nil
    ) {
        _text = text
        self.label = label
        self.placeholder = placeholder
        self.helperText = helperText
        self.errorText = errorText
        self.successText = successText
        self.minRows = minRows
        self.maxLength = maxLength
        self.showCharCount = showCharCount
        self.isDisabled = isDisabled
        self.isReadOnly = isReadOnly
        self.isLoading = isLoading
        self.onChange = onChange
    }

    private var hasError: Bool { errorText != nil }
    private var hasSuccess: Bool { successText != nil }
    private var isInteractive: Bool { !isDisabled && !isLoading }

    public var body: some View {
        let colors = IldsTextAreaColors.resolve(
            hasError: hasError,
            hasSuccess: hasSuccess,
            isFocused: isFocused,
            isDisabled: isDisabled,
            isReadOnly: isReadOnly
        )
        let bottomText = errorText ?? successText ?? helperText
        let showCounter = showCharCount && maxLength != nil

        VStack(alignment: .leading, spacing: ILDSTokens.sp4) {
            if let label {
                Text(label)
                    .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightMedium))
                    .foregroundStyle(ILDSTokens.neutralCoolgray500)
            }

            ZStack(alignment: .topTrailing) {
                TextEditor(text: $text)
                    .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular))
                    .foregroundStyle(colors.text)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, ILDSTokens.sp16)
                    .padding(.vertical, ILDSTokens.sp12)
                    .frame(minHeight: CGFloat(minRows) * 24)
                    .focused($isFocused)
                    .disabled(!isInteractive || isReadOnly)
                    .onChange(of: text) { newValue in
                        if let maxLength, newValue.count > maxLength {
                            text = String(newValue.prefix(maxLength))
                        }
                        onChange?(text)
                    }
                    .overlay(alignment: .topLeading) {
                        if text.isEmpty, let placeholder {
                            Text(placeholder)
                                .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular))
                                .foregroundStyle(ILDSTokens.neutralCoolgray300)
                                .padding(.horizontal, ILDSTokens.sp16 + 4)
                                .padding(.vertical, ILDSTokens.sp12 + 8)
                                .allowsHitTesting(false)
                        }
                    }

                if isLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                        .tint(ILDSTokens.primaryOrange500)
                        .frame(width: ILDSTokens.sp20, height: ILDSTokens.sp20)
                        .padding(.top, ILDSTokens.sp12)
                        .padding(.trailing, ILDSTokens.sp12)
                }
            }
            .background(colors.background)
            .overlay {
                RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                    .strokeBorder(colors.border, lineWidth: colors.borderWidth)
            }
            .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))

            if bottomText != nil || showCounter {
                HStack(alignment: .top) {
                    if let bottomText {
                        Text(bottomText)
                            .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                            .foregroundStyle(colors.bottomText)
                    }
                    Spacer()
                    if showCounter, let maxLength {
                        Text("\(text.count)/\(maxLength)")
                            .font(.system(size: ILDSTokens.fontSize12, weight: ILDSTokens.fontWeightRegular))
                            .foregroundStyle(ILDSTokens.neutralCoolgray400)
                    }
                }
            }
        }
        .accessibilityLabel(label ?? placeholder ?? "Text area")
    }
}

private struct IldsTextAreaColors {
    let border: Color
    let background: Color
    let text: Color
    let bottomText: Color
    let borderWidth: CGFloat

    static func resolve(
        hasError: Bool,
        hasSuccess: Bool,
        isFocused: Bool,
        isDisabled: Bool,
        isReadOnly: Bool
    ) -> IldsTextAreaColors {
        let border: Color
        if isDisabled {
            border = ILDSTokens.neutralCoolgray200
        } else if hasError {
            border = ILDSTokens.errorRed600
        } else if isFocused {
            border = ILDSTokens.primaryOrange500
        } else if hasSuccess {
            border = ILDSTokens.successGreen600
        } else {
            border = ILDSTokens.neutralCoolgray300
        }

        let background: Color = isDisabled || isReadOnly
            ? ILDSTokens.neutralCoolgray50
            : ILDSTokens.globalWhite000

        let text: Color
        if isDisabled {
            text = ILDSTokens.neutralCoolgray300
        } else if isReadOnly {
            text = ILDSTokens.neutralCoolgray500
        } else {
            text = ILDSTokens.neutralCoolgray900
        }

        let bottomText: Color
        if hasError {
            bottomText = ILDSTokens.errorRed600
        } else if hasSuccess {
            bottomText = ILDSTokens.successGreen600
        } else {
            bottomText = ILDSTokens.neutralCoolgray400
        }

        let borderWidth: CGFloat = hasError || isFocused ? 2 : 1
        return IldsTextAreaColors(
            border: border,
            background: background,
            text: text,
            bottomText: bottomText,
            borderWidth: borderWidth
        )
    }
}
