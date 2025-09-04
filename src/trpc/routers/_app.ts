import { gameRouter } from "@/modules/game/server/procedures";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  game: gameRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
