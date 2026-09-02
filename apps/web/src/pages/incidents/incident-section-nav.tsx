type IncidentSection = {
  id: string
  label: string
}

const SECTIONS: IncidentSection[] = [
  { id: "summary", label: "Summary" },
  { id: "investigation", label: "Investigation" },
  { id: "pipeline-context", label: "Pipeline Context" },
  { id: "historical-evidence", label: "Historical Evidence" },
  { id: "recommendation", label: "Agent Recommendation" },
  { id: "actions", label: "Actions" },
  { id: "audit-trail", label: "Audit Trail" },
]

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function IncidentSectionNav() {
  return (
    <nav className="sticky top-[100px] z-10 mb-4 flex gap-1 overflow-x-auto border-b border-border bg-background py-1">
      {SECTIONS.map((section) => (
        <button
          key={section.id}
          type="button"
          onClick={() => scrollToSection(section.id)}
          className="shrink-0 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap text-muted-foreground hover:text-primary"
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
