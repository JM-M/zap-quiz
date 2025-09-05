import { db } from "@/db";
import {
  games as gamesTable,
  playerAnswers as playerAnswersTable,
  playerScores as playerScoresTable,
  players as playersTable,
  questionOptions as questionOptionsTable,
  questions as questionsTable,
} from "@/db/schema";
import { getSession } from "@/lib/auth/utils";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, InferSelectModel } from "drizzle-orm";
import z from "zod";

export const gameRouter = createTRPCRouter({
  findOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const game = (
        await db.select().from(gamesTable).where(eq(gamesTable.id, input.id))
      )[0];

      if (!game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      return game;
    }),
  findOneByCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const game = (
        await db
          .select()
          .from(gamesTable)
          .where(eq(gamesTable.code, input.code))
      )[0];

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
  getCurrentPlayer: protectedProcedure.query(async ({ input }) => {
    const session = await getSession();
    const userId = session?.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Unauthorized",
      });
    }

    const player = (
      await db
        .select()
        .from(playersTable)
        .where(eq(playersTable.userId, userId))
    )[0];

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
      const question = await db
        .select({
          id: questionsTable.id,
          gameId: questionsTable.gameId,
          points: questionsTable.points,
        })
        .from(questionsTable)
        .where(eq(questionsTable.id, input.questionId))
        .limit(1);

      if (!question[0]) {
        throw new Error("Question not found");
      }

      // Get the selected option to check if it's correct
      const selectedOption = await db
        .select({
          id: questionOptionsTable.id,
          isCorrect: questionOptionsTable.isCorrect,
        })
        .from(questionOptionsTable)
        .where(eq(questionOptionsTable.id, input.optionId))
        .limit(1);

      if (!selectedOption[0]) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Option not found",
        });
      }

      const isCorrect = selectedOption[0].isCorrect;
      const points = isCorrect ? question[0].points : 0;

      // Save the player answer
      await db.insert(playerAnswersTable).values({
        playerId: input.playerId,
        questionId: input.questionId,
        optionId: input.optionId,
        timeToAnswer: input.timeToAnswer,
        isCorrect,
      });

      // Get current player score
      const currentScore = await db
        .select()
        .from(playerScoresTable)
        .where(eq(playerScoresTable.playerId, input.playerId))
        .limit(1);

      if (currentScore[0]) {
        // Update existing score
        const newTotalScore = currentScore[0].totalScore + points;
        const newQuestionsAnswered = currentScore[0].questionsAnswered + 1;
        const newCorrectAnswers =
          currentScore[0].correctAnswers + (isCorrect ? 1 : 0);

        // Calculate new average response time
        const totalTime =
          currentScore[0].averageResponseTime *
            currentScore[0].questionsAnswered +
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
          gameId: question[0].gameId,
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
});
