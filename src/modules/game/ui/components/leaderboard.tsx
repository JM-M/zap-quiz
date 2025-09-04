import { Card, CardContent } from "@/components/ui/card";

export const Leaderboard = () => {
  const leaderboard = Array.from({ length: 5 }, (_, index) => ({
    name: `Player ${index + 1}`,
    score: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="space-y-3">
      {leaderboard.map((player) => (
        <Card key={player.name} className="gap-3 rounded-lg p-3">
          <CardContent className="flex items-center justify-between p-0">
            <span className="font-medium">{player.name}</span>
            <span className="text-muted-foreground">{player.score}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
