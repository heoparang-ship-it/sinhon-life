import { describe, expect, it } from "vitest";
import { buildHealthResponse } from "./server.js";

describe("buildHealthResponse", () => {
  it("returns the API health payload", () => {
    expect(buildHealthResponse()).toMatchObject({
      app: "sinhon-os-api",
      status: "ok",
      features:
        "auth-couple-invitation-onboarding-scenarios-policies-offers-compare-rooms-leads-workspace-content-analytics"
    });
  });
});
