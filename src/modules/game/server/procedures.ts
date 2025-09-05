// TODO: Remove procedures that are handled by websocket

import { db } from "@/db";
import {
  games as gamesTable,
  playerAnswers as playerAnswersTable,
  playerScores as playerScoresTable,
  players as playersTable,
  questionOptions as questionOptionsTable,
  questions as questionsTable,
} from "@/db/schema";
import { user as userTable } from "@/db/schema/auth";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq, InferSelectModel } from "drizzle-orm";
import z from "zod";

export const gameRouter = createTRPCRouter({
  getGame: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const [game] = await db
        .select()
        .from(gamesTable)
        .where(eq(gamesTable.id, input.id));

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      return game;
    }),
  getGameByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const [game] = await db
        .select()
        .from(gamesTable)
        .where(eq(gamesTable.code, input.code));

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      return game;
    }),
  getGamePlayers: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const players = await db
        .select()
        .from(playersTable)
        .where(eq(playersTable.gameId, input.gameId));

      return players;
    }),
  getCurrentPlayer: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const [player] = await db
        .select()
        .from(playersTable)
        .where(
          and(
            eq(playersTable.userId, userId),
            eq(playersTable.gameId, input.gameId),
          ),
        );

      if (!player) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Player not found",
        });
      }

      return player;
    }),
  getGameQuestions: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const results = await db
        .select({
          question: questionsTable,
          option: questionOptionsTable,
        })
        .from(questionsTable)
        .leftJoin(
          questionOptionsTable,
          eq(questionsTable.id, questionOptionsTable.questionId),
        )
        .where(eq(questionsTable.gameId, input.gameId))
        .orderBy(questionsTable.order, questionOptionsTable.order);

      // Group results by question
      const questionsMap = new Map();

      for (const row of results) {
        const questionId = row.question.id;

        if (!questionsMap.has(questionId)) {
          questionsMap.set(questionId, {
            ...row.question,
            options: [],
          });
        }

        // Add option if it exists (left join might return null)
        if (row.option) {
          questionsMap.get(questionId).options.push(row.option);
        }
      }

      const questions = Array.from(questionsMap.values()) as (InferSelectModel<
        typeof questionsTable
      > & {
        options: InferSelectModel<typeof questionOptionsTable>[];
      })[];

      return questions;
    }),
  savePlayerAnswer: protectedProcedure
    .input(
      z.object({
        playerId: z.string(),
        questionId: z.string(),
        optionId: z.string(),
        timeToAnswer: z.number(), // milliseconds
      }),
    )
    .mutation(async ({ input }) => {
      // Get the question to check if the answer is correct and get points
      const [question] = await db
        .select({
          id: questionsTable.id,
          gameId: questionsTable.gameId,
          points: questionsTable.points,
        })
        .from(questionsTable)
        .where(eq(questionsTable.id, input.questionId))
        .limit(1);

      if (!question) {
        throw new Error("Question not found");
      }

      // Get the selected option to check if it's correct
      const [selectedOption] = await db
        .select({
          id: questionOptionsTable.id,
          isCorrect: questionOptionsTable.isCorrect,
        })
        .from(questionOptionsTable)
        .where(eq(questionOptionsTable.id, input.optionId))
        .limit(1);

      if (!selectedOption) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Option not found",
        });
      }

      const isCorrect = selectedOption.isCorrect;
      const points = isCorrect ? question.points : 0;

      // Save the player answer
      await db.insert(playerAnswersTable).values({
        playerId: input.playerId,
        questionId: input.questionId,
        optionId: input.optionId,
        timeToAnswer: input.timeToAnswer,
        isCorrect,
      });

      // Get current player score
      const [currentScore] = await db
        .select()
        .from(playerScoresTable)
        .where(eq(playerScoresTable.playerId, input.playerId))
        .limit(1);

      if (currentScore) {
        // Update existing score
        const newTotalScore = currentScore.totalScore + points;
        const newQuestionsAnswered = currentScore.questionsAnswered + 1;
        const newCorrectAnswers =
          currentScore.correctAnswers + (isCorrect ? 1 : 0);

        // Calculate new average response time
        const totalTime =
          currentScore.averageResponseTime * currentScore.questionsAnswered +
          input.timeToAnswer;
        const newAverageResponseTime = Math.round(
          totalTime / newQuestionsAnswered,
        );

        await db
          .update(playerScoresTable)
          .set({
            totalScore: newTotalScore,
            questionsAnswered: newQuestionsAnswered,
            correctAnswers: newCorrectAnswers,
            averageResponseTime: newAverageResponseTime,
            updatedAt: new Date(),
          })
          .where(eq(playerScoresTable.playerId, input.playerId));
      } else {
        // Create new score record
        await db.insert(playerScoresTable).values({
          playerId: input.playerId,
          gameId: question.gameId,
          totalScore: points,
          questionsAnswered: 1,
          correctAnswers: isCorrect ? 1 : 0,
          averageResponseTime: input.timeToAnswer,
          rank: 1, // Will be updated when all players' scores are recalculated
        });
      }

      return { success: true, isCorrect, points };
    }),
  getGamePlayersScores: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input }) => {
      const scores = await db
        .select()
        .from(playerScoresTable)
        .where(eq(playerScoresTable.gameId, input.gameId));
      return scores;
    }),
  joinGame: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1, "Game code is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, userId));

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Find the game by code
      const [game] = await db
        .select()
        .from(gamesTable)
        .where(eq(gamesTable.code, input.code));

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found with this code",
        });
      }

      // Check if game is in a joinable state
      if (game.status !== "waiting") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot join game. Game status is: ${game.status}`,
        });
      }

      let player;

      // Check if user is already a player in this game
      const [existingPlayer] = await db
        .select()
        .from(playersTable)
        .where(
          and(
            eq(playersTable.gameId, game.id),
            eq(playersTable.userId, userId),
          ),
        );

      if (existingPlayer) {
        player = existingPlayer;
      } else {
        // Create the player
        const [newPlayer] = await db
          .insert(playersTable)
          .values({
            gameId: game.id,
            name: user.name,
            userId: userId,
            isHost: false,
            isActive: true,
          })
          .returning();
        player = newPlayer;
      }

      // // Check if user is already a player in any active game
      // const [activePlayer] = await db
      //   .select()
      //   .from(playersTable)
      //   .where(
      //     and(eq(playersTable.userId, userId), eq(playersTable.isActive, true)),
      //   );

      // if (activePlayer) {
      //   throw new TRPCError({
      //     code: "CONFLICT",
      //     message: "You are already in an active game",
      //   });
      // }

      // Create initial player score
      await db.insert(playerScoresTable).values({
        playerId: player.id,
        gameId: game.id,
        totalScore: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        rank: 1,
      });

      return {
        success: true,
        player,
        game,
      };
    }),
  createGame: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Game title is required"),
        settings: z
          .object({
            timeLimit: z.number().optional(),
            allowLateJoins: z.boolean().optional(),
            showCorrectAnswers: z.boolean().optional(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      // Check if user is already a host of an active game
      const [activeHostGame] = await db
        .select()
        .from(gamesTable)
        .where(
          and(eq(gamesTable.hostId, userId), eq(gamesTable.status, "waiting")),
        );

      if (activeHostGame) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have an active game waiting for players",
        });
      }

      // Generate a unique game code
      const generateGameCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let result = "";
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      let gameCode: string;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        gameCode = generateGameCode();
        const [existingGame] = await db
          .select()
          .from(gamesTable)
          .where(eq(gamesTable.code, gameCode));

        if (!existingGame) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate unique game code",
        });
      }

      // Create the game
      const [newGame] = await db
        .insert(gamesTable)
        .values({
          code: gameCode,
          title: input.title,
          status: "waiting",
          hostId: userId,
          settings: input.settings || {
            timeLimit: 30,
            allowLateJoins: true,
            showCorrectAnswers: true,
          },
        })
        .returning();

      // Create the host as a player
      const [hostPlayer] = await db
        .insert(playersTable)
        .values({
          gameId: newGame.id,
          name: ctx.auth.user.name || "Host",
          userId: userId,
          isHost: true,
          isActive: true,
        })
        .returning();

      // Create initial host score
      await db.insert(playerScoresTable).values({
        playerId: hostPlayer.id,
        gameId: newGame.id,
        totalScore: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        averageResponseTime: 0,
        rank: 1,
      });

      return {
        success: true,
        game: newGame,
        player: hostPlayer,
      };
    }),
  // In procedures.ts
  isPlayerInGame: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.auth.user.id;

      // First get the game by code
      const [game] = await db
        .select({ id: gamesTable.id })
        .from(gamesTable)
        .where(eq(gamesTable.code, input.code));

      if (!game) {
        return false;
      }

      // Then check if user is a player in that game
      const [player] = await db
        .select()
        .from(playersTable)
        .where(
          and(
            eq(playersTable.gameId, game.id),
            eq(playersTable.userId, userId),
          ),
        );

      return !!player;
    }),
});
