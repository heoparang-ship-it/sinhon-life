export const productName = "신혼생활";

export const adminAppName = "신혼생활 Admin";

export const workspaceApps = ["web", "admin", "api"] as const;

export const workspacePackages = ["ui", "config", "database", "schemas", "analytics"] as const;

export const requiredEnvKeys = ["DATABASE_URL"] as const;

export const defaultPorts = {
  web: 3000,
  admin: 3001,
  api: 4000
} as const;
