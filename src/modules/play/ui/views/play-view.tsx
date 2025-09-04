"use client";

import { useState } from "react";
import { Countdown } from "../components/countdown";
import { Leaderboard } from "../components/leaderboard";
import { Quiz } from "../components/quiz";

export const PlayView = () => {
  const [screen, setScreen] = useState<"countdown" | "quiz" | "leaderboard">(
    "countdown",
  );

  return (
    <div className="app-container flex flex-1 flex-col">
      {screen === "countdown" && (
        <Countdown
          startFrom={5}
          countTo={0}
          onNumberReached={(number) => {
            if (number === 0) {
              setScreen("quiz");
            }
          }}
        />
      )}
      {screen === "quiz" && <Quiz />}
      {screen === "leaderboard" && <Leaderboard />}
    </div>
  );
};
