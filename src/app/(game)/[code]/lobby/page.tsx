import { requireAuth } from "@/lib/auth/utils";
import { LobbyView } from "@/modules/game/ui/views/lobby-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

const LobbyPage = async ({ params }: { params: Promise<{ code: string }> }) => {
  const { code } = await params;
  await requireAuth({
    returnUrl: `/${code}/lobby`,
  });

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.game.findOneByCode.queryOptions({ code }),
  );

  const game = await queryClient.fetchQuery(
    trpc.game.findOneByCode.queryOptions({ code }),
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
