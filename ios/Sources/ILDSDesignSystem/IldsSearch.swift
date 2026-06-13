import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_search.dart + web Search.tsx. TODO(web/desktop): hover states — mobile-first defer.

public struct IldsSearch: View {
    @Binding private var text: String
    private let placeholder: String
    private let onSubmit: ((String) -> Void)?
    private let onClear: (() -> Void)?
    private let isLoading: Bool

    @FocusState private var isFocused: Bool

    public init(
        text: Binding<String>,
        placeholder: String = "Search",
        onSubmit: ((String) -> Void)? = nil,
        onClear: (() -> Void)? = nil,
        isLoading: Bool = false
    ) {
        _text = text
        self.placeholder = placeholder
        self.onSubmit = onSubmit
        self.onClear = onClear
        self.isLoading = isLoading
    }

    public var body: some View {
        let colors = IldsSearchColors.resolve(isFocused: isFocused, hasText: !text.isEmpty)

        HStack(spacing: ILDSTokens.sp8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: ILDSTokens.sp16))
                .foregroundStyle(colors.leadingIcon)
            TextField(placeholder, text: $text)
                .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightRegular))
                .foregroundStyle(ILDSTokens.neutralCoolgray900)
                .focused($isFocused)
                .onSubmit { onSubmit?(text) }
            if isLoading {
                ProgressView()
                    .progressViewStyle(.circular)
                    .tint(ILDSTokens.primaryOrange500)
                    .frame(width: ILDSTokens.sp20, height: ILDSTokens.sp20)
            } else if !text.isEmpty {
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
        .frame(height: ILDSTokens.sp40)
        .background(colors.background)
        .overlay {
            Capsule()
                .strokeBorder(colors.border, lineWidth: isFocused ? 2 : 1)
        }
        .clipShape(Capsule())
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

    static func resolve(isFocused: Bool, hasText: Bool) -> IldsSearchColors {
        let border: Color
        if isFocused {
            border = ILDSTokens.primaryOrange500
        } else if hasText {
            border = ILDSTokens.neutralCoolgray300
        } else {
            border = ILDSTokens.neutralCoolgray200
        }
        let leadingIcon = isFocused ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray400
        return IldsSearchColors(
            border: border,
            background: ILDSTokens.globalWhite000,
            leadingIcon: leadingIcon
        )
    }
}
