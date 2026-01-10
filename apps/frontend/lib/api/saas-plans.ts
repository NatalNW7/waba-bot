/**
 * SaaS Plans API functions
 */

import { ISaasPlan, PaymentInterval } from "@repo/api-types";
import { apiFetch, apiConfig } from "./config";

/**
 * Fetch all SaaS plans from the backend
 * @returns Array of SaaS plans
 */
export async function getSaasPlans(): Promise<ISaasPlan[]> {
  try {
    const plans = await apiFetch<ISaasPlan[]>(apiConfig.endpoints.saasPlans);
    return plans;
  } catch (error) {
    console.error("Failed to fetch SaaS plans:", error);
    return [];
  }
}

/**
 * Group SaaS plans by their billing interval
 * @param plans - Array of SaaS plans
 * @returns Map of interval to plans array
 */
export function groupPlansByInterval(
  plans: ISaasPlan[],
): Record<PaymentInterval, ISaasPlan[]> {
  const grouped: Record<PaymentInterval, ISaasPlan[]> = {
    [PaymentInterval.MONTHLY]: [],
    [PaymentInterval.QUARTERLY]: [],
    [PaymentInterval.YEARLY]: [],
  };

  for (const plan of plans) {
    if (grouped[plan.interval]) {
      grouped[plan.interval].push(plan);
    }
  }

  // Sort plans by price within each group
  for (const interval of Object.keys(grouped) as PaymentInterval[]) {
    grouped[interval].sort((a, b) => Number(a.price) - Number(b.price));
  }

  return grouped;
}

/**
 * Format price for display in BRL currency
 * @param price - Price value (string or number)
 * @returns Formatted price string
 */
export function formatPrice(price: string | number): string {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

/**
 * Get interval display label in Portuguese
 * @param interval - Payment interval enum value
 * @returns Localized label
 */
export function getIntervalLabel(interval: PaymentInterval): string {
  const labels: Record<PaymentInterval, string> = {
    [PaymentInterval.MONTHLY]: "Mensal",
    [PaymentInterval.QUARTERLY]: "Trimestral",
    [PaymentInterval.YEARLY]: "Anual",
  };
  return labels[interval];
}

/**
 * Get period text for price display
 * @param interval - Payment interval enum value
 * @returns Period text (e.g., "por mês")
 */
export function getPeriodText(interval: PaymentInterval): string {
  const periods: Record<PaymentInterval, string> = {
    [PaymentInterval.MONTHLY]: "por mês",
    [PaymentInterval.QUARTERLY]: "por trimestre",
    [PaymentInterval.YEARLY]: "por ano",
  };
  return periods[interval];
}
