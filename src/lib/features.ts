/**
 * Feature Toggle System
 * ---------------------
 * All optional integrations are disabled by default.
 * Set the corresponding ENABLE_* env var to "true" to activate.
 */

export const features = {
  /** PostgreSQL database connection */
  database: process.env.ENABLE_DATABASE === "true",

  /** MinIO / S3-compatible object storage */
  storage: process.env.ENABLE_STORAGE === "true",

  /** SMTP transactional email */
  smtp: process.env.ENABLE_SMTP === "true",
} as const;

export type FeatureKey = keyof typeof features;

/**
 * Check whether a feature is enabled at runtime.
 * Throws if the feature is disabled and `throwIfDisabled` is true.
 */
export function requireFeature(key: FeatureKey): void {
  if (!features[key]) {
    throw new Error(
      `[Arcscribe] Feature "${key}" is disabled. Set ENABLE_${key.toUpperCase()}=true in your .env.local to enable it.`
    );
  }
}
