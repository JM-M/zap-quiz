import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export const Nav = () => {
  return (
    <nav className="app-container flex h-16 items-center justify-between">
      <Link href="/">
        <div className="text-lg font-bold">Zap Quiz</div>
      </Link>
      <ModeToggle />
    </nav>
  );
};
