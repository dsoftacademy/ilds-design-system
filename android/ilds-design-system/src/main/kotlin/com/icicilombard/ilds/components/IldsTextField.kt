package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 13478:25332 — mirrors web/TextField.tsx + lib/ilds_text_field.dart.

enum class IldsTextFieldKind { Standard, Password, OtpX6, OtpX4 }
enum class IldsRequiredIndicator { Text, Asterisk }

@Composable
fun IldsTextField(
    modifier: Modifier = Modifier,
    kind: IldsTextFieldKind = IldsTextFieldKind.Standard,
    label: String? = null,
    value: String = "",
    onValueChange: (String) -> Unit = {},
    placeholder: String = "Enter text",
    helperText: String? = null,
    errorText: String? = null,
    successText: String? = null,
    isRequired: Boolean = false,
    requiredIndicator: IldsRequiredIndicator = IldsRequiredIndicator.Text,
    isDisabled: Boolean = false,
    isLoading: Boolean = false,
    maxLength: Int? = null,
    helpButtonLabel: String? = null,
    onHelpPress: (() -> Unit)? = null,
    onOtpComplete: ((String) -> Unit)? = null,
    prefixIcon: (@Composable () -> Unit)? = null,
    suffixIcon: (@Composable () -> Unit)? = null,
    suffixText: String? = null,
) {
    when (kind) {
        IldsTextFieldKind.OtpX6 -> OtpField(
            modifier = modifier,
            cellCount = 6,
            label = label,
            value = value,
            onValueChange = onValueChange,
            isDisabled = isDisabled,
            errorText = errorText,
            successText = successText,
            onOtpComplete = onOtpComplete,
        )
        IldsTextFieldKind.OtpX4 -> OtpField(
            modifier = modifier,
            cellCount = 4,
            label = label,
            value = value,
            onValueChange = onValueChange,
            isDisabled = isDisabled,
            errorText = errorText,
            successText = successText,
            onOtpComplete = onOtpComplete,
        )
        else -> StandardTextField(
            modifier = modifier,
            kind = kind,
            label = label,
            value = value,
            onValueChange = onValueChange,
            placeholder = placeholder,
            helperText = helperText,
            errorText = errorText,
            successText = successText,
            isRequired = isRequired,
            requiredIndicator = requiredIndicator,
            isDisabled = isDisabled,
            isLoading = isLoading,
            maxLength = maxLength,
            helpButtonLabel = helpButtonLabel,
            onHelpPress = onHelpPress,
            prefixIcon = prefixIcon,
            suffixIcon = suffixIcon,
            suffixText = suffixText,
        )
    }
}

@Composable
private fun StandardTextField(
    modifier: Modifier,
    kind: IldsTextFieldKind,
    label: String?,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    helperText: String?,
    errorText: String?,
    successText: String?,
    isRequired: Boolean,
    requiredIndicator: IldsRequiredIndicator,
    isDisabled: Boolean,
    isLoading: Boolean,
    maxLength: Int?,
    helpButtonLabel: String?,
    onHelpPress: (() -> Unit)?,
    prefixIcon: (@Composable () -> Unit)?,
    suffixIcon: (@Composable () -> Unit)?,
    suffixText: String?,
) {
    var text by remember(value) { mutableStateOf(value) }
    var showPassword by remember { mutableStateOf(false) }
    val interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()
    val hasError = errorText != null && !isDisabled
    val hasSuccess = successText != null && !hasError && !isDisabled
    val isPassword = kind == IldsTextFieldKind.Password

    val borderColor = when {
        isDisabled -> IldsTokens.neutralCoolgray300
        isLoading -> IldsTokens.neutralCoolgray500
        hasError -> IldsTokens.errorRed600
        hasSuccess -> IldsTokens.successGreen500
        isFocused && text.isEmpty() -> IldsTokens.primaryOrange600
        isFocused -> IldsTokens.primaryOrange500
        else -> IldsTokens.neutralCoolgray500
    }
    val borderWidth = when {
        isDisabled -> 1.dp
        isFocused && text.isEmpty() -> 2.dp
        else -> 1.dp
    }
    val background = when {
        isDisabled -> IldsTokens.neutralCoolgray200
        isFocused && text.isEmpty() -> IldsTokens.neutralCoolgray50
        else -> IldsTokens.globalWhite000
    }
    val bottomText = when {
        hasError -> errorText
        hasSuccess -> successText
        else -> helperText
    }
    val bottomColor = when {
        hasError -> IldsTokens.errorRed600
        hasSuccess -> IldsTokens.successGreen600
        else -> IldsTokens.neutralCoolgray700
    }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
    ) {
        if (label != null) {
            LabelRow(label, isRequired, requiredIndicator, isDisabled)
        }
        Surface(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(IldsTokens.radiusMedium),
            color = background,
            border = BorderStroke(borderWidth, borderColor),
        ) {
            Row(
                modifier = Modifier
                    .defaultMinSize(minHeight = 44.dp)
                    .padding(horizontal = IldsTokens.sp12),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8),
            ) {
                prefixIcon?.invoke()
                BasicTextField(
                    value = text,
                    onValueChange = {
                        val next = if (maxLength != null) it.take(maxLength) else it
                        text = next
                        onValueChange(next)
                    },
                    modifier = Modifier
                        .weight(1f)
                        .semantics { contentDescription = label ?: placeholder },
                    enabled = !isDisabled && !isLoading,
                    singleLine = true,
                    textStyle = TextStyle(
                        fontSize = IldsTokens.fontSize14,
                        lineHeight = 18.sp,
                        fontWeight = IldsTokens.fontWeightRegular,
                        color = IldsTokens.neutralCoolgray900,
                    ),
                    cursorBrush = SolidColor(IldsTokens.primaryOrange500),
                    interactionSource = interactionSource,
                    visualTransformation = if (isPassword && !showPassword) {
                        PasswordVisualTransformation()
                    } else {
                        VisualTransformation.None
                    },
                    decorationBox = { inner ->
                        Box(contentAlignment = Alignment.CenterStart) {
                            if (text.isEmpty()) {
                                Text(
                                    text = placeholder,
                                    style = TextStyle(
                                        fontSize = IldsTokens.fontSize14,
                                        lineHeight = 18.sp,
                                        fontWeight = IldsTokens.fontWeightRegular,
                                    ),
                                    color = IldsTokens.neutralCoolgray500,
                                )
                            }
                            inner()
                        }
                    },
                )
                when {
                    isLoading -> CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = IldsTokens.primaryOrange500,
                        strokeWidth = 2.dp,
                    )
                    isPassword -> IconButton(
                        onClick = { showPassword = !showPassword },
                        enabled = !isDisabled,
                        modifier = Modifier.size(20.dp),
                    ) {
                        Icon(
                            imageVector = if (showPassword) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                            contentDescription = if (showPassword) "Hide password" else "Show password",
                            tint = IldsTokens.neutralCoolgray500,
                            modifier = Modifier.size(20.dp),
                        )
                    }
                    suffixText != null -> Text(
                        text = suffixText,
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize14,
                            lineHeight = 18.sp,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = IldsTokens.neutralCoolgray800,
                    )
                    suffixIcon != null -> suffixIcon()
                }
            }
        }
        if (!isDisabled && (bottomText != null || helpButtonLabel != null || maxLength != null)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                if (bottomText != null) {
                    Text(
                        text = bottomText,
                        modifier = Modifier.weight(1f),
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize12,
                            lineHeight = 16.sp,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = bottomColor,
                    )
                } else {
                    Box(modifier = Modifier.weight(1f))
                }
                if (maxLength != null) {
                    Text(
                        text = "${text.length}/$maxLength",
                        style = TextStyle(
                            fontSize = IldsTokens.fontSize12,
                            fontWeight = IldsTokens.fontWeightRegular,
                        ),
                        color = IldsTokens.neutralCoolgray400,
                    )
                }
                if (helpButtonLabel != null && onHelpPress != null) {
                    IldsButton(
                        label = helpButtonLabel,
                        onClick = onHelpPress,
                        type = IldsButtonType.Tertiary,
                        size = IldsButtonSize.Small,
                    )
                }
            }
        }
    }
}

@Composable
private fun LabelRow(
    label: String,
    isRequired: Boolean,
    requiredIndicator: IldsRequiredIndicator,
    isDisabled: Boolean,
) {
    Row(
        horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = TextStyle(
                fontSize = IldsTokens.fontSize12,
                lineHeight = 16.sp,
                fontWeight = IldsTokens.fontWeightBold,
            ),
            color = if (isDisabled) IldsTokens.neutralCoolgray300 else IldsTokens.neutralCoolgray900,
        )
        if (isRequired) {
            Text(
                text = if (requiredIndicator == IldsRequiredIndicator.Asterisk) "*" else "(required)",
                style = TextStyle(
                    fontSize = if (requiredIndicator == IldsRequiredIndicator.Asterisk) {
                        IldsTokens.fontSize12
                    } else {
                        10.sp
                    },
                    fontWeight = if (requiredIndicator == IldsRequiredIndicator.Asterisk) {
                        IldsTokens.fontWeightBold
                    } else {
                        IldsTokens.fontWeightRegular
                    },
                ),
                color = if (requiredIndicator == IldsRequiredIndicator.Asterisk) {
                    IldsTokens.errorRed700
                } else {
                    IldsTokens.neutralCoolgray800
                },
            )
        }
    }
}

@Composable
private fun OtpField(
    modifier: Modifier,
    cellCount: Int,
    label: String?,
    value: String,
    onValueChange: (String) -> Unit,
    isDisabled: Boolean,
    errorText: String?,
    successText: String?,
    onOtpComplete: ((String) -> Unit)?,
) {
    val digits = remember(value, cellCount) {
        value.filter { it.isDigit() }.take(cellCount).padEnd(cellCount, ' ')
    }
    val focusRequesters = remember(cellCount) { List(cellCount) { FocusRequester() } }
    var focusedIndex by remember { mutableStateOf(0) }
    val hasError = errorText != null
    val hasSuccess = successText != null && !hasError

    LaunchedEffect(value) {
        val filled = value.filter { it.isDigit() }.length
        if (filled == cellCount) onOtpComplete?.invoke(value.filter { it.isDigit() })
    }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
    ) {
        if (label != null) {
            Text(
                text = label,
                style = TextStyle(
                    fontSize = IldsTokens.fontSize12,
                    lineHeight = 16.sp,
                    fontWeight = IldsTokens.fontWeightBold,
                ),
                color = IldsTokens.neutralCoolgray900,
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp8)) {
            repeat(cellCount) { index ->
                val char = digits.getOrNull(index)?.takeIf { !it.isWhitespace() }?.toString() ?: ""
                val isCellFocused = focusedIndex == index
                val borderColor = when {
                    isDisabled -> IldsTokens.neutralCoolgray300
                    hasError -> IldsTokens.errorRed600
                    hasSuccess -> IldsTokens.successGreen500
                    isCellFocused && char.isEmpty() -> IldsTokens.primaryOrange600
                    isCellFocused -> IldsTokens.primaryOrange500
                    else -> IldsTokens.neutralCoolgray500
                }
                val borderWidth = if (isCellFocused && char.isEmpty()) 2.dp else 1.dp

                Surface(
                    modifier = Modifier
                        .width(48.dp)
                        .defaultMinSize(minHeight = 44.dp),
                    shape = RoundedCornerShape(IldsTokens.radiusMedium),
                    color = if (isDisabled) IldsTokens.neutralCoolgray200 else IldsTokens.globalWhite000,
                    border = BorderStroke(borderWidth, borderColor),
                ) {
                    BasicTextField(
                        value = char,
                        onValueChange = { input ->
                            val nextChar = input.filter { it.isDigit() }.takeLast(1)
                            val chars = digits.toCharArray()
                            chars[index] = nextChar.firstOrNull() ?: ' '
                            val joined = chars.joinToString("").replace(" ", "")
                            onValueChange(joined)
                            if (nextChar.isNotEmpty() && index < cellCount - 1) {
                                focusedIndex = index + 1
                                focusRequesters[index + 1].requestFocus()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .focusRequester(focusRequesters[index])
                            .semantics { contentDescription = "OTP digit ${index + 1}" },
                        enabled = !isDisabled,
                        singleLine = true,
                        textStyle = TextStyle(
                            fontSize = IldsTokens.fontSize14,
                            lineHeight = 18.sp,
                            fontWeight = IldsTokens.fontWeightBold,
                            color = IldsTokens.neutralCoolgray900,
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        cursorBrush = SolidColor(IldsTokens.primaryOrange500),
                        decorationBox = { inner ->
                            Box(contentAlignment = Alignment.Center) {
                                inner()
                            }
                        },
                    )
                }
            }
        }
        val bottomText = errorText ?: successText
        if (bottomText != null) {
            Text(
                text = bottomText,
                style = TextStyle(
                    fontSize = IldsTokens.fontSize12,
                    lineHeight = 16.sp,
                    fontWeight = IldsTokens.fontWeightRegular,
                ),
                color = if (hasError) IldsTokens.errorRed600 else IldsTokens.successGreen600,
            )
        }
    }
}
