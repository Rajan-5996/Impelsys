import { useEffect, useState } from "react"
import { BotIcon, XIcon } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { AskAgentMessage } from "@/components/ask-agent/ask-agent-message"
import { pathForScreenLink } from "@/constants/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  askQuestion,
  fetchAskSuggestions,
  selectAskAnswerStatus,
  selectAskSuggestions,
} from "@/store/ask-slice"
import { closeAsk, selectAsk, sendAskMessage } from "@/store/ui-slice"

let messageCounter = 0

const SCREEN_LABEL: Record<string, string> = {
  supplier: "Open supplier",
  dataset: "Open dataset",
  scorecard: "Open scorecard",
}

export function AskAgentPanel() {
  const dispatch = useAppDispatch()
  const ask = useAppSelector(selectAsk)
  const suggestions = useAppSelector(selectAskSuggestions)
  const answerStatus = useAppSelector(selectAskAnswerStatus)
  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (ask.open) dispatch(fetchAskSuggestions())
  }, [dispatch, ask.open])

  if (!ask.open) return null

  async function ask_(question: string) {
    const trimmed = question.trim()
    if (!trimmed) return
    setDraft("")
    dispatch(
      sendAskMessage([{ id: `ask-${messageCounter++}`, role: "user", text: trimmed }])
    )
    try {
      const response = await dispatch(askQuestion(trimmed)).unwrap()
      dispatch(
        sendAskMessage([
          {
            id: `ask-${messageCounter++}`,
            role: "agent",
            text: response.answer,
            link: response.link
              ? {
                  label: SCREEN_LABEL[response.link.screen] ?? "Open",
                  path: pathForScreenLink(response.link.screen, response.link.id),
                }
              : undefined,
          },
        ])
      )
    } catch {
      dispatch(
        sendAskMessage([
          {
            id: `ask-${messageCounter++}`,
            role: "agent",
            text: "Sorry, I couldn't reach the DataOps agent just now.",
          },
        ])
      )
    }
  }

  return (
    <div className="fixed top-16 right-3.5 z-[181] flex max-h-[64vh] w-95 flex-col overflow-hidden border border-border bg-card shadow-lg">
      <div className="flex items-center justify-between bg-foreground px-3.5 py-2.5 text-background">
        <span className="flex items-center gap-2 text-[12.5px] font-bold">
          <BotIcon className="size-3.5" /> Ask DataOps Agent
        </span>
        <button type="button" onClick={() => dispatch(closeAsk())}>
          <XIcon className="size-3.5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-3">
        {ask.messages.map((message) => (
          <AskAgentMessage key={message.id} message={message} />
        ))}
        {answerStatus === "loading" ? (
          <div className="h-8 w-24 animate-pulse self-start rounded-md bg-muted/40" />
        ) : null}
      </div>
      {ask.messages.length <= 1 ? (
        <div className="flex flex-col gap-1.5 px-3.5 pb-2.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => ask_(suggestion)}
              className="border border-border bg-muted/30 px-2.5 py-1.5 text-left text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex gap-1.5 border-t border-border p-2.5">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") ask_(draft)
          }}
          placeholder="Ask a question..."
          className="border-b-0"
        />
        <Button size="sm" onClick={() => ask_(draft)}>
          Send
        </Button>
      </div>
    </div>
  )
}
