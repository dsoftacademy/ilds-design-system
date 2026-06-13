package com.icicilombard.ilds.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.semantics.toggleableState
import androidx.compose.ui.state.ToggleableState
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 14371:6309 — mirrors web/Switch.tsx + lib/ilds_switch.dart.

enum class IldsSwitchSize { Small, Medium, Large }

@Composable
fun IldsSwitch(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    size: IldsSwitchSize = IldsSwitchSize.Medium,
    isDisabled: Boolean = false,
    thumbIcon: (@Composable () -> Unit)? = null,
) {
    val metrics = remember(size) { IldsSwitchMetrics(size) }
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val colors = remember(checked, isDisabled, isPressed) {
        IldsSwitchColors.resolve(checked, isDisabled, isPressed)
    }
    val thumbOffset by animateDpAsState(
        targetValue = if (checked) metrics.thumbOn else metrics.thumbOff,
        label = "switchThumb",
    )

    Row(
        modifier = modifier.semantics {
            role = Role.Switch
            toggleableState = if (checked) ToggleableState.On else ToggleableState.Off
            stateDescription = if (checked) "On" else "Off"
        },
        horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Surface(
            onClick = { if (!isDisabled) onCheckedChange(!checked) },
            modifier = Modifier.size(metrics.trackWidth, metrics.trackHeight),
            enabled = !isDisabled,
            interactionSource = interactionSource,
            shape = RoundedCornerShape(metrics.trackHeight / 2),
            color = colors.track,
        ) {
            Box(modifier = Modifier.size(metrics.trackWidth, metrics.trackHeight)) {
                Surface(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .offset(x = thumbOffset)
                        .size(metrics.thumbSize)
                        .shadow(1.dp, CircleShape, spotColor = Color.Black.copy(alpha = 0.25f)),
                    shape = CircleShape,
                    color = colors.thumb,
                ) {
                    if (thumbIcon != null) {
                        Box(
                            modifier = Modifier.size(metrics.thumbSize),
                            contentAlignment = Alignment.Center,
                        ) {
                            thumbIcon()
                        }
                    }
                }
            }
        }
        if (label != null) {
            Text(
                text = label,
                style = metrics.labelStyle,
                color = colors.label,
            )
        }
    }
}

@Immutable
private data class IldsSwitchColors(
    val track: Color,
    val thumb: Color,
    val label: Color,
) {
    companion object {
        fun resolve(checked: Boolean, isDisabled: Boolean, isPressed: Boolean): IldsSwitchColors {
            if (isDisabled) {
                return IldsSwitchColors(
                    track = if (checked) IldsTokens.primaryOrange200 else IldsTokens.neutralCoolgray100,
                    thumb = IldsTokens.globalWhite000,
                    label = IldsTokens.neutralCoolgray300,
                )
            }
            val track = when {
                isPressed && checked -> IldsTokens.primaryOrange600
                checked -> IldsTokens.primaryOrange500
                isPressed -> IldsTokens.neutralCoolgray200
                else -> IldsTokens.neutralCoolgray100
            }
            return IldsSwitchColors(
                track = track,
                thumb = IldsTokens.globalWhite000,
                label = IldsTokens.neutralCoolgray900,
            )
        }
    }
}

@Immutable
private data class IldsSwitchMetrics(
    val trackWidth: Dp,
    val trackHeight: Dp,
    val thumbSize: Dp,
    val thumbOff: Dp,
    val thumbOn: Dp,
    val labelStyle: TextStyle,
) {
    constructor(size: IldsSwitchSize) : this(
        trackWidth = when (size) {
            IldsSwitchSize.Small -> 36.dp
            IldsSwitchSize.Medium -> 44.dp
            IldsSwitchSize.Large -> 52.dp
        },
        trackHeight = when (size) {
            IldsSwitchSize.Small -> 20.dp
            IldsSwitchSize.Medium -> 24.dp
            IldsSwitchSize.Large -> 28.dp
        },
        thumbSize = when (size) {
            IldsSwitchSize.Small -> 16.dp
            IldsSwitchSize.Medium -> 20.dp
            IldsSwitchSize.Large -> 24.dp
        },
        thumbOff = 2.dp,
        thumbOn = when (size) {
            IldsSwitchSize.Small -> 36.dp - 16.dp - 2.dp
            IldsSwitchSize.Medium -> 44.dp - 20.dp - 2.dp
            IldsSwitchSize.Large -> 52.dp - 24.dp - 2.dp
        },
        labelStyle = TextStyle(
            fontSize = when (size) {
                IldsSwitchSize.Small -> IldsTokens.fontSize12
                IldsSwitchSize.Medium -> IldsTokens.fontSize14
                IldsSwitchSize.Large -> IldsTokens.fontSize16
            },
            lineHeight = when (size) {
                IldsSwitchSize.Small -> 16.sp
                IldsSwitchSize.Medium -> 18.sp
                IldsSwitchSize.Large -> 20.sp
            },
            fontWeight = IldsTokens.fontWeightRegular,
        ),
    )
}
