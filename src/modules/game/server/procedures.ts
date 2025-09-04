import { db } from "@/db";
import { games, players as playersTable } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { eq } from "drizzle-orm";
import z from "zod";

export const gameRouter = createTRPCRouter({
  findOne: baseProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const game = (
        await db.select().from(games).where(eq(games.id, input.id))
      )[0];
      return game;
    }),
  findOneByCode: baseProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const game = (
        await db.select().from(games).where(eq(games.code, input.code))
      )[0];
      return game;
    }),
  getGamePlayers: baseProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const players = await db
        .select()
        .from(playersTable)
        .where(eq(playersTable.gameId, input.gameId));
      return players;
    }),
});
