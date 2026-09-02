export function humanizeSnake(value: string) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function humanizePascal(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
}

function formatDetailValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ")
  if (value !== null && typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function formatDetailEntries(details: Record<string, unknown>) {
  const entries = Object.entries(details)
  if (entries.length === 0) return "—"
  return entries
    .map(([key, value]) => `${key}: ${formatDetailValue(value)}`)
    .join(" · ")
}

export function formatTimestamp(raw: string): string {
  if (!raw) return "—"
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T")
  const truncated = normalized.replace(/(\.\d{3})\d*/, "$1")
  const date = new Date(truncated)
  if (Number.isNaN(date.getTime())) return raw
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
