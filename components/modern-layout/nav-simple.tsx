"use client";

// We can only import icons we actually use to avoid bundling the entire icon set.
import { Frame, PieChart, Map, Code } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Project = {
  name: string;
  url: string;
  icon: string;
};

export function NavSimple({ items }: { items: Project[] }) {
  // Mapping of icon names to actual icon components
  const iconMap: Record<string, typeof Frame> = { Frame, PieChart, Map, Code };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Functionality</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-2">
                  {Icon ? <Icon /> : null}
                  <span>{item.name}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
