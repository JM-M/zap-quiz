import { authClient } from "@/lib/auth/auth-client";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const UserDropdown = () => {
  const session = authClient.useSession();

  if (!session?.data) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <UserIcon className="h-4 w-4" strokeWidth={1.2} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => authClient.signOut()}>
          <LogOutIcon className="h-4 w-4" strokeWidth={1.2} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
