// src/app/layout.tsx
import type { Metadata } from "next";
import "../globals.css";
import Sidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Hệ thống nhắc hẹn SV",
  description: "Ứng dụng gửi thông báo cho sinh viên HUST",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="flex flex-col min-h-screen">
        <SidebarProvider>
          <Sidebar />
          <main className=" flex-1 p-6">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
