import Link from "next/link";
import { Button } from "./ui/button";

export const SignInButton = () => {
  return (
    <Button className="rounded-full" asChild>
      <Link href="/sign-in">Sign in</Link>
    </Button>
  );
};
