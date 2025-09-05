import { requireAuth } from "@/lib/auth/utils";
import { LobbyView } from "@/modules/game/ui/views/lobby-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const LobbyPage = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  await requireAuth({
    returnUrl: `/${code}/lobby`,
  });

  const queryClient = getQueryClient();

  const game = await queryClient.fetchQuery(
    trpc.game.getGameByCode.queryOptions({ code }),
  );

  const currentPlayer = await queryClient.fetchQuery(
    trpc.game.getCurrentPlayer.queryOptions({ gameId: game.id }),
  );

  if (!currentPlayer) {
    redirect(`/${code}/join`);
  }

  void queryClient.prefetchQuery(
    trpc.game.getGameByCode.queryOptions({ code }),
  );

  void queryClient.prefetchQuery(
    trpc.game.getGamePlayers.queryOptions({ gameId: game.id }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <LobbyView />
      </Suspense>
    </HydrationBoundary>
  );
};
export default LobbyPage;
