import { ReactNode } from "react"
import { clsx } from "clsx"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={clsx(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </header>
  )
}

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main
      className={clsx(
        "mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 2xl:px-10",
        className
      )}
    >
      {children}
    </main>
  )
}