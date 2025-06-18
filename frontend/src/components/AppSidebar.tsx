
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Home, ClipboardList, BookOpen, Heart, Calendar as CalendarIcon, Bot, Package, FileText } from "lucide-react";

const menuItems = [
  { to: "/", label: "首頁", icon: Home },
  { to: "/planning", label: "流程規劃", icon: ClipboardList },
  { to: "/lunar-calendar", label: "農民曆查詢", icon: BookOpen },
  { to: "/ritual-calendar", label: "祭祀日曆", icon: Heart },
  { to: "/urn-simulator", label: "骨灰罈模擬", icon: Package },
  { to: "/obituary-writer", label: "訃聞撰寫", icon: FileText },
  { to: "/chatbot", label: "智能問答", icon: Bot },
];

const AppSidebar = () => {
  return (
    <Sidebar className="hidden md:flex" collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="p-4 flex flex-row items-center group-data-[state=expanded]:justify-between group-data-[state=collapsed]:justify-center">
          <div className="flex items-center gap-2 group-data-[state=collapsed]:hidden">
            <CalendarIcon className="w-8 h-8 text-vi-primary" />
            <h1 className="text-xl font-bold text-foreground">靈魂日曆</h1>
          </div>
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <NavLink to={item.to} end>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
