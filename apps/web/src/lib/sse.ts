import type { AxiosInstance } from "axios"

export type SseEvent = {
  event: string
  [key: string]: unknown
}

export function parseSseRecord(record: string): SseEvent | null {
  const dataLine = record.split("\n").find((line) => line.startsWith("data:"))
  if (!dataLine) return null
  try {
    return JSON.parse(dataLine.slice(dataLine.indexOf(":") + 1).trim()) as SseEvent
  } catch {
    return null
  }
}

/** Streams a POST response formatted as Server-Sent Events, calling `onEvent`
 * for each parsed record as it arrives. Uses axios's onDownloadProgress (which
 * exposes the underlying XHR's progressively-filled responseText) since the
 * browser's native EventSource only supports GET requests. */
export async function streamSsePost(
  instance: AxiosInstance,
  url: string,
  body: unknown,
  onEvent: (event: SseEvent) => void
): Promise<void> {
  let processedLength = 0
  let buffer = ""

  await instance.post(url, body, {
    timeout: 0,
    responseType: "text",
    onDownloadProgress: (progressEvent) => {
      const xhr = (progressEvent.event?.target ?? null) as XMLHttpRequest | null
      const fullText = xhr?.responseText ?? ""
      buffer += fullText.slice(processedLength)
      processedLength = fullText.length

      const records = buffer.split("\n\n")
      buffer = records.pop() ?? ""

      for (const record of records) {
        const parsed = parseSseRecord(record)
        if (parsed) onEvent(parsed)
      }
    },
  })
}
