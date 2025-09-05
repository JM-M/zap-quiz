"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useJoinGame } from "../../hooks/use-join-game";

export const JoinView = () => {
  const { code } = useParams<{ code: string }>();
  const { joinGameMutation } = useJoinGame();

  useEffect(() => {
    joinGameMutation.mutate({ code });
  }, [code, joinGameMutation.mutate]);

  return;
};
