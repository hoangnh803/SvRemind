"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import {
  LayoutDashboard,
  Users,
  Shield,
  Mail,
  FileText,
  ArrowLeftRight,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "User Management", href: "/user-management", adminOnly: true, icon: Users },
  { name: "Role Management", href: "/role-management", adminOnly: true, icon: Shield },
  { name: "Send email", href: "/send-email", icon: Mail },
  { name: "Email Templates", href: "/email-templates", icon: FileText },
  { name: "Transaction", href: "/transactions", icon: ArrowLeftRight },
];

export default function SidebarComponent() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setRole(user.role);
    }
  }, []);

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <span className="text-base font-semibold">SV Remind.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => !item.adminOnly || role === "Admin")
                .map((item) => (
                  <SidebarMenuItem
                    key={item.name}
                    className={pathname === item.href ? "bg-muted" : ""}
                  >
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.href}
                        className="flex items-center w-full h-full gap-2"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />

    </Sidebar>
  );
}
