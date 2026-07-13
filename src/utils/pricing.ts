const FREE_SHIPPING_THRESHOLD = 50;
const FLAT_SHIPPING_COST = 5.99;
const TAX_RATE = 0.08; // 8% flat rate — swap for a real tax service later

export interface PricingBreakdown {
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const calculatePricing = (subtotal: number, discount = 0): PricingBreakdown => {
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : FLAT_SHIPPING_COST;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = round2(discountedSubtotal * TAX_RATE);
  const total = round2(discountedSubtotal + shippingCost + tax);

  return {
    subtotal: round2(subtotal),
    shippingCost: round2(shippingCost),
    tax,
    discount: round2(discount),
    total,
  };
};
