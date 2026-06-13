import ILDSTokens
import SwiftUI

// Mirrors lib/ilds_scrollbar.dart + Figma Scrollbar 17730:521.
// TODO(web/desktop): hover thumb expansion — mobile-first defer.

public struct IldsScrollbar<Content: View>: View {
    private let content: Content
    private let showsIndicators: Bool
    private let axis: Axis

    public init(
        axis: Axis = .vertical,
        showsIndicators: Bool = true,
        @ViewBuilder content: () -> Content
    ) {
        self.axis = axis
        self.showsIndicators = showsIndicators
        self.content = content()
    }

    public var body: some View {
        ScrollView(axis == .vertical ? .vertical : .horizontal, showsIndicators: false) {
            content
        }
        .overlay(alignment: axis == .vertical ? .topTrailing : .bottomLeading) {
            if showsIndicators {
                IldsScrollbarTrack(axis: axis)
            }
        }
        .accessibilityLabel("Scrollable content")
    }
}

private struct IldsScrollbarTrack: View {
    let axis: Axis

    var body: some View {
        RoundedRectangle(cornerRadius: ILDSTokens.radiusMassive)
            .fill(ILDSTokens.neutralCoolgray100)
            .frame(
                width: axis == .vertical ? 6 : nil,
                height: axis == .horizontal ? 6 : nil
            )
            .overlay(alignment: .top) {
                RoundedRectangle(cornerRadius: ILDSTokens.radiusMassive)
                    .fill(ILDSTokens.neutralCoolgray200)
                    .frame(width: axis == .vertical ? 6 : 40, height: axis == .vertical ? 40 : 6)
                    .padding(ILDSTokens.sp4)
            }
            .padding(axis == .vertical ? .trailing : .bottom, ILDSTokens.sp4)
            .allowsHitTesting(false)
    }
}
