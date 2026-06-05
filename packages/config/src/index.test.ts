import { describe, expect, it } from "vitest";
import { defaultPorts, productName, workspaceApps } from "./index.js";

describe("config", () => {
  it("defines the product name and workspace apps", () => {
    expect(productName).toBe("신혼OS");
    expect(workspaceApps).toEqual(["web", "admin", "api"]);
    expect(defaultPorts.api).toBe(4000);
  });
});
