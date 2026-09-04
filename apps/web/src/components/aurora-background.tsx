export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute top-[-12%] left-[-8%] size-[38rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          animation: "aurora-float 22s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-[20%] right-[-10%] size-[32rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
          animation: "aurora-float 26s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute bottom-[-16%] left-[28%] size-[34rem] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-standard) 0%, transparent 70%)",
          animation: "aurora-float 30s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--color-foreground), transparent 60%) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
    </div>
  )
}
