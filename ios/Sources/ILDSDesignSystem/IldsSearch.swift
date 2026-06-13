import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_search.dart + web Search.tsx (Figma 13965:16190).

public struct IldsSearch: View {
    @Binding private var text: String
    private let placeholder: String
    private let onSubmit: ((String) -> Void)?
    private let onClear: (() -> Void)?
    private let isLoading: Bool
    private let isDisabled: Bool

    @FocusState private var isFocused: Bool

    public init(
        text: Binding<String>,
        placeholder: String = "Search",
        onSubmit: ((String) -> Void)? = nil,
        onClear: (() -> Void)? = nil,
        isLoading: Bool = false,
        isDisabled: Bool = false
    ) {
        _text = text
        self.placeholder = placeholder
        self.onSubmit = onSubmit
        self.onClear = onClear
        self.isLoading = isLoading
        self.isDisabled = isDisabled
    }

    public var body: some View {
        let colors = IldsSearchColors.resolve(isFocused: isFocused, isDisabled: isDisabled)

        HStack(spacing: ILDSTokens.sp8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: ILDSTokens.sp16))
                .foregroundStyle(colors.leadingIcon)
            TextField(placeholder, text: $text)
                .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular))
                .foregroundStyle(isDisabled ? ILDSTokens.neutralCoolgray300 : ILDSTokens.neutralCoolgray900)
                .focused($isFocused)
                .disabled(isDisabled || isLoading)
                .onSubmit { onSubmit?(text) }
            if isLoading {
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(ILDSTokens.primaryOrange500)
                    .frame(width: ILDSTokens.sp20, height: ILDSTokens.sp20)
            } else if !text.isEmpty, !isDisabled {
                Button(action: clear) {
                    Image(systemName: "xmark")
                        .font(.system(size: ILDSTokens.sp16))
                        .foregroundStyle(ILDSTokens.neutralCoolgray500)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Clear search")
            }
        }
        .padding(.horizontal, ILDSTokens.sp12)
        .frame(height: 44)
        .background(colors.background)
        .overlay {
            RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium)
                .strokeBorder(colors.border, lineWidth: colors.borderWidth)
        }
        .clipShape(RoundedRectangle(cornerRadius: ILDSTokens.radiusMedium))
        .accessibilityLabel(placeholder)
    }

    private func clear() {
        text = ""
        onClear?()
    }
}

private struct IldsSearchColors {
    let border: Color
    let background: Color
    let leadingIcon: Color
    let borderWidth: CGFloat

    static func resolve(isFocused: Bool, isDisabled: Bool) -> IldsSearchColors {
        if isDisabled {
            return IldsSearchColors(
                border: ILDSTokens.neutralCoolgray300,
                background: ILDSTokens.neutralCoolgray200,
                leadingIcon: ILDSTokens.neutralCoolgray300,
                borderWidth: 1
            )
        }
        let border = isFocused ? ILDSTokens.primaryOrange600 : ILDSTokens.neutralCoolgray500
        let borderWidth: CGFloat = isFocused ? 2 : 1
        let leadingIcon = isFocused ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray400
        return IldsSearchColors(
            border: border,
            background: ILDSTokens.neutralCoolgray50,
            leadingIcon: leadingIcon,
            borderWidth: borderWidth
        )
    }
}
