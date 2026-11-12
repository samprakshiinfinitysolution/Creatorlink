export const CAMPAIGN_PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
];

export const PLATFORM_LABEL_MAP = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  website: "Website",
};

/**
 * Normalizes campaign platform field (array, comma-separated string, or single string)
 * into an array of unique lowercase platform keys.
 */
export function normalizeCampaignPlatforms(platformValue, fallback = []) {
  if (!platformValue) return fallback;
  const rawList = Array.isArray(platformValue)
    ? platformValue
    : typeof platformValue === "string"
      ? platformValue.split(",")
      : [];

  const normalized = rawList
    .map((p) => (typeof p === "string" ? p.trim().toLowerCase() : ""))
    .filter(Boolean);

  return normalized.length > 0 ? Array.from(new Set(normalized)) : fallback;
}

/**
 * Formats single or multiple campaign platforms into a readable string (e.g., "Instagram, YouTube").
 */
export function formatCampaignPlatforms(platformValue, fallbackText = "General") {
  const list = normalizeCampaignPlatforms(platformValue);
  if (list.length === 0) return fallbackText;
  return list
    .map(
      (p) =>
        PLATFORM_LABEL_MAP[p] ||
        p.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    )
    .join(", ");
}

