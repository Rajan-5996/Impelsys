import { Fragment } from "react"
import { Link } from "react-router-dom"
import { ChevronRightIcon } from "lucide-react"

export type BreadcrumbTrailItem = {
  label: string
  path?: string
}

type BreadcrumbsProps = {
  trail: BreadcrumbTrailItem[]
}

export function Breadcrumbs({ trail }: BreadcrumbsProps) {
  return (
    <nav className="flex min-w-0 items-center gap-1.5 overflow-hidden text-[11.5px] whitespace-nowrap text-muted-foreground">
      {trail.map((item, index) => {
        const isLast = index === trail.length - 1
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <ChevronRightIcon className="size-3 shrink-0 text-border" />
            ) : null}
            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="font-semibold text-muted-foreground hover:text-primary"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "font-bold text-foreground" : undefined}
              >
                {item.label}
              </span>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}
