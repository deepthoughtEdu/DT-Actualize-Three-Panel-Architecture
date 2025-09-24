// components/ui/LogoutButton.tsx
"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  function handleLogout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Logout
    </Button>
  );
}
