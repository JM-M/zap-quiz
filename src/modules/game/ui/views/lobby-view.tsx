import { Card, CardContent } from "@/components/ui/card";
import { getGame } from "../../server/actions";

interface LobbyViewProps {
  code: string;
}

export const LobbyView = async ({ code }: LobbyViewProps) => {
  const game = await getGame(code);

  if (!game) {
    return <div>Game not found</div>;
  }

  const { title } = game;

  const players = [
    {
      id: "1",
      name: "Player 1",
      isHost: true,
    },
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `player-${i + 2}`,
      name: `Player ${i + 2}`,
      isHost: false,
    })),
  ];

  return (
    <div className="app-container">
      <h2>{title}</h2>
      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => (
          <Card key={player.id} className="rounded-lg p-3">
            <CardContent className="p-0">{player.name}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
