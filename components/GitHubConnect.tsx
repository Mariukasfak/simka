"use client";

import { Button } from "./ui/Button";
import { Github } from "lucide-react";

export default function GitHubConnect() {
  const handleConnect = async () => {
    window.location.href = "/api/auth/github";
  };

  return (
    <Button
      onClick={handleConnect}
      variant="outline"
      className="w-full"
      icon={Github}
    >
      Connect with GitHub
    </Button>
  );
}
