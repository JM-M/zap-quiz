"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { useLobby } from "@/modules/game/hooks/use-lobby";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShapesIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export const LobbyView = () => {
  const { code } = useParams<{ code: string }>();
  const session = authClient.useSession();
  const user = session.data?.user;
  const userId = user?.id;

  const router = useRouter();

  const trpc = useTRPC();
  const { data: game } = useSuspenseQuery(
    trpc.game.getGameByCode.queryOptions({ code }),
  );

  const { players, isLoading, error, leaveLobby, startGame } = useLobby({
    gameCode: code,
    playerName: user?.name || "Anonymous Player",
    userId,
  });

  const isHost = game && user ? game?.hostId === user?.id : false;
  const { title } = game;

  if (isLoading) {
    return (
      <div className="app-container flex flex-1 flex-col items-center justify-center gap-4 py-10">
        <Spinner className="size-6" />
        <p className="text-muted-foreground">Joining lobby...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="app-container flex flex-1 flex-col items-center justify-center gap-4 py-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container flex flex-1 flex-col gap-10 py-10">
      <h2 className="text-center text-2xl font-semibold">{title}</h2>

      {/* Lobby Status */}
      <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
        <Spinner className="size-5" />
        <p>Waiting for players...</p>
      </div>

      {/* Players List */}
      <div className="grid grid-cols-2 gap-2">
        {players.map((p) => (
          <Card key={p.id} className="rounded-lg p-3">
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="max-w-[114px] truncate">{p.name}</span>
                {p.isHost && (
                  <span className="text-muted-foreground text-xs">(Host)</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Host Controls */}
      <div className="mt-auto flex items-center justify-center gap-4">
        <Button
          onClick={() => {
            leaveLobby();
            router.push("/");
          }}
          variant="outline"
          className="h-12 rounded-full !px-5"
        >
          Leave Lobby
        </Button>
        {isHost && (
          <Button onClick={startGame} className="h-12 rounded-full !px-5">
            <ShapesIcon />
            Start game
          </Button>
        )}
      </div>
    </div>
  );
};
