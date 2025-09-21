"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/modern-layout/nav-main";
import { NavProjects } from "@/components/modern-layout/nav-projects";
import { NavUser } from "@/components/modern-layout/nav-user";
import { TeamSwitcher } from "@/components/modern-layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavSimple } from "./nav-simple";

// This is sample data.
// const data = {
//   user: {
//     name: "shadcn",
//     email: "m@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   teams: [
//     {
//       name: "Acme Inc",
//       logo: GalleryVerticalEnd,
//       plan: "Enterprise",
//     },
//     {
//       name: "Acme Corp.",
//       logo: AudioWaveform,
//       plan: "Startup",
//     },
//     {
//       name: "Evil Corp.",
//       logo: Command,
//       plan: "Free",
//     },
//   ],
//   collapseItems: [
//     {
//       title: "Playground",
//       url: "#",
//       icon: SquareTerminal,
//       isActive: true,
//       items: [
//         {
//           title: "History",
//           url: "#",
//         },
//         {
//           title: "Starred",
//           url: "#",
//         },
//         {
//           title: "Settings",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Models",
//       url: "#",
//       icon: Bot,
//       items: [
//         {
//           title: "Genesis",
//           url: "#",
//         },
//         {
//           title: "Explorer",
//           url: "#",
//         },
//         {
//           title: "Quantum",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Documentation",
//       url: "#",
//       icon: BookOpen,
//       items: [
//         {
//           title: "Introduction",
//           url: "#",
//         },
//         {
//           title: "Get Started",
//           url: "#",
//         },
//         {
//           title: "Tutorials",
//           url: "#",
//         },
//         {
//           title: "Changelog",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Settings",
//       url: "#",
//       icon: Settings2,
//       items: [
//         {
//           title: "General",
//           url: "#",
//         },
//         {
//           title: "Team",
//           url: "#",
//         },
//         {
//           title: "Billing",
//           url: "#",
//         },
//         {
//           title: "Limits",
//           url: "#",
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       name: "Design Engineering",
//       url: "#",
//       icon: Frame,
//     },
//     {
//       name: "Sales & Marketing",
//       url: "#",
//       icon: PieChart,
//     },
//     {
//       name: "Travel",
//       url: "#",
//       icon: Map,
//     },
//   ],
// };

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar: string;
  };
  teams?: Array<{
    name: string;
    logo: import("lucide-react").LucideIcon;
    plan: string;
  }>;
  collapseItems?: Array<{
    title: string;
    url: string;
    icon?: import("lucide-react").LucideIcon;
    isActive?: boolean;
    items?: Array<{
      title: string;
      url: string;
    }>;
  }>;
  projects?: Array<{
    name: string;
    url: string;
    icon: import("lucide-react").LucideIcon;
  }>;
  items?: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
}

export function AppSidebar(props: AppSidebarProps) {
  const { user, teams, collapseItems, projects, items, ...sidebarProps } =
    props;

  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      {teams && (
        <SidebarHeader>
          <TeamSwitcher teams={teams} />
        </SidebarHeader>
      )}
      <SidebarContent>
        {collapseItems && <NavMain items={collapseItems} />}
        {projects && <NavProjects projects={projects} />}
        {items && <NavSimple items={items} />}
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
