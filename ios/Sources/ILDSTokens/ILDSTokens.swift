// GENERATED FILE — DO NOT EDIT BY HAND.
// Source: tokens/tokens.json  Generator: style-dictionary.config.mjs
// Regenerate: npm run build:tokens
import SwiftUI

public extension Color {
    init(hex: UInt32, alpha: Double = 1.0) {
        let r = Double((hex >> 16) & 0xFF) / 255.0
        let g = Double((hex >> 8) & 0xFF) / 255.0
        let b = Double(hex & 0xFF) / 255.0
        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)
    }
}

public enum ILDSTokens {
    // MARK: - Colors
    public static let primaryOrange50 = Color(hex: 0xFFF2ED)
    public static let primaryOrange100 = Color(hex: 0xFFD6C8)
    public static let primaryOrange200 = Color(hex: 0xFFBCA1)
    public static let primaryOrange300 = Color(hex: 0xFF9D76)
    public static let primaryOrange400 = Color(hex: 0xFF7C43)
    public static let primaryOrange500 = Color(hex: 0xE3530F)
    public static let primaryOrange600 = Color(hex: 0xC74C01)
    public static let primaryOrange700 = Color(hex: 0x903501)
    public static let primaryOrange800 = Color(hex: 0x5A1E00)
    public static let primaryOrange900 = Color(hex: 0x2E0C00)
    public static let errorRed50 = Color(hex: 0xFFF2EE)
    public static let errorRed100 = Color(hex: 0xFFD5CD)
    public static let errorRed200 = Color(hex: 0xFFB8AC)
    public static let errorRed300 = Color(hex: 0xFF9889)
    public static let errorRed400 = Color(hex: 0xFF7362)
    public static let errorRed500 = Color(hex: 0xF5503F)
    public static let errorRed600 = Color(hex: 0xE00903)
    public static let errorRed700 = Color(hex: 0xA30100)
    public static let errorRed800 = Color(hex: 0x670000)
    public static let errorRed900 = Color(hex: 0x360000)
    public static let warningAmber50 = Color(hex: 0xFFF3E3)
    public static let warningAmber100 = Color(hex: 0xFFE2B7)
    public static let warningAmber200 = Color(hex: 0xFFD087)
    public static let warningAmber300 = Color(hex: 0xFFBC49)
    public static let warningAmber400 = Color(hex: 0xF1AE30)
    public static let warningAmber500 = Color(hex: 0xE49F04)
    public static let warningAmber600 = Color(hex: 0xBA8001)
    public static let warningAmber700 = Color(hex: 0x835900)
    public static let warningAmber800 = Color(hex: 0x4E3300)
    public static let warningAmber900 = Color(hex: 0x231500)
    public static let successGreen50 = Color(hex: 0xDFFFE6)
    public static let successGreen100 = Color(hex: 0x83FDA9)
    public static let successGreen200 = Color(hex: 0x6AE593)
    public static let successGreen300 = Color(hex: 0x52CE7C)
    public static let successGreen400 = Color(hex: 0x38B867)
    public static let successGreen500 = Color(hex: 0x01A252)
    public static let successGreen600 = Color(hex: 0x038542)
    public static let successGreen700 = Color(hex: 0x03602E)
    public static let successGreen800 = Color(hex: 0x003C1B)
    public static let successGreen900 = Color(hex: 0x001F0A)
    public static let neutralWarmgray50 = Color(hex: 0xF7F3F2)
    public static let neutralWarmgray100 = Color(hex: 0xE5E0DF)
    public static let neutralWarmgray200 = Color(hex: 0xCAC5C4)
    public static let neutralWarmgray300 = Color(hex: 0xADA8A8)
    public static let neutralWarmgray400 = Color(hex: 0x8F8B8B)
    public static let neutralWarmgray500 = Color(hex: 0x736F6F)
    public static let neutralWarmgray600 = Color(hex: 0x565151)
    public static let neutralWarmgray700 = Color(hex: 0x3C3838)
    public static let neutralWarmgray800 = Color(hex: 0x272525)
    public static let neutralWarmgray900 = Color(hex: 0x161414)
    public static let secondaryMaroon50 = Color(hex: 0xFFF2F1)
    public static let secondaryMaroon100 = Color(hex: 0xFFC0BE)
    public static let secondaryMaroon200 = Color(hex: 0xFF8A89)
    public static let secondaryMaroon300 = Color(hex: 0xDC6969)
    public static let secondaryMaroon400 = Color(hex: 0xB8494C)
    public static let secondaryMaroon500 = Color(hex: 0x94292E)
    public static let secondaryMaroon600 = Color(hex: 0x8B001C)
    public static let secondaryMaroon700 = Color(hex: 0x6D0114)
    public static let secondaryMaroon800 = Color(hex: 0x4F000C)
    public static let secondaryMaroon900 = Color(hex: 0x360006)
    public static let secondaryBlue50 = Color(hex: 0xEDF6FF)
    public static let secondaryBlue100 = Color(hex: 0xA8D1FF)
    public static let secondaryBlue200 = Color(hex: 0x78AAE0)
    public static let secondaryBlue300 = Color(hex: 0x5383B8)
    public static let secondaryBlue400 = Color(hex: 0x315F91)
    public static let secondaryBlue500 = Color(hex: 0x053C6D)
    public static let secondaryBlue600 = Color(hex: 0x003463)
    public static let secondaryBlue700 = Color(hex: 0x012B52)
    public static let secondaryBlue800 = Color(hex: 0x002142)
    public static let secondaryBlue900 = Color(hex: 0x011933)
    public static let globalWhite000 = Color(hex: 0xFFFFFF)
    public static let globalBlack1000 = Color(hex: 0x020202)
    public static let neutralCoolgray50 = Color(hex: 0xFAFAFA)
    public static let neutralCoolgray100 = Color(hex: 0xF5F5F5)
    public static let neutralCoolgray200 = Color(hex: 0xEEEEEE)
    public static let neutralCoolgray300 = Color(hex: 0xE0E0E0)
    public static let neutralCoolgray400 = Color(hex: 0xBDBDBD)
    public static let neutralCoolgray500 = Color(hex: 0x9E9E9E)
    public static let neutralCoolgray600 = Color(hex: 0x757575)
    public static let neutralCoolgray700 = Color(hex: 0x616161)
    public static let neutralCoolgray800 = Color(hex: 0x424242)
    public static let neutralCoolgray900 = Color(hex: 0x212121)
    public static let informativeBlue50 = Color(hex: 0xEDF3FF)
    public static let informativeBlue100 = Color(hex: 0xC7DBFF)
    public static let informativeBlue200 = Color(hex: 0x9EC1FF)
    public static let informativeBlue300 = Color(hex: 0x75A5FF)
    public static let informativeBlue400 = Color(hex: 0x4A87FF)
    public static let informativeBlue500 = Color(hex: 0x2168F6)
    public static let informativeBlue600 = Color(hex: 0x004FE1)
    public static let informativeBlue700 = Color(hex: 0x0039A9)
    public static let informativeBlue800 = Color(hex: 0x002372)
    public static let informativeBlue900 = Color(hex: 0x001244)

    // MARK: - Spacing
    public static let sp2: CGFloat = 2
    public static let sp4: CGFloat = 4
    public static let sp8: CGFloat = 8
    public static let sp12: CGFloat = 12
    public static let sp16: CGFloat = 16
    public static let sp20: CGFloat = 20
    public static let sp24: CGFloat = 24
    public static let sp32: CGFloat = 32
    public static let sp40: CGFloat = 40
    public static let sp48: CGFloat = 48
    public static let sp56: CGFloat = 56
    public static let sp6: CGFloat = 6

    // MARK: - Border radius
    public static let radiusNull: CGFloat = 0
    public static let radiusXsmall: CGFloat = 1
    public static let radiusSmall: CGFloat = 2
    public static let radiusMedium: CGFloat = 4
    public static let radiusLarge: CGFloat = 8
    public static let radiusXlarge: CGFloat = 12
    public static let radius2xlarge: CGFloat = 16
    public static let radiusMassive: CGFloat = 1000

    // MARK: - Typography
    public static let fontFamilyPrimary = "Mulish"
    public static let fontSize12: CGFloat = 12
    public static let fontSize14: CGFloat = 14
    public static let fontSize16: CGFloat = 16
    public static let fontSize20: CGFloat = 20
    public static let fontWeightRegular: Font.Weight = .regular
    public static let fontWeightMedium: Font.Weight = .medium
    public static let fontWeightBold: Font.Weight = .bold
    public static let lineHeight12: CGFloat = 1.333
    public static let lineHeight14: CGFloat = 1.143
    public static let lineHeight16: CGFloat = 1.25
    public static let lineHeight20: CGFloat = 1.2
}
