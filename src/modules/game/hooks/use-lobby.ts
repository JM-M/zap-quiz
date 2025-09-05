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
  isActive: boolean;
}

interface LobbyState {
  players: Player[];
  gameId: string | null;
  player: Player | null;
  isLoading: boolean;
  error: string | null;
}

export const useLobby = (
  gameCode: string,
  playerName: string,
  userId?: string,
) => {
  const { socket, isConnected } = useSocket();
  const [lobbyState, setLobbyState] = useState<LobbyState>({
    players: [],
    gameId: null,
    player: null,
    isLoading: true,
    error: null,
  });

  // Join lobby when connected
  useEffect(() => {
    if (isConnected && socket && gameCode && playerName) {
      setLobbyState((prev) => ({ ...prev, isLoading: true, error: null }));

      socket.emit("JOIN_LOBBY", {
        gameCode,
        playerName,
        userId: userId || `user-${Date.now()}`,
      });
    }
  }, [isConnected, socket, gameCode, playerName, userId]);

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

    // Register event listeners
    socket.on("LOBBY_JOINED", handleLobbyJoined);
    socket.on("PLAYER_JOINED_LOBBY", handlePlayerJoinedLobby);
    socket.on("PLAYER_LEFT_LOBBY", handlePlayerLeftLobby);
    socket.on("LOBBY_ERROR", handleLobbyError);
    socket.on("LOBBY_PLAYERS", handleLobbyPlayers);

    // Cleanup
    return () => {
      socket.off("LOBBY_JOINED", handleLobbyJoined);
      socket.off("PLAYER_JOINED_LOBBY", handlePlayerJoinedLobby);
      socket.off("PLAYER_LEFT_LOBBY", handlePlayerLeftLobby);
      socket.off("LOBBY_ERROR", handleLobbyError);
      socket.off("LOBBY_PLAYERS", handleLobbyPlayers);
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

  return {
    ...lobbyState,
    isConnected,
    leaveLobby,
    refreshPlayers,
  };
};
