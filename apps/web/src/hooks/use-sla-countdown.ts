import { useEffect, useState } from "react"

const TICK_MS = 15000

export type SlaCountdown = {
  remainingMinutes: number
  isBreached: boolean
  isResolved: boolean
}

export function useSlaCountdown(
  deadline: number,
  resolvedAt: number | null
): SlaCountdown {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (resolvedAt !== null) {
      return undefined
    }

    const id = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [resolvedAt])

  const reference = resolvedAt ?? now
  const remainingMinutes = Math.round((deadline - reference) / 60000)

  return {
    remainingMinutes,
    isBreached: remainingMinutes < 0,
    isResolved: resolvedAt !== null,
  }
}
