"use client";

import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { SignInButton } from "./sign-in-button";
import { UserDropdown } from "./user-dropdown";

export const Nav = () => {
  const session = authClient.useSession();
  const isLoggedIn = !!session?.data;

  return (
    <nav className="app-container flex h-16 items-center justify-between">
      <Link href="/">
        <div className="text-lg font-bold">Zap Quiz</div>
      </Link>
      <div className="flex items-center gap-2">
        {isLoggedIn ? <UserDropdown /> : <SignInButton />}
        <ModeToggle />
      </div>
    </nav>
  );
};
