import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { useJoinGame } from "@/modules/game/hooks/use-join-game";
import { KeyboardIcon, ShapesIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const Hero = () => {
  const [code, setCode] = useState("");
  const session = authClient.useSession();
  const isLoggedIn = !!session?.data;
  const router = useRouter();

  const { joinGameMutation } = useJoinGame();

  return (
    <header className="app-container flex flex-col items-center justify-center space-y-10 py-20">
      <div className="space-y-5 text-center">
        <h1 className="text-4xl font-bold">Spark the Fun with Zap Quiz</h1>
        <p className="text-lg">
          Turn learning, meetings, and events into high-energy quiz games that
          everyone loves.
        </p>
      </div>
      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row">
        <Button
          className="flex h-12 w-full rounded-full !px-5 sm:w-fit"
          asChild
        >
          <Link href="/new">
            <ShapesIcon />
            Create a quiz
          </Link>
        </Button>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="relative flex h-fit w-fit items-center gap-2"
        >
          <KeyboardIcon className="text-muted-foreground absolute top-1/2 left-3 size-5 -translate-y-1/2" />
          <Input
            placeholder="Enter code or link"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-12 rounded-full pr-16 pl-10"
          />
          <Button
            type="submit"
            variant="ghost"
            className="absolute top-1/2 right-0 h-12 w-16 -translate-y-1/2 rounded-full font-medium"
            onClick={() => {
              if (!isLoggedIn) {
                router.push(
                  `/sign-in?returnUrl=${encodeURIComponent(`/${code}/join`)}`,
                );
                return;
              }
              joinGameMutation.mutate({ code });
            }}
            disabled={!code || joinGameMutation.isPending}
          >
            {joinGameMutation.isPending ? <Spinner /> : "Join"}
          </Button>
        </form>
      </div>
    </header>
  );
};
