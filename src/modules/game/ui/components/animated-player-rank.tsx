import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { GameGetGamePlayers, GameGetGamePlayersScores } from "../../types";

interface AnimatedPlayerRankProps {
  playerScore: GameGetGamePlayersScores[0];
  player: GameGetGamePlayers[0] | undefined;
  index: number;
  initialScore: number;
  hasScoreChanged: boolean;
}

export const AnimatedPlayerRank = ({
  playerScore,
  player,
  index,
  initialScore,
  hasScoreChanged,
}: AnimatedPlayerRankProps) => {
  const playerName = player?.name;

  return (
    <motion.div
      key={playerScore.playerId}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: index * 0.1,
        },
      }}
      exit={{
        opacity: 0,
        y: -20,
        scale: 0.9,
        transition: { duration: 0.2 },
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.6,
        },
      }}
      className="relative"
    >
      <Card className="gap-3 rounded-lg p-3">
        <CardContent className="flex items-center justify-between p-0">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
              {index + 1}
            </div>
            <span className="font-medium">{playerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              key={playerScore.totalScore}
              initial={
                hasScoreChanged
                  ? {
                      scale: 1.2,
                      color: "hsl(var(--accent))",
                      fontWeight: "bold",
                    }
                  : false
              }
              animate={{
                scale: 1,
                color: "hsl(var(--muted-foreground))",
                fontWeight: "normal",
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: hasScoreChanged ? 0.2 : 0,
              }}
              className="text-muted-foreground"
            >
              {playerScore.totalScore}
            </motion.span>
            {hasScoreChanged && (
              <motion.div
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-xs font-semibold text-green-600"
              >
                +{playerScore.totalScore - initialScore}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
