const MOJO_AGENT_URL = "http://mojo.internal.gwcdata.ai/"

export function MojoAgentFrame() {
  return (
    <iframe
      src={MOJO_AGENT_URL}
      title="Data Analyst Agent"
      className="size-full rounded-lg border-0"
      allow="clipboard-read; clipboard-write"
    />
  )
}
