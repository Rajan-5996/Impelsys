import { useNavigate } from "react-router-dom"

import { cn } from "@workspace/ui/lib/utils"

import { useAppDispatch } from "@/store/hooks"
import { closeAsk, type AskMessage } from "@/store/ui-slice"

export function AskAgentMessage({ message }: { message: AskMessage }) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "max-w-[92%] text-xs leading-relaxed",
        isUser ? "self-end" : "self-start"
      )}
    >
      <div
        className={cn(
          "px-3 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-muted/30 text-foreground"
        )}
      >
        {message.text}
      </div>
      {message.link ? (
        <button
          type="button"
          onClick={() => {
            dispatch(closeAsk())
            navigate(message.link!.path)
          }}
          className="mt-1.5 inline-flex bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/20"
        >
          {message.link.label}
        </button>
      ) : null}
    </div>
  )
}
