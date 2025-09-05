import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type GameGetOneByCode =
  inferRouterOutputs<AppRouter>["game"]["getGameByCode"];

export type GameGetGameQuestions =
  inferRouterOutputs<AppRouter>["game"]["getGameQuestions"];

export type GameGetGamePlayers =
  inferRouterOutputs<AppRouter>["game"]["getGamePlayers"];

export type GameGetGamePlayersScores =
  inferRouterOutputs<AppRouter>["game"]["getGamePlayersScores"];

export type GameGetCurrentPlayer =
  inferRouterOutputs<AppRouter>["game"]["getCurrentPlayer"];
