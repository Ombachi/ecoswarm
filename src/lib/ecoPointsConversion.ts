/**
 * EcoPoints ↔ KES conversion utilities.
 * Exchange rate: 10 EcoPoints = 1 KES
 */

export const ECOPOINTS_PER_KES = 10;

/** Convert EcoPoints to KES */
export function pointsToKes(points: number): number {
  return Math.floor(points / ECOPOINTS_PER_KES);
}

/** Convert KES to EcoPoints */
export function kesToPoints(kes: number): number {
  return kes * ECOPOINTS_PER_KES;
}

/** Calculate smart buy breakdown: how many points to use, how much cash remains */
export function calculateSmartBuy(priceKes: number, userPoints: number) {
  const maxPointsValue = pointsToKes(userPoints); // max KES user can cover with points
  const pointsKesUsed = Math.min(maxPointsValue, priceKes); // KES covered by points
  const pointsUsed = pointsKesUsed * ECOPOINTS_PER_KES; // actual points deducted
  const cashRemaining = priceKes - pointsKesUsed;
  const canFullRedeem = maxPointsValue >= priceKes;

  return {
    pointsUsed,
    pointsKesValue: pointsKesUsed,
    cashRemaining,
    canFullRedeem,
    totalPrice: priceKes,
  };
}

/** Format points with KES equivalent */
export function formatPointsWithKes(points: number): string {
  const kes = pointsToKes(points);
  return `${points.toLocaleString()} pts (KSh ${kes.toLocaleString()})`;
}
