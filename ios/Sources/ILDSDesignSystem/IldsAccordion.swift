import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_accordion.dart + web Accordion.tsx. TODO(web/desktop): hover states — mobile-first defer.

public struct IldsAccordion<Content: View>: View {
    private let title: String
    private let content: Content
    private let prefixIcon: AnyView?
    private let prefixNumber: Int?
    private let initiallyOpen: Bool
    private let isDisabled: Bool

    @State private var isOpen: Bool

    public init(
        title: String,
        initiallyOpen: Bool = false,
        isDisabled: Bool = false,
        prefixIcon: (any View)? = nil,
        prefixNumber: Int? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.title = title
        self.content = content()
        self.prefixIcon = prefixIcon.map { AnyView($0) }
        self.prefixNumber = prefixNumber
        self.initiallyOpen = initiallyOpen
        self.isDisabled = isDisabled
        _isOpen = State(initialValue: initiallyOpen)
    }

    public var body: some View {
        VStack(spacing: 0) {
            Button {
                guard !isDisabled else { return }
                withAnimation(.easeInOut(duration: 0.2)) {
                    isOpen.toggle()
                }
            } label: {
                IldsAccordionHeader(
                    title: title,
                    isOpen: isOpen,
                    isDisabled: isDisabled,
                    prefixIcon: prefixIcon,
                    prefixNumber: prefixNumber,
                    isPressed: false,
                    isFocused: false
                )
            }
            .buttonStyle(IldsAccordionButtonStyle(
                title: title,
                isOpen: isOpen,
                isDisabled: isDisabled,
                prefixIcon: prefixIcon,
                prefixNumber: prefixNumber
            ))
            .disabled(isDisabled)

            Divider()
                .background(ILDSTokens.neutralCoolgray200)

            if isOpen {
                content
                    .padding(ILDSTokens.sp16)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .accessibilityLabel(title)
        .accessibilityAddTraits(isOpen ? .isSelected : [])
    }
}

private struct IldsAccordionHeader: View {
    let title: String
    let isOpen: Bool
    let isDisabled: Bool
    let prefixIcon: AnyView?
    let prefixNumber: Int?
    let isPressed: Bool
    let isFocused: Bool

    var body: some View {
        let titleColor: Color = {
            if isDisabled { return ILDSTokens.neutralCoolgray300 }
            if isFocused { return ILDSTokens.primaryOrange500 }
            return ILDSTokens.neutralCoolgray900
        }()
        let iconColor = isFocused ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray600
        let background: Color = isPressed ? ILDSTokens.neutralCoolgray100 : ILDSTokens.globalWhite000

        HStack(spacing: ILDSTokens.sp8) {
            if let prefixIcon {
                prefixIcon
                    .foregroundStyle(iconColor)
                    .frame(width: ILDSTokens.sp16, height: ILDSTokens.sp16)
            }
            if let prefixNumber {
                Text("\(prefixNumber)")
                    .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightBold))
                    .foregroundStyle(ILDSTokens.neutralCoolgray600)
            }
            Text(title)
                .font(.system(size: ILDSTokens.fontSize14, weight: ILDSTokens.fontWeightMedium))
                .foregroundStyle(titleColor)
                .frame(maxWidth: .infinity, alignment: .leading)
            Image(systemName: "chevron.down")
                .font(.system(size: ILDSTokens.sp20))
                .foregroundStyle(iconColor)
                .rotationEffect(.degrees(isOpen ? 180 : 0))
                .animation(.easeInOut(duration: 0.2), value: isOpen)
        }
        .padding(.horizontal, ILDSTokens.sp16)
        .padding(.vertical, ILDSTokens.sp12)
        .background(background)
    }
}

private struct IldsAccordionButtonStyle: ButtonStyle {
    let title: String
    let isOpen: Bool
    let isDisabled: Bool
    let prefixIcon: AnyView?
    let prefixNumber: Int?

    func makeBody(configuration: Configuration) -> some View {
        IldsAccordionHeader(
            title: title,
            isOpen: isOpen,
            isDisabled: isDisabled,
            prefixIcon: prefixIcon,
            prefixNumber: prefixNumber,
            isPressed: configuration.isPressed && !isDisabled,
            isFocused: false
        )
    }
}
