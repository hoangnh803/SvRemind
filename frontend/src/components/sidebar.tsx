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
const menuItems = [
  { name: "Dashboard", href: "/" },
  { name: "User Management", href: "/user-management", adminOnly: true },
  { name: "Role Management", href: "/role-management", adminOnly: true },
  { name: "Send email", href: "/send-email" },
  { name: "Email Templates", href: "/email-templates" },
  { name: "Transaction", href: "/transactions" },
  { name: "About us", href: "/about" },
];

export default function SidebarComponent() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setRole(user.role);
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
                        className="flex items-center w-full h-full"
                      >
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
