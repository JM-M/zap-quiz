import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useJoinGame = () => {
  const router = useRouter();

  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const joinGameMutation = useMutation(
    trpc.game.joinGame.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(
          trpc.game.getGameByCode.queryKey({ code: data.game.code }),
          data.game,
        );
        queryClient.setQueryData(
          trpc.game.getCurrentPlayer.queryKey({
            gameId: data.game.id,
          }),
          data.player,
        );
        router.push(`/${data.game.code}/lobby`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  return { joinGameMutation };
};
