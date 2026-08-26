import * as React from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface PageBreadcrumbProps {
  items: BreadcrumbItemProps[]
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs text-[#aaa9be] sm:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="font-semibold text-[#e7e6fc]">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href} className="hover:text-fuchsia-400 transition-colors">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="[&>svg]:w-3 [&>svg]:h-3" />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
