"use server";

import { db } from "@/db";
import { games } from "@/db/schema";
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
