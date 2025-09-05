import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import {
  GameGetGamePlayers,
  GameGetGamePlayersScores,
  GameGetOneByCode,
} from "../../types";

interface LeaderboardProps {
  game: GameGetOneByCode;
  players: GameGetGamePlayers;
  playersScores: GameGetGamePlayersScores;
  nextQuestion: () => void;
}

export const Leaderboard = ({
  game,
  players,
  playersScores,
  nextQuestion,
}: LeaderboardProps) => {
  const initialScoresRef = useRef<GameGetGamePlayersScores>(playersScores);

  useEffect(() => {
    console.log(initialScoresRef.current, playersScores);
  }, [playersScores]);

  const { title } = game;

  return (
    <>
      <h2 className="text-center font-semibold">{title}</h2>
      <div className="space-y-3 py-5">
        {players.map((player) => (
          <Card key={player.name} className="gap-3 rounded-lg p-3">
            <CardContent className="flex items-center justify-between p-0">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground">100</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
