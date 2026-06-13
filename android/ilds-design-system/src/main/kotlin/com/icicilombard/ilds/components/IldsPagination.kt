package com.icicilombard.ilds.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowLeft
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.role
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.icicilombard.ilds.tokens.IldsTokens

// Figma set 17724:3361 — mirrors web/Pagination.tsx + lib/ilds_pagination.dart.

enum class IldsPaginationVariant { Extended, Compact }

@Composable
fun IldsPagination(
    totalPages: Int,
    modifier: Modifier = Modifier,
    currentPage: Int? = null,
    defaultPage: Int = 1,
    variant: IldsPaginationVariant = IldsPaginationVariant.Extended,
    onPageChange: (Int) -> Unit = {},
) {
    var internalPage by remember { mutableIntStateOf(defaultPage) }
    val page = currentPage ?: internalPage

    fun go(next: Int) {
        if (next < 1 || next > totalPages || next == page) return
        if (currentPage == null) internalPage = next
        onPageChange(next)
    }

    if (variant == IldsPaginationVariant.Compact) {
        Row(
            modifier = modifier,
            horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            NavArrow(previous = true, enabled = page > 1) { go(page - 1) }
            Text(
                text = "$page of $totalPages pages",
                style = TextStyle(
                    fontSize = IldsTokens.fontSize14,
                    lineHeight = 18.sp,
                    fontWeight = IldsTokens.fontWeightMedium,
                ),
                color = IldsTokens.neutralCoolgray900,
            )
            NavArrow(previous = false, enabled = page < totalPages) { go(page + 1) }
        }
        return
    }

    val pages = remember(page, totalPages) { visiblePages(page, totalPages) }

    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        NavArrow(previous = true, enabled = page > 1) { go(page - 1) }
        pages.forEachIndexed { index, pageNum ->
            if (index > 0 && pageNum - pages[index - 1] > 1) {
                Text(
                    text = "…",
                    style = TextStyle(
                        fontSize = IldsTokens.fontSize16,
                        fontWeight = IldsTokens.fontWeightBold,
                    ),
                    color = IldsTokens.neutralCoolgray900,
                    modifier = Modifier
                        .size(32.dp)
                        .semantics { contentDescription = "More pages" },
                )
            }
            PageCell(
                page = pageNum,
                selected = pageNum == page,
                onClick = { go(pageNum) },
            )
        }
        NavArrow(previous = false, enabled = page < totalPages) { go(page + 1) }
    }
}

@Composable
private fun NavArrow(
    previous: Boolean,
    enabled: Boolean,
    onClick: () -> Unit,
) {
    TextButton(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier.semantics {
            contentDescription = if (previous) "Previous page" else "Next page"
        },
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(IldsTokens.sp4),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (previous) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowLeft,
                    contentDescription = null,
                    tint = if (enabled) IldsTokens.primaryOrange500 else IldsTokens.neutralCoolgray300,
                    modifier = Modifier.size(16.dp),
                )
                Text(
                    text = "Back",
                    style = TextStyle(
                        fontSize = IldsTokens.fontSize16,
                        lineHeight = 20.sp,
                        fontWeight = IldsTokens.fontWeightBold,
                    ),
                    color = if (enabled) IldsTokens.primaryOrange500 else IldsTokens.neutralCoolgray300,
                )
            } else {
                Text(
                    text = "Next",
                    style = TextStyle(
                        fontSize = IldsTokens.fontSize16,
                        lineHeight = 20.sp,
                        fontWeight = IldsTokens.fontWeightBold,
                    ),
                    color = if (enabled) IldsTokens.primaryOrange500 else IldsTokens.neutralCoolgray300,
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                    contentDescription = null,
                    tint = if (enabled) IldsTokens.primaryOrange500 else IldsTokens.neutralCoolgray300,
                    modifier = Modifier.size(16.dp),
                )
            }
        }
    }
}

@Composable
private fun PageCell(
    page: Int,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val colors = remember(selected, isPressed) {
        PageCellColors.resolve(selected, isPressed)
    }

    Box(
        modifier = Modifier
            .size(32.dp)
            .semantics {
                role = Role.Button
                this.selected = selected
                contentDescription = "Page $page"
            },
        contentAlignment = Alignment.Center,
    ) {
        Surface(
            onClick = onClick,
            modifier = Modifier.size(32.dp),
            interactionSource = interactionSource,
            shape = RoundedCornerShape(IldsTokens.radiusLarge),
            color = colors.background,
            border = if (colors.border != Color.Transparent) BorderStroke(1.dp, colors.border) else null,
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(
                    text = page.toString(),
                    style = TextStyle(
                        fontSize = IldsTokens.fontSize16,
                        lineHeight = 20.sp,
                        fontWeight = IldsTokens.fontWeightBold,
                    ),
                    color = colors.text,
                )
            }
        }
    }
}

@Immutable
private data class PageCellColors(
    val background: Color,
    val border: Color,
    val text: Color,
) {
    companion object {
        fun resolve(selected: Boolean, isPressed: Boolean): PageCellColors {
            if (selected) {
                return PageCellColors(
                    IldsTokens.primaryOrange50,
                    Color.Transparent,
                    IldsTokens.primaryOrange600,
                )
            }
            return PageCellColors(
                Color.Transparent,
                Color.Transparent,
                IldsTokens.neutralCoolgray900,
            )
        }
    }
}

private fun visiblePages(current: Int, total: Int): List<Int> {
    if (total <= 7) return (1..total).toList()
    val set = linkedSetOf(1, total, current)
    if (current > 1) set.add(current - 1)
    if (current < total) set.add(current + 1)
    return set.sorted()
}
