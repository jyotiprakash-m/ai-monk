import { AppSidebar } from "@/components/modern-layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  const items = [
    { name: "Design Engineering", url: "#", icon: "Frame" },
    { name: "Dashboard", url: "/email-classification", icon: "Frame" },
    {
      name: "Upload Knowledge",
      url: "/email-classification/upload",
      icon: "PieChart",
    },
    {
      name: "View Database",
      url: "/email-classification/database",
      icon: "Map",
    },
  ];
  const user: { name: string; email: string; avatar: string } = {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    avatar: "https://via.placeholder.com/150",
  };
  //   const teams = [
  //     { name: "Team Alpha", logo: Frame, plan: "Pro" },
  //     { name: "Team Beta", logo: PieChart, plan: "Basic" },
  //   ];
  return (
    <SidebarProvider>
      <AppSidebar items={items} user={user} />
      <SidebarInset className="overflow-auto">
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
