import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import React from "react";

type BreadcrumbItemType = {
  label: string;
  href?: string;
  isCurrent?: boolean;
  className?: string;
};

interface BreadcrumbNavigationProps {
  items: BreadcrumbItemType[];
}

export function BreadcrumbNavigation({ items }: BreadcrumbNavigationProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {items.map((item, idx) => (
              <React.Fragment key={item.label + idx}>
                <BreadcrumbItem className={item.className}>
                  {item.isCurrent ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={item.href || "#"}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {idx < items.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
