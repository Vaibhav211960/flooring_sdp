export const BOX_QUANTITY = 10;

export const clampToBoxQuantity = (value, maxStock = Infinity) => {
  const numericValue = Number(value);
  const normalized = Number.isFinite(numericValue) ? Math.trunc(numericValue) : BOX_QUANTITY;
  const safeMax = Number.isFinite(Number(maxStock)) ? Math.max(0, Math.trunc(Number(maxStock))) : Infinity;
  const boxLimitedMax =
    safeMax === Infinity ? Infinity : Math.floor(safeMax / BOX_QUANTITY) * BOX_QUANTITY;

  if (boxLimitedMax !== Infinity && boxLimitedMax < BOX_QUANTITY) {
    return 0;
  }

  const clamped = Math.max(BOX_QUANTITY, normalized - (normalized % BOX_QUANTITY));
  return boxLimitedMax === Infinity ? clamped : Math.min(clamped, boxLimitedMax);
};

export const incrementByBox = (value, maxStock = Infinity) =>
  clampToBoxQuantity(Number(value || 0) + BOX_QUANTITY, maxStock);

export const decrementByBox = (value) =>
  Math.max(BOX_QUANTITY, clampToBoxQuantity(Number(value || BOX_QUANTITY)) - BOX_QUANTITY);
