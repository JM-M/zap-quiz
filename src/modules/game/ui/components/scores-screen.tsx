// TODO: Improve this screen

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  GameGetGamePlayers,
  GameGetGamePlayersScores,
  GameGetOneByCode,
} from "../../types";
import { AnimatedPlayerRank } from "./animated-player-rank";

interface ScoresScreenProps {
  game: GameGetOneByCode;
  players: GameGetGamePlayers;
  playersScores: GameGetGamePlayersScores;
  refetchPlayersScores: () => void;
}

export const ScoresScreen = ({
  game,
  players,
  playersScores,
  refetchPlayersScores,
}: ScoresScreenProps) => {
  const initialScoresRef = useRef<GameGetGamePlayersScores>(playersScores);

  useEffect(() => {
    console.log("refetching players scores for final scores");
    refetchPlayersScores();
  }, [refetchPlayersScores]);

  const { title } = game;

  // Sort players by score (highest first) for final leaderboard display
  const sortedPlayers = [...playersScores].sort(
    (a, b) => b.totalScore - a.totalScore,
  );

  return (
    <div className="app-container flex flex-1 flex-col">
      <div className="mb-6 text-center">
        <h1 className="mb-2 text-2xl font-bold text-green-600">
          Game Complete!
        </h1>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">Final Scores</p>
      </div>

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
    </div>
  );
};
