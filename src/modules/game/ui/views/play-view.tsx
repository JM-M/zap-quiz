"use client";

import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Countdown } from "../components/countdown";
import { Leaderboard } from "../components/leaderboard";
import { Quiz } from "../components/quiz";

export const PlayView = () => {
  const [screen, setScreen] = useState<"countdown" | "quiz" | "leaderboard">(
    "countdown",
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const { code } = useParams<{ code: string }>();

  const trpc = useTRPC();
  const { data: game } = useSuspenseQuery(
    trpc.game.getGameByCode.queryOptions({ code }),
  );

  const { data: questions } = useSuspenseQuery(
    trpc.game.getGameQuestions.queryOptions({ gameId: game.id }),
  );

  const { data: players } = useSuspenseQuery(
    trpc.game.getGamePlayers.queryOptions({ gameId: game.id }),
  );

  const { data: playersScores } = useSuspenseQuery(
    trpc.game.getGamePlayersScores.queryOptions(
      { gameId: game.id },
      {
        enabled: screen === "leaderboard",
        placeholderData: keepPreviousData,
      },
    ),
  );

  const { data: currentPlayer } = useSuspenseQuery(
    trpc.game.getCurrentPlayer.queryOptions({
      gameId: game.id,
    }),
  );

  const nextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      return;
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  return (
    <div className="app-container flex flex-1 flex-col">
      {screen === "countdown" && (
        <Countdown
          startFrom={5}
          countTo={0}
          onNumberReached={(number) => {
            if (number === 0) {
              setScreen("quiz");
            }
          }}
        />
      )}
      {screen === "quiz" && (
        <Quiz
          game={game}
          questions={questions}
          setScreen={setScreen}
          currentQuestionIndex={currentQuestionIndex}
          currentPlayer={currentPlayer}
        />
      )}
      {screen === "leaderboard" && (
        <Leaderboard
          game={game}
          players={players}
          nextQuestion={nextQuestion}
          playersScores={playersScores}
        />
      )}
    </div>
  );
};
