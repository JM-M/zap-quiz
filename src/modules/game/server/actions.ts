"use server";

// TODO: Remove this file

import { db } from "@/db";
import { games, players } from "@/db/schema";
import { eq } from "drizzle-orm";

/*
 * Get a game by code
 * @param code - The code of the game
 * @returns The game
 */
export const getGame = async (code: string) => {
  const game = (
    await db.select().from(games).where(eq(games.code, code)).limit(1)
  )[0];
  return game;
};

export const getGamePlayers = async (gameId: string) => {
  return await db.select().from(players).where(eq(players.gameId, gameId));
};
