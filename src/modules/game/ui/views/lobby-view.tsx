"use client";

import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShapesIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export const LobbyView = () => {
  const { code } = useParams<{ code: string }>();
  const session = authClient.useSession();
  const user = session.data?.user;

  const trpc = useTRPC();
  const { data: game } = useSuspenseQuery(
    trpc.game.findOneByCode.queryOptions({ code }),
  );
  const { data: players } = useSuspenseQuery(
    trpc.game.getGamePlayers.queryOptions({ gameId: game.id }),
  );
  const isHost = game && user ? game?.hostId === user?.id : false;

  const { title } = game;

  return (
    <div className="app-container flex flex-1 flex-col gap-10 py-10">
      <h2 className="text-center text-2xl font-semibold">{title}</h2>
      <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
        <Spinner className="size-5" /> <p>Starting soon...</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <Card key={player.id} className="rounded-lg p-3">
            <CardContent className="p-0">{player.name}</CardContent>
          </Card>
        ))}
      </div>
      {isHost && (
        <div className="mt-auto flex items-center justify-center">
          <Button className="h-12 rounded-full !px-5" asChild>
            <Link href={`/${code}/play`}>
              <ShapesIcon />
              Start game
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
