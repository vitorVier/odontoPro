export function AgendaSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-7 border-b">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-16 border-l bg-muted/20"
          />
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={index}
            className="h-28 border-b border-r bg-muted/5"
          />
        ))}
      </div>
    </div>
  )
}