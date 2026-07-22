"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function ChatShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="max-h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-h-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}