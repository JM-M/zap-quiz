"use client";

import { COUNTDOWN_TIME_SECS } from "@/constants";
import { useTRPC } from "@/trpc/client";
import { keepPreviousData, useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useGamePlay } from "../../hooks/use-game-play";
import { Countdown } from "../components/countdown";
import { Leaderboard } from "../components/leaderboard";
import { Quiz } from "../components/quiz";
import { ScoresScreen } from "../components/scores-screen";

export const PlayView = () => {
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

  // Use synchronized countdown and game state
  const {
    countdown,
    startCountdown,
    isConnected,
    screen,
    currentQuestionIndex,
    answeredCount,
    totalPlayers,
    notifyPlayerAnswered,
    updateGameState,
    notifyGameCompleted,
  } = useGamePlay({
    gameId: game.id,
  });

  const { data: playersScores, refetch: refetchPlayersScores } =
    useSuspenseQuery(
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

  const countdownStartedRef = useRef(false);

  // Start countdown when component mounts and we're on countdown screen
  useEffect(() => {
    if (
      screen === "countdown" &&
      isConnected &&
      !countdown.isActive &&
      !countdownStartedRef.current
    ) {
      startCountdown(COUNTDOWN_TIME_SECS);
      countdownStartedRef.current = true;
    }
  }, [screen, isConnected, countdown.isActive, startCountdown]);

  return (
    <div className="app-container flex flex-1 flex-col">
      {screen === "countdown" && (
        <Countdown
          currentNumber={countdown.currentNumber}
          countTo={0}
          // onFinished={() => {
          //   // Screen transition is handled server-side automatically
          // }}
        />
      )}
      {screen === "quiz" && (
        <Quiz
          game={game}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          currentPlayer={currentPlayer}
          answeredCount={answeredCount}
          totalPlayers={totalPlayers}
          notifyPlayerAnswered={notifyPlayerAnswered}
        />
      )}
      {screen === "leaderboard" && (
        <Leaderboard
          game={game}
          playersScores={playersScores}
          players={players}
          refetchPlayersScores={refetchPlayersScores}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          updateGameState={updateGameState}
          notifyGameCompleted={notifyGameCompleted}
        />
      )}
      {screen === "scores" && (
        <ScoresScreen
          game={game}
          playersScores={playersScores}
          players={players}
          refetchPlayersScores={refetchPlayersScores}
        />
      )}
    </div>
  );
};
