import { COUNTDOWN_TIME_SECS } from "@/constants";
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../../../hooks/use-socket";

interface CountdownState {
  isActive: boolean;
  currentNumber: number;
  remainingTime: number;
  duration: number;
}

interface GamePlayState {
  countdown: CountdownState;
  isConnected: boolean;
  error: string | null;
}

export const useGamePlay = ({ gameId }: { gameId: string }) => {
  const { socket, isConnected } = useSocket();
  const [gamePlayState, setGamePlayState] = useState<GamePlayState>({
    countdown: {
      isActive: false,
      currentNumber: COUNTDOWN_TIME_SECS, // TODO: Extract to a constant
      remainingTime: 0,
      duration: 0,
    },
    isConnected,
    error: null,
  });

  // Set up WebSocket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCountdownStart = (data: {
      gameId: string;
      duration: number;
      startTime: number;
      endTime: number;
    }) => {
      if (data.gameId !== gameId) return;

      setGamePlayState((prev) => ({
        ...prev,
        countdown: {
          isActive: true,
          currentNumber: data.duration,
          remainingTime: data.endTime - data.startTime,
          duration: data.duration,
        },
        error: null,
      }));
    };

    const handleCountdownTick = (data: {
      gameId: string;
      currentNumber: number;
      remainingTime: number;
    }) => {
      if (data.gameId !== gameId) return;

      setGamePlayState((prev) => ({
        ...prev,
        countdown: {
          ...prev.countdown,
          currentNumber: data.currentNumber,
          remainingTime: data.remainingTime,
        },
      }));
    };

    const handleCountdownEnd = (data: { gameId: string }) => {
      if (data.gameId !== gameId) return;

      setGamePlayState((prev) => ({
        ...prev,
        countdown: {
          ...prev.countdown,
          isActive: false,
          currentNumber: 0,
          remainingTime: 0,
        },
      }));
    };

    const handleError = (data: { message: string }) => {
      setGamePlayState((prev) => ({
        ...prev,
        error: data.message,
      }));
    };

    // Register event listeners
    socket.on("COUNTDOWN_START", handleCountdownStart);
    socket.on("COUNTDOWN_TICK", handleCountdownTick);
    socket.on("COUNTDOWN_END", handleCountdownEnd);
    socket.on("ERROR", handleError);

    // Cleanup
    return () => {
      socket.off("COUNTDOWN_START", handleCountdownStart);
      socket.off("COUNTDOWN_TICK", handleCountdownTick);
      socket.off("COUNTDOWN_END", handleCountdownEnd);
      socket.off("ERROR", handleError);
    };
  }, [socket, gameId]);

  // Update connection status
  useEffect(() => {
    setGamePlayState((prev) => ({
      ...prev,
      isConnected,
    }));
  }, [isConnected]);

  // Countdown control functions
  const startCountdown = useCallback(
    (duration: number) => {
      if (socket && gameId) {
        socket.emit("START_COUNTDOWN", {
          gameId,
          duration,
        });
      }
    },
    [socket, gameId],
  );

  const stopCountdown = useCallback(() => {
    if (socket && gameId) {
      socket.emit("STOP_COUNTDOWN", {
        gameId,
      });
    }
  }, [socket, gameId]);

  return {
    ...gamePlayState,
    startCountdown,
    stopCountdown,
  };
};
