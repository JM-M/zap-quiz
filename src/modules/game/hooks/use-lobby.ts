import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../../../hooks/use-socket";

interface Player {
  id: string;
  gameId: string;
  name: string;
  userId: string;
  isHost: boolean;
  joinedAt: Date;
  leftAt?: Date;
}

interface LobbyState {
  players: Player[];
  gameId: string | null;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
}

export const useLobby = ({
  gameCode,
  playerName,
  userId,
}: {
  gameCode: string;
  playerName: string;
  userId?: string;
}) => {
  const { socket, isConnected } = useSocket();
  const router = useRouter();
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    players: [],
    gameId: null,
    player: null,
    isLoading: true,
    error: null,
  });

  // Join lobby when connected
  useEffect(() => {
    if (isConnected && socket && gameCode && playerName && userId) {
      setLobbyState((prev) => ({ ...prev, isLoading: true, error: null }));

      socket.emit("JOIN_LOBBY", {
        gameCode,
        playerName,
        userId,
      });
    }
  }, [isConnected, socket, gameCode, playerName, userId]);

  // Handle reconnection
  useEffect(() => {
    if (!socket) return;

    const handleReconnect = () => {
      // When reconnecting, try to rejoin the lobby if we were in one
      if (lobbyState.gameId && lobbyState.player) {
        socket.emit("JOIN_LOBBY", {
          gameCode,
          playerName,
          userId,
        });
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [
    socket,
    lobbyState.gameId,
    lobbyState.player,
    gameCode,
    playerName,
    userId,
  ]);

  // Because there is no difference between the lobby and the game itself, we don't need to leave the lobby on unmount
  // // Cleanup on unmount or when leaving lobby
  // useEffect(() => {
  //   return () => {
  //     // Leave lobby when component unmounts
  //     if (socket && lobbyState.gameId && lobbyState.player) {
  //       socket.emit("LEAVE_LOBBY", {
  //         gameId: lobbyState.gameId,
  //         playerId: lobbyState.player.id,
  //       });
  //     }
  //   };
  // }, [socket, lobbyState.gameId, lobbyState.player]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    const handleLobbyJoined = (data: {
      player: Player;
      players: Player[];
      gameId: string;
    }) => {
      setLobbyState({
        players: data.players,
        gameId: data.gameId,
        player: data.player,
        isLoading: false,
        error: null,
      });
    };

    const handlePlayerJoinedLobby = (data: {
      player: Player;
      players: Player[];
      gameId: string;
    }) => {
      setLobbyState((prev) => ({
        ...prev,
        players: data.players,
      }));
    };

    const handlePlayerLeftLobby = (data: {
      playerId: string;
      players: Player[];
      gameId: string;
    }) => {
      setLobbyState((prev) => ({
        ...prev,
        players: data.players,
      }));
    };

    const handleLobbyError = (data: { message: string }) => {
      setLobbyState((prev) => ({
        ...prev,
        isLoading: false,
        error: data.message,
      }));
    };

    const handleLobbyPlayers = (data: {
      players: Player[];
      gameId: string;
    }) => {
      setLobbyState((prev) => ({
        ...prev,
        players: data.players,
        gameId: data.gameId,
      }));
    };

    const handleGameStarted = (data: { gameId: string; startedAt: string }) => {
      // Navigate to game play view when game starts
      router.push(`/${gameCode}/play`);
    };

    // Register event listeners
    socket.on("LOBBY_JOINED", handleLobbyJoined);
    socket.on("PLAYER_JOINED_LOBBY", handlePlayerJoinedLobby);
    socket.on("PLAYER_LEFT_LOBBY", handlePlayerLeftLobby);
    socket.on("LOBBY_ERROR", handleLobbyError);
    socket.on("LOBBY_PLAYERS", handleLobbyPlayers);
    socket.on("GAME_STARTED", handleGameStarted);

    // Cleanup
    return () => {
      socket.off("LOBBY_JOINED", handleLobbyJoined);
      socket.off("PLAYER_JOINED_LOBBY", handlePlayerJoinedLobby);
      socket.off("PLAYER_LEFT_LOBBY", handlePlayerLeftLobby);
      socket.off("LOBBY_ERROR", handleLobbyError);
      socket.off("LOBBY_PLAYERS", handleLobbyPlayers);
      socket.off("GAME_STARTED", handleGameStarted);
    };
  }, [socket]);

  // Leave lobby function
  const leaveLobby = useCallback(() => {
    if (socket && lobbyState.gameId && lobbyState.player) {
      socket.emit("LEAVE_LOBBY", {
        gameId: lobbyState.gameId,
        playerId: lobbyState.player.id,
      });
    }
  }, [socket, lobbyState.gameId, lobbyState.player]);

  // Refresh players function
  const refreshPlayers = useCallback(() => {
    if (socket && lobbyState.gameId) {
      socket.emit("GET_LOBBY_PLAYERS", { gameId: lobbyState.gameId });
    }
  }, [socket, lobbyState.gameId]);

  // Start game function
  const startGame = useCallback(() => {
    if (socket && lobbyState.gameId && lobbyState.player?.isHost) {
      socket.emit("START_GAME", {
        gameId: lobbyState.gameId,
        hostId: lobbyState.player.userId,
      });
    }
  }, [socket, lobbyState.gameId, lobbyState.player]);

  return {
    ...lobbyState,
    isConnected,
    leaveLobby,
    refreshPlayers,
    startGame,
  };
};
