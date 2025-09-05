"use client";

import { COUNTDOWN_TIME_SECS } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useGamePlay } from "../../hooks/use-game-play";
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

  // Use synchronized countdown
  const { countdown, startCountdown, isConnected } = useGamePlay({
    gameId: game.id,
  });
  const countdownStartedRef = useRef(false);

  // Start countdown when component mounts and we're on countdown screen
  useEffect(() => {
    if (
      screen === "countdown" &&
      isConnected &&
      !countdown.isActive &&
      !countdownStartedRef.current
    ) {
      startCountdown(COUNTDOWN_TIME_SECS); // TODO: Extract to a constant
      countdownStartedRef.current = true;
    }
  }, [screen, isConnected, countdown.isActive, startCountdown]);

  // Handle countdown completion
  useEffect(() => {
    if (
      countdown.currentNumber === 0 &&
      countdown.isActive === false &&
      screen === "countdown"
    ) {
      setScreen("quiz");
    }
  }, [countdown.currentNumber, countdown.isActive, screen]);

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
          currentNumber={countdown.currentNumber}
          countTo={0}
          onFinished={() => {
            setScreen("quiz");
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
