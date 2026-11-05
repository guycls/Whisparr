export const UNIFIED_GRID_WINDOW_PAGE_SIZE = 60;
export const UNIFIED_GRID_ROW_OVERSCAN = 2;
export const UNIFIED_GRID_METADATA_HEIGHT = 156;

export function getUnifiedGridGap(isCompact: boolean) {
  return isCompact ? 10 : 15;
}

export function getUnifiedGridColumns(
  gridWidth: number,
  cardSize: number,
  gap: number
) {
  if (gridWidth <= 0 || cardSize <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor((gridWidth + gap) / (cardSize + gap)));
}

export function getUnifiedGridColumnWidth(
  gridWidth: number,
  columns: number,
  gap: number
) {
  if (columns <= 1) {
    return Math.max(gridWidth, 0);
  }

  return Math.max((gridWidth - (columns - 1) * gap) / columns, 0);
}

export function getUnifiedGridRowMetrics(columnWidth: number, gap: number) {
  const imageHeight = Math.round((columnWidth * 9) / 16);
  const rowContentHeight = imageHeight + UNIFIED_GRID_METADATA_HEIGHT;

  return {
    imageHeight,
    rowContentHeight,
    rowStride: rowContentHeight + gap,
  };
}

export function getVisibleRowRange({
  scrollTop,
  viewportHeight,
  gridOffset,
  rowStride,
  rowCount,
  overscan = UNIFIED_GRID_ROW_OVERSCAN,
}: {
  scrollTop: number;
  viewportHeight: number;
  gridOffset: number;
  rowStride: number;
  rowCount: number;
  overscan?: number;
}) {
  if (rowCount <= 0 || rowStride <= 0) {
    return { startRow: 0, endRow: 0 };
  }

  const localTop = scrollTop - gridOffset;
  const localBottom = localTop + viewportHeight;

  if (localBottom < 0) {
    return {
      startRow: 0,
      endRow: Math.min(rowCount, overscan),
    };
  }

  const startRow = Math.max(0, Math.floor(localTop / rowStride) - overscan);
  const endRow = Math.min(
    rowCount,
    Math.ceil(localBottom / rowStride) + overscan
  );

  return {
    startRow,
    endRow: Math.max(startRow, endRow),
  };
}

export function getWindowPagesForRange(
  startIndex: number,
  endIndex: number,
  pageSize: number
) {
  if (endIndex <= startIndex || pageSize <= 0) {
    return [];
  }

  const first = Math.floor(startIndex / pageSize) + 1;
  const last = Math.floor((endIndex - 1) / pageSize) + 1;
  const pages = [];

  for (let page = first; page <= last; page++) {
    pages.push(page);
  }

  return pages;
}

export function pruneUnifiedGridWindowPages<T>(
  pages: Record<number, T> | undefined,
  startPage: number,
  endPage: number
) {
  const source = pages || {};
  const keepFrom = startPage - 1;
  const keepTo = endPage + 1;
  const next: Record<number, T> = {};

  Object.keys(source).forEach((key) => {
    const page = Number(key);

    if (page >= keepFrom && page <= keepTo) {
      next[page] = source[page];
    }
  });

  return next;
}

export function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflowY } = window.getComputedStyle(current);

    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}
