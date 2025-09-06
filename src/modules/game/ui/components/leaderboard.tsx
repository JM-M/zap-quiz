import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  GameGetGamePlayers,
  GameGetGamePlayersScores,
  GameGetGameQuestions,
  GameGetOneByCode,
} from "../../types";
import { AnimatedPlayerRank } from "./animated-player-rank";

interface LeaderboardProps {
  game: GameGetOneByCode;
  players: GameGetGamePlayers;
  playersScores: GameGetGamePlayersScores;
  refetchPlayersScores: () => void;
  questions: GameGetGameQuestions;
  currentQuestionIndex: number;
  updateGameState: (
    screen: "countdown" | "quiz" | "leaderboard" | "scores",
    questionIndex: number,
  ) => void;
  notifyGameCompleted: (gameId: string, gameCode: string) => void;
}

export const Leaderboard = ({
  game,
  players,
  playersScores,
  refetchPlayersScores,
  questions,
  currentQuestionIndex,
  updateGameState,
  notifyGameCompleted,
}: LeaderboardProps) => {
  const initialScoresRef = useRef<GameGetGamePlayersScores>(playersScores);

  useEffect(() => {
    console.log("refetching players scores");
    refetchPlayersScores();
  }, [refetchPlayersScores]);

  useEffect(() => {
    console.log("playersScores: ", playersScores);
    console.log("initialScoresRef: ", initialScoresRef.current);
  }, [playersScores]);

  // Auto-progress to next question after 8 seconds
  useEffect(() => {
    const isLastQuestion = currentQuestionIndex >= questions.length - 1;

    if (isLastQuestion) {
      console.log("This is the last question, not progressing automatically");
      console.log("Broadcasting game completion event");
      notifyGameCompleted(game.id, game.code);
      return;
    }

    console.log(
      `Auto-progressing to next question in 8 seconds. Current: ${currentQuestionIndex}, Total: ${questions.length}`,
    );

    const timer = setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      console.log(`Moving to question ${nextQuestionIndex}`);
      updateGameState("quiz", nextQuestionIndex);
    }, 8000); // 8 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [
    currentQuestionIndex,
    questions.length,
    updateGameState,
    notifyGameCompleted,
    game.id,
    game.code,
  ]);

  const { title } = game;

  // Sort players by score (highest first) for proper leaderboard display
  const sortedPlayers = [...playersScores].sort(
    (a, b) => b.totalScore - a.totalScore,
  );

  return (
    <>
      <h2 className="text-center font-semibold">{title}</h2>
      <div className="space-y-3 py-5">
        <AnimatePresence mode="popLayout">
          {sortedPlayers.map((playerScore, index) => {
            const initialScore =
              initialScoresRef.current.find(
                (p) => p.playerId === playerScore.playerId,
              )?.totalScore || 0;
            const hasScoreChanged = initialScore !== playerScore.totalScore;

            const player = players.find((p) => p.id === playerScore.playerId);

            return (
              <AnimatedPlayerRank
                key={playerScore.playerId}
                playerScore={playerScore}
                player={player}
                index={index}
                initialScore={initialScore}
                hasScoreChanged={hasScoreChanged}
              />
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
};
