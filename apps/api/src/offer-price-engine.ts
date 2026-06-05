import type { OfferPriceOption } from "@sinhon-os/schemas";

export type OfferPriceValidity = "expired" | "valid" | "validity_not_recorded";

function optionAmount(option: OfferPriceOption) {
  if (option.pricingType === "fixed") {
    return option.amount ?? 0;
  }

  if (option.pricingType === "range") {
    return option.maxAmount ?? option.minAmount ?? 0;
  }

  return 0;
}

export function calculateEstimatedTotalPrice(input: {
  basePrice: number;
  requiredOptions?: OfferPriceOption[];
}) {
  const requiredOptionTotal = (input.requiredOptions ?? []).reduce(
    (sum, option) => (option.includedInEstimatedTotal === false ? sum : sum + optionAmount(option)),
    0
  );

  return input.basePrice + requiredOptionTotal;
}

export function getOfferPriceValidity(input: { now?: Date; validUntil?: Date | null }) {
  if (!input.validUntil) {
    return "validity_not_recorded" satisfies OfferPriceValidity;
  }

  const now = input.now ?? new Date();

  return input.validUntil.getTime() < now.getTime()
    ? ("expired" satisfies OfferPriceValidity)
    : ("valid" satisfies OfferPriceValidity);
}

export function isPriceVersionVisibleByDefault(input: {
  now?: Date;
  validUntil?: Date | null;
  verificationStatus: string;
}) {
  return (
    input.verificationStatus === "verified" &&
    getOfferPriceValidity({
      now: input.now,
      validUntil: input.validUntil
    }) !== "expired"
  );
}
