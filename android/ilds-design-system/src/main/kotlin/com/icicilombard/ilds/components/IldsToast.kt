package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 17708:3491 — mirrors web/Toast.tsx + lib/ilds_toast.dart.

enum class IldsToastVariant { Success, Info, Warning, Error }

data class IldsToastAction(
    val label: String,
    val onClick: () -> Unit,
)

data class IldsToastActions(
    val primary: IldsToastAction? = null,
    val secondary: IldsToastAction? = null,
)

@Composable
fun IldsToast(
    variant: IldsToastVariant,
    message: String,
    modifier: Modifier = Modifier,
    heading: String? = null,
    showClose: Boolean = false,
    actions: IldsToastActions? = null,
    onClose: (() -> Unit)? = null,
) {
    val style = remember(variant) { IldsToastStyle.resolve(variant) }
    val liveRegionMode = if (variant == IldsToastVariant.Success || variant == IldsToastVariant.Info) {
        LiveRegionMode.Polite
    } else {
        LiveRegionMode.Assertive
    }

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .semantics { liveRegion = liveRegionMode },
        shape = RoundedCornerShape(IldsTokens.radiusXlarge),
        color = IldsTokens.globalWhite000,
        shadowElevation = 8.dp,
        border = BorderStroke(1.dp, style.border),
    ) {
        Column(
            modifier = Modifier.padding(IldsTokens.sp12),
            verticalArrangement = Arrangement.spacedBy(IldsTokens.sp12),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
                verticalAlignment = Alignment.Top,
            ) {
                Icon(
                    imageVector = style.icon,
                    contentDescription = null,
                    tint = style.iconColor,
                    modifier = Modifier.size(24.dp),
                )
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
                ) {
                    if (heading != null) {
                        Text(
                            text = heading,
                            style = TextStyle(
                                fontSize = IldsTokens.fontSize14,
                                lineHeight = 18.sp,
                                fontWeight = IldsTokens.fontWeightBold,
                            ),
                            color = IldsTokens.neutralCoolgray900,
                        )
                    }
                    Text(
                        text = message,
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize14,
                            lineHeight = 18.sp,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = IldsTokens.neutralCoolgray800,
                    )
                }
                if (showClose && onClose != null) {
                    IconButton(
                        onClick = onClose,
                        modifier = Modifier.size(20.dp),
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Close,
                            contentDescription = "Close notification",
                            tint = IldsTokens.neutralCoolgray500,
                            modifier = Modifier.size(20.dp),
                        )
                    }
                }
            }
            val hasActions = actions?.primary != null || actions?.secondary != null
            if (hasActions) {
                Row(horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8)) {
                    actions?.secondary?.let { action ->
                        IldsButton(
                            label = action.label,
                            onClick = action.onClick,
                            type = IldsButtonType.Secondary,
                            size = IldsButtonSize.Medium,
                        )
                    }
                    actions?.primary?.let { action ->
                        IldsButton(
                            label = action.label,
                            onClick = action.onClick,
                            type = IldsButtonType.Primary,
                            size = IldsButtonSize.Medium,
                        )
                    }
                }
            }
        }
    }
}

@Immutable
private data class IldsToastStyle(
    val border: Color,
    val iconColor: Color,
    val icon: ImageVector,
) {
    companion object {
        fun resolve(variant: IldsToastVariant): IldsToastStyle = when (variant) {
            IldsToastVariant.Success -> IldsToastStyle(
                IldsTokens.successGreen50,
                IldsTokens.successGreen500,
                Icons.Filled.CheckCircle,
            )
            IldsToastVariant.Info -> IldsToastStyle(
                IldsTokens.secondaryBlue50,
                IldsTokens.informativeBlue500,
                Icons.Filled.Info,
            )
            IldsToastVariant.Warning -> IldsToastStyle(
                IldsTokens.warningAmber50,
                IldsTokens.warningAmber500,
                Icons.Filled.Warning,
            )
            IldsToastVariant.Error -> IldsToastStyle(
                IldsTokens.errorRed50,
                IldsTokens.errorRed600,
                Icons.Filled.Error,
            )
        }
    }
}
