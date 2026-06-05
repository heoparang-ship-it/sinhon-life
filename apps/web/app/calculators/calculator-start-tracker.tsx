"use client";

import { useEffect } from "react";
import { trackEvent } from "../lib/analytics";

export function CalculatorStartTracker() {
  useEffect(() => {
    void trackEvent({
      eventName: "calculator_started",
      payload: {
        entry: "calculators_landing"
      }
    });
  }, []);

  return null;
}
