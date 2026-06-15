package com.icicilombard.ilds.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

enum class IldsBadgeVariant { Subtle, Intense, Success, Error, Warning, Info, Skeleton }
enum class IldsBadgeSize { Small, Medium, Large }

@Composable
fun IldsBadge(
    label: String,
    modifier: Modifier = Modifier,
    variant: IldsBadgeVariant = IldsBadgeVariant.Subtle,
    size: IldsBadgeSize = IldsBadgeSize.Medium,
) {
    val colors = badgeColors(variant)
    val (hPad, vPad, style) = badgeMetrics(size)
    Text(
        text = if (variant == IldsBadgeVariant.Skeleton) "   " else label,
        modifier = modifier
            .background(colors.first, RoundedCornerShape(999.dp))
            .padding(horizontal = hPad, vertical = vPad),
        style = style,
        color = colors.second,
    )
}

private fun badgeColors(variant: IldsBadgeVariant): Pair<Color, Color> = when (variant) {
    IldsBadgeVariant.Subtle -> IldsTokens.secondaryBlue50 to IldsTokens.secondaryBlue500
    IldsBadgeVariant.Intense -> IldsTokens.secondaryBlue500 to IldsTokens.globalWhite000
    IldsBadgeVariant.Success -> IldsTokens.successGreen500 to IldsTokens.globalWhite000
    IldsBadgeVariant.Error -> IldsTokens.errorRed600 to IldsTokens.globalWhite000
    IldsBadgeVariant.Warning -> IldsTokens.warningAmber500 to IldsTokens.globalWhite000
    IldsBadgeVariant.Info -> IldsTokens.informativeBlue500 to IldsTokens.globalWhite000
    IldsBadgeVariant.Skeleton -> IldsTokens.neutralCoolgray100 to Color.Transparent
}

private fun badgeMetrics(size: IldsBadgeSize): Triple<androidx.compose.ui.unit.Dp, androidx.compose.ui.unit.Dp, TextStyle> =
    when (size) {
        IldsBadgeSize.Small -> Triple(IldsTokens.sp8, 2.dp, TextStyle(fontSize = 11.sp, fontWeight = FontWeight.Medium))
        IldsBadgeSize.Medium -> Triple(IldsTokens.sp8, IldsTokens.sp4, TextStyle(fontSize = IldsTokens.fontSize12, fontWeight = FontWeight.Medium))
        IldsBadgeSize.Large -> Triple(IldsTokens.sp12, IldsTokens.sp4, TextStyle(fontSize = 13.sp, fontWeight = FontWeight.Medium))
    }
