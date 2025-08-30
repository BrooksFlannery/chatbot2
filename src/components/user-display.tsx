'use client'

import { useUser } from "@clerk/nextjs";
import { User } from "lucide-react";

export function UserDisplay() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Display name if available, otherwise email
  const displayName = user.fullName || user.primaryEmailAddress?.emailAddress || 'User';

  return (
    <div className="flex items-center gap-2 text-sm">
      <User className="h-4 w-4" />
      <span className="font-medium">{displayName}</span>
    </div>
  );
}
