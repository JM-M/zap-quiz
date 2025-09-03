import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export const Nav = () => {
  return (
    <nav className="flex items-center justify-between">
      <Link href="/">
        <div className="text-lg font-bold">Zap Quiz</div>
      </Link>
      <ModeToggle />
    </nav>
  );
};
