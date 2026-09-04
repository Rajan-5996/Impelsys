const SIDEBAR_STORAGE_KEY = "sidebar-open"

export function readStoredSidebarOpen(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

export function writeStoredSidebarOpen(open: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open))
  } catch {
    // storage unavailable (private browsing, disabled) -- non-fatal
  }
}
