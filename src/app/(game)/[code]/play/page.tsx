import { requireAuth } from "@/lib/auth/utils";
import { PlayView } from "@/modules/game/ui/views/play-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const PlayPage = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  await requireAuth({
    returnUrl: `/${code}/lobby`,
  });

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.game.getGameByCode.queryOptions({ code }),
  );

  const game = await queryClient.fetchQuery(
    trpc.game.getGameByCode.queryOptions({ code }),
  );

  void queryClient.prefetchQuery(
    trpc.game.getGamePlayers.queryOptions({ gameId: game.id }),
  );

  void queryClient.prefetchQuery(
    trpc.game.getGameQuestions.queryOptions({ gameId: game.id }),
  );

  void queryClient.prefetchQuery(
    trpc.game.getGamePlayersScores.queryOptions({ gameId: game.id }),
  );

  void queryClient.prefetchQuery(
    trpc.game.getCurrentPlayer.queryOptions({ gameId: game.id }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <PlayView />
      </Suspense>
    </HydrationBoundary>
  );
};
export default PlayPage;
